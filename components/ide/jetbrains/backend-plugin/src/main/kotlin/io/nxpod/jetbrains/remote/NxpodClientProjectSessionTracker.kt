// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.jetbrains.remote

import com.intellij.codeWithMe.ClientId
import com.intellij.ide.BrowserUtil
import com.intellij.notification.NotificationAction
import com.intellij.notification.NotificationType
import com.intellij.openapi.Disposable
import com.intellij.openapi.client.ClientSessionsManager
import com.intellij.openapi.components.service
import com.intellij.openapi.components.serviceOrNull
import com.intellij.openapi.diagnostic.thisLogger
import com.intellij.openapi.fileEditor.FileEditorManagerEvent
import com.intellij.openapi.fileEditor.FileEditorManagerListener
import com.intellij.openapi.fileTypes.LanguageFileType
import com.intellij.openapi.project.Project
import com.intellij.remoteDev.util.onTerminationOrNow
import com.intellij.util.application
import com.jetbrains.rd.util.lifetime.Lifetime
import io.nxpod.nxpodprotocol.api.entities.WorkspaceInstancePort
import io.nxpod.supervisor.api.Info
import io.nxpod.supervisor.api.Status
import io.nxpod.supervisor.api.Status.PortVisibility
import io.nxpod.supervisor.api.Status.PortsStatus
import io.nxpod.supervisor.api.StatusServiceGrpc
import io.grpc.stub.ClientCallStreamObserver
import io.grpc.stub.ClientResponseObserver
import kotlinx.coroutines.*
import kotlinx.coroutines.future.await
import java.util.*
import java.util.concurrent.CancellationException
import java.util.concurrent.CompletableFuture

@Suppress("UnstableApiUsage", "OPT_IN_USAGE")
class NxpodClientProjectSessionTracker(private val project: Project) : Disposable {

    private val manager = service<NxpodManager>()
    private val session = ClientSessionsManager.getProjectSession(project)

    private lateinit var info: Info.WorkspaceInfoResponse
    private val lifetime = Lifetime.Eternal.createNested()

    private val ignoredPortsForNotificationService = service<NxpodIgnoredPortsForNotificationService>()

    override fun dispose() {
        lifetime.terminate()
    }

    init {
        GlobalScope.launch {
            info = manager.pendingInfo.await()
            trackEvent("jb_session", mapOf())
            registerActiveLanguageAnalytics()
        }
    }

    private fun isExposedServedPort(port: PortsStatus?): Boolean {
        if (port === null) {
            return false
        }
        return port.served && port.hasExposed()
    }

    private fun getForwardedPortUrl(port: PortsStatus): String {
        val localHostUri = serviceOrNull<NxpodPortForwardingService>()
                ?.getLocalHostUriFromHostPort(port.localPort)
                ?: Optional.empty()

        return when {
            localHostUri.isPresent -> localHostUri.get().toString()
            else -> port.exposed.url
        }
    }

    private fun showOpenServiceNotification(port: PortsStatus, offerMakePublic: Boolean = false) {
        val message = "A service is available on port ${port.localPort}"
        val notification = manager.notificationGroup.createNotification(message, NotificationType.INFORMATION)

        val openBrowserAction = NotificationAction.createSimple("Open browser") {
            openBrowser(getForwardedPortUrl(port))
        }
        notification.addAction(openBrowserAction)

        if (offerMakePublic) {
            val makePublicLambda = {
                runBlocking {
                    makePortPublic(info.workspaceId, port)
                }
            }
            val makePublicAction = NotificationAction.createSimple("Make public", makePublicLambda)
            notification.addAction(makePublicAction)
        }

        ClientId.withClientId(session?.clientId) {
            notification.notify(null)
        }
    }

    private suspend fun makePortPublic(workspaceId: String, port: PortsStatus) {
        val p = WorkspaceInstancePort()
        p.port = port.localPort
        p.visibility = io.nxpod.nxpodprotocol.api.entities.PortVisibility.PUBLIC.toString()
        p.url = port.exposed.url

        try {
            manager.client.server.openPort(workspaceId, p).await()
        } catch (e: Exception) {
            thisLogger().error("nxpod: failed to open port ${port.localPort}: ", e)
        }
    }

    private fun openBrowser(url: String) {
        ClientId.withClientId(session?.clientId) {
            BrowserUtil.browse(url)
        }
    }

    private val portsObserveJob = GlobalScope.launch {
        if (application.isHeadlessEnvironment) {
            return@launch
        }

        val portsStatus = hashMapOf<Int, PortsStatus>()

        val status = StatusServiceGrpc.newStub(NxpodManager.supervisorChannel)
        while (isActive) {
            try {
                val f = CompletableFuture<Void>()
                status.portsStatus(
                        Status.PortsStatusRequest.newBuilder().setObserve(true).build(),
                        object : ClientResponseObserver<Status.PortsStatusRequest, Status.PortsStatusResponse> {

                            override fun beforeStart(requestStream: ClientCallStreamObserver<Status.PortsStatusRequest>) {
                                lifetime.onTerminationOrNow {
                                    requestStream.cancel(null, null)
                                }
                            }

                            override fun onNext(ps: Status.PortsStatusResponse) {
                                for (port in ps.portsList) {
                                    // Avoiding undesired notifications
                                    if (ignoredPortsForNotificationService.getIgnoredPorts().contains(port.localPort)) {
                                        continue
                                    }

                                    val previous = portsStatus[port.localPort]
                                    portsStatus[port.localPort] = port

                                    val shouldSendNotification = !isExposedServedPort(previous) && isExposedServedPort(port)

                                    if (shouldSendNotification) {
                                        if (port.exposed.onExposed.number == Status.OnPortExposedAction.ignore_VALUE) {
                                            continue
                                        }

                                        if (port.exposed.onExposed.number == Status.OnPortExposedAction.open_browser_VALUE || port.exposed.onExposed.number == Status.OnPortExposedAction.open_preview_VALUE) {
                                            openBrowser(getForwardedPortUrl(port))
                                            continue
                                        }

                                        if (port.exposed.onExposed.number == Status.OnPortExposedAction.notify_VALUE) {
                                            showOpenServiceNotification(port)
                                            continue
                                        }

                                        if (port.exposed.onExposed.number == Status.OnPortExposedAction.notify_private_VALUE) {
                                            showOpenServiceNotification(port, port.exposed.visibilityValue != PortVisibility.public_visibility_VALUE)
                                            continue
                                        }
                                    }
                                }
                            }

                            override fun onError(t: Throwable) {
                                f.completeExceptionally(t)
                            }

                            override fun onCompleted() {
                                f.complete(null)
                            }
                        })
                f.await()
            } catch (t: Throwable) {
                if (t is CancellationException) {
                    throw t
                }
                thisLogger().error("nxpod: failed to stream ports status: ", t)
            }
            delay(1000L)
        }
    }

    init {
        lifetime.onTerminationOrNow {
            portsObserveJob.cancel()
        }
    }

    private fun registerActiveLanguageAnalytics() {
        val activeLanguages = mutableSetOf<String>()
        project.messageBus.connect().subscribe(FileEditorManagerListener.FILE_EDITOR_MANAGER, object : FileEditorManagerListener {
            override fun selectionChanged(event: FileEditorManagerEvent) {
                super.selectionChanged(event)
                if (event.manager.selectedEditor == null) {
                    return
                }
                val file = event.manager.selectedEditor!!.file
                val ext = file.extension
                val fileType = file.fileType
                var lang = "plaintext"
                if (fileType is LanguageFileType) {
                    lang = fileType.language.id
                }
                if (activeLanguages.contains(lang)) {
                    return
                }
                activeLanguages.add(lang)
                trackEvent("jb_active_language", mapOf("lang" to lang, "ext" to ext))
            }
        })
    }

    private fun trackEvent(eventName: String, props: Map<String, Any?>) {
        if (session == null) return
        manager.trackEvent(eventName, mapOf(
                "sessionId" to session.clientId.value
        ).plus(props))
    }
}

// Copyright (c) 2022 Nxpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License.AGPL.txt in the project root for license information.

package io.nxpod.jetbrains.remote

import com.intellij.ide.BrowserUtil
import com.intellij.ide.plugins.PluginManagerCore
import com.intellij.notification.NotificationAction
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.Disposable
import com.intellij.openapi.application.ApplicationInfo
import com.intellij.openapi.components.Service
import com.intellij.openapi.diagnostic.thisLogger
import com.intellij.openapi.extensions.PluginId
import com.intellij.openapi.util.LowMemoryWatcher
import com.intellij.remoteDev.util.onTerminationOrNow
import com.intellij.util.application
import com.intellij.util.net.ssl.CertificateManager
import com.intellij.util.proxy.CommonProxy
import com.jetbrains.rd.util.lifetime.Lifetime
import git4idea.config.GitVcsApplicationSettings
import io.nxpod.nxpodprotocol.api.NxpodClient
import io.nxpod.nxpodprotocol.api.NxpodServerLauncher
import io.nxpod.nxpodprotocol.api.entities.RemoteTrackMessage
import io.nxpod.jetbrains.remote.services.HeartbeatService
import io.nxpod.jetbrains.remote.utils.Retrier.retry
import io.nxpod.supervisor.api.*
import io.nxpod.supervisor.api.Info.WorkspaceInfoResponse
import io.nxpod.supervisor.api.Notification.*
import io.grpc.ManagedChannel
import io.grpc.ManagedChannelBuilder
import io.grpc.stub.ClientCallStreamObserver
import io.grpc.stub.ClientResponseObserver
import io.prometheus.client.CollectorRegistry
import io.prometheus.client.Counter
import io.prometheus.client.Gauge
import io.prometheus.client.exporter.PushGateway
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.future.await
import kotlinx.coroutines.guava.asDeferred
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.jetbrains.ide.BuiltInServerManager
import java.net.URI
import java.net.URL
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.util.concurrent.CancellationException
import java.util.concurrent.CompletableFuture
import javax.websocket.DeploymentException

@Suppress("UnstableApiUsage", "OPT_IN_USAGE")
@Service
class NxpodManager : Disposable {

    companion object {
        // there should be only one channel per an application to avoid memory leak
        val supervisorChannel: ManagedChannel = ManagedChannelBuilder.forTarget("localhost:22999").usePlaintext().build()
    }

    val devMode = System.getenv("JB_DEV").toBoolean()
    private val backendKind = System.getenv("JETBRAINS_NXPOD_BACKEND_KIND") ?: "unknown"
    private val backendQualifier = System.getenv("JETBRAINS_BACKEND_QUALIFIER") ?: "unknown"

    private val lifetime = Lifetime.Eternal.createNested()

    override fun dispose() {
        lifetime.terminate()
    }

    val registry = CollectorRegistry()

    init {
        // Rate of low memory after GC notifications in the last 5 minutes:
        // rate(nxpod_jb_backend_low_memory_after_gc_total[5m])
        val lowMemoryCounter = Counter.build()
            .name("nxpod_jb_backend_low_memory_after_gc")
            .help("Low memory notifications after GC")
            .labelNames("product", "qualifier")
            .register(registry)
        LowMemoryWatcher.register({
            lowMemoryCounter.labels(backendKind, backendQualifier).inc()
         }, LowMemoryWatcher.LowMemoryWatcherType.ONLY_AFTER_GC, this)
    }

    init {
        val monitoringJob = GlobalScope.launch {
            if (application.isHeadlessEnvironment) {
                return@launch
            }
            val pg = if(devMode) null else PushGateway("localhost:22999")
            // Heap usage at any time in the last 5 minutes:
            // max_over_time(nxpod_jb_backend_memory_used_bytes[5m:])/max_over_time(nxpod_jb_backend_memory_max_bytes[5m:])
            val allocatedGauge = Gauge.build()
                .name("nxpod_jb_backend_memory_max_bytes")
                .help("Total allocated memory of JB backend in bytes.")
                .labelNames("product", "qualifier")
                .register(registry)
            val usedGauge = Gauge.build()
                .name("nxpod_jb_backend_memory_used_bytes")
                .help("Used memory of JB backend in bytes.")
                .labelNames("product", "qualifier")
                .register(registry)

            while (isActive) {
                val totalMemory = Runtime.getRuntime().totalMemory()
                allocatedGauge.labels(backendKind, backendQualifier).set(totalMemory.toDouble())
                val usedMemory = (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory())
                usedGauge.labels(backendKind, backendQualifier).set(usedMemory.toDouble())
                try {
                    pg?.push(registry, "jb_backend")
                } catch (t: Throwable) {
                    thisLogger().error("nxpod: failed to push monitoring metrics:", t)
                }
                delay(5000)
            }
        }
        lifetime.onTerminationOrNow { monitoringJob.cancel() }
    }

    init {
        GlobalScope.launch {
            if (application.isHeadlessEnvironment) {
                return@launch
            }
            try {
                val backendPort = BuiltInServerManager.getInstance().waitForStart().port
                val httpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.ALWAYS)
                    .connectTimeout(Duration.ofSeconds(5))
                    .build()
                val httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:24000/gatewayLink?backendPort=$backendPort"))
                    .GET()
                    .build()
                val response =
                    httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString())
                if (response.statusCode() == 200) {
                    val gatewayLink = response.body()
                    // the output format should be constant (includes `Nxpod gateway link`)
                    // which will be checked in integration test gateway_test.go
                    thisLogger().warn(
                        "\n\n\n*********************************************************\n\n" +
                                "Nxpod gateway link: $gatewayLink" +
                                "\n\n*********************************************************\n\n\n"
                    )
                } else {
                    throw Exception("" + response.statusCode())
                }
            } catch (t: Throwable) {
                thisLogger().error("nxpod: failed to resolve gateway link:", t)
            }
        }
    }

    init {
        GitVcsApplicationSettings.getInstance().isUseCredentialHelper = true
    }

    val notificationGroup = NotificationGroupManager.getInstance().getNotificationGroup("Nxpod Notifications")
    private val notificationsJob = GlobalScope.launch {
        if (application.isHeadlessEnvironment) {
            return@launch
        }
        val notifications = NotificationServiceGrpc.newStub(supervisorChannel)
        val futureNotifications = NotificationServiceGrpc.newFutureStub(supervisorChannel)
        while (isActive) {
            try {
                val f = CompletableFuture<Void>()
                notifications.subscribe(
                    SubscribeRequest.newBuilder().build(),
                    object : ClientResponseObserver<SubscribeRequest, SubscribeResponse> {

                        override fun beforeStart(requestStream: ClientCallStreamObserver<SubscribeRequest>) {
                            // TODO(ak): actually should be bound to cancellation of notifications job
                            lifetime.onTerminationOrNow {
                                requestStream.cancel(null, null)
                            }
                        }

                        override fun onNext(n: SubscribeResponse) {
                            val request = n.request
                            val type = when (request.level) {
                                NotifyRequest.Level.ERROR -> NotificationType.ERROR
                                NotifyRequest.Level.WARNING -> NotificationType.WARNING
                                else -> NotificationType.INFORMATION
                            }
                            val notification = notificationGroup.createNotification(request.message, type)
                            for (action in request.actionsList) {
                                notification.addAction(NotificationAction.createSimpleExpiring(action) {
                                    futureNotifications.respond(
                                        RespondRequest.newBuilder()
                                            .setRequestId(n.requestId)
                                            .setResponse(NotifyResponse.newBuilder().setAction(action).build())
                                            .build()
                                    )
                                })
                            }
                            notification.notify(null)
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
                thisLogger().error("nxpod: failed to stream notifications: ", t)
            }
            delay(1000L)
        }
    }
    init {
        lifetime.onTerminationOrNow {
            notificationsJob.cancel()
        }
    }

    var infoResponse: WorkspaceInfoResponse? = null
    val pendingInfo = CompletableFuture<WorkspaceInfoResponse>()

    private val infoJob = GlobalScope.launch {
        if (application.isHeadlessEnvironment) {
            return@launch
        }
        try {
            // TODO(ak) replace retry with proper handling of grpc errors
            infoResponse = retry(3) {
                InfoServiceGrpc
                        .newFutureStub(supervisorChannel)
                        .workspaceInfo(Info.WorkspaceInfoRequest.newBuilder().build())
                        .asDeferred()
                        .await()
            }
            pendingInfo.complete(infoResponse)
        } catch (t: Throwable) {
            pendingInfo.completeExceptionally(t)
        }
    }
    init {
        lifetime.onTerminationOrNow {
            infoJob.cancel()
        }
    }

    val client = NxpodClient()
    private val serverJob = GlobalScope.launch {
        val info = pendingInfo.await()

        // TODO(ak) replace retry with proper handling of grpc errors
        val tokenResponse = retry(3) {
            val request = Token.GetTokenRequest.newBuilder()
                    .setHost(info.nxpodApi.host)
                    .addScope("function:openPort")
                    .addScope("function:sendHeartBeat")
                    .addScope("function:setWorkspaceTimeout")
                    .addScope("function:stopWorkspace")
                    .addScope("function:takeSnapshot")
                    .addScope("function:trackEvent")
                    .setKind("nxpod")
                    .build()

            TokenServiceGrpc
                    .newFutureStub(supervisorChannel)
                    .getToken(request)
                    .asDeferred()
                    .await()
        }

        val launcher = NxpodServerLauncher.create(client)
        val plugin = PluginManagerCore.getPlugin(PluginId.getId("io.nxpod.jetbrains.remote"))!!
        val connect = {
            val originalClassLoader = Thread.currentThread().contextClassLoader
            try {
                val proxies = CommonProxy.getInstance().select(URL(info.nxpodHost))
                val sslContext = CertificateManager.getInstance().sslContext

                // see https://intellij-support.jetbrains.com/hc/en-us/community/posts/360003146180/comments/360000376240
                Thread.currentThread().contextClassLoader = HeartbeatService::class.java.classLoader

                launcher.listen(
                        info.nxpodApi.endpoint,
                        info.nxpodHost,
                        plugin.pluginId.idString,
                        plugin.version,
                        tokenResponse.token,
                        proxies,
                        sslContext
                )
            } finally {
                Thread.currentThread().contextClassLoader = originalClassLoader
            }
        }

        val minReconnectionDelay = 2 * 1000L
        val maxReconnectionDelay = 30 * 1000L
        val reconnectionDelayGrowFactor = 1.5
        var reconnectionDelay = minReconnectionDelay
        val nxpodHost = info.nxpodApi.host
        var closeReason: Any = "cancelled"
        try {
            while (kotlin.coroutines.coroutineContext.isActive) {
                try {
                    val connection = connect()
                    thisLogger().info("$nxpodHost: connected")
                    reconnectionDelay = minReconnectionDelay
                    closeReason = connection.await()
                    thisLogger().warn("$nxpodHost: connection closed, reconnecting after $reconnectionDelay milliseconds: $closeReason")
                } catch (t: Throwable) {
                    if (t is DeploymentException) {
                        // connection is alright, but server does not want to handshake, there is no point to try with the same token again
                        throw t
                    }
                    closeReason = t
                    thisLogger().warn(
                            "$nxpodHost: failed to connect, trying again after $reconnectionDelay milliseconds:",
                            closeReason
                    )
                }
                delay(reconnectionDelay)
                closeReason = "cancelled"
                reconnectionDelay = (reconnectionDelay * reconnectionDelayGrowFactor).toLong()
                if (reconnectionDelay > maxReconnectionDelay) {
                    reconnectionDelay = maxReconnectionDelay
                }
            }
        } catch (t: Throwable) {
            if (t !is CancellationException) {
                closeReason = t
            }
        }
        thisLogger().warn("$nxpodHost: connection permanently closed: $closeReason")
    }
    init {
        lifetime.onTerminationOrNow {
            serverJob.cancel()
        }
    }

    private val versionName = ApplicationInfo.getInstance().versionName
    private val fullVersion = ApplicationInfo.getInstance().fullVersion

    fun trackEvent(eventName: String, props: Map<String, Any?>) {
        val timestamp = System.currentTimeMillis()
        GlobalScope.launch {
            val info = pendingInfo.await()
            val event = RemoteTrackMessage().apply {
                event = eventName
                properties = mapOf(
                        "instanceId" to info.instanceId,
                        "workspaceId" to info.workspaceId,
                        "appName" to versionName,
                        "appVersion" to fullVersion,
                        "timestamp" to timestamp,
                        "product" to backendKind,
                        "qualifier" to backendQualifier
                ).plus(props)
            }
            if (devMode) {
                thisLogger().warn("nxpod: $event")
            } else {
                client.server.trackEvent(event)
            }
        }
    }

    var resourceStatus: Status.ResourcesStatusResponse? = null

    private val metricsJob = GlobalScope.launch {
        if (application.isHeadlessEnvironment) {
            return@launch
        }
        val status = StatusServiceGrpc.newFutureStub(supervisorChannel)
        while (isActive) {
            try {
                val f = status.resourcesStatus(Status.ResourcesStatuRequest.getDefaultInstance())
                resourceStatus = f.asDeferred().await()
            } catch (t: Throwable) {
                if (t is CancellationException) {
                    throw t
                }
                thisLogger().error("nxpod: failed to retrieve resource status: ", t)
            }
            delay(1000L)
        }
    }
    init {
        lifetime.onTerminationOrNow {
            metricsJob.cancel()
        }
    }

    /** Opens the give URL in the Browser and records an event indicating it was open from a custom IntelliJ Action. */
    fun openUrlFromAction(url: String) {
        trackEvent("jb_execute_command_nxpod_open_link", mapOf("url" to url))
        BrowserUtil.browse(url)
    }
}

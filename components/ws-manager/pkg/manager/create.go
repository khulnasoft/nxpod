// Copyright (c) 2020 TypeFox GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package manager

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"path/filepath"
	"reflect"
	"strconv"
	"strings"
	"time"

	wsk8s "github.com/khulnasoft/nxpod/common-go/kubernetes"
	"github.com/khulnasoft/nxpod/common-go/tracing"
	regapi "github.com/khulnasoft/nxpod/registry-facade/api"
	"github.com/khulnasoft/nxpod/ws-manager/api"

	"github.com/golang/protobuf/proto"
	"github.com/imdario/mergo"
	"github.com/opentracing/opentracing-go"
	"golang.org/x/xerrors"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

// Protobuf structures often require pointer to boolean values (as that's Go's best means of expression optionallity).
var (
	boolFalse = false
	boolTrue  = true
)

// createWorkspacePod creates the actual workspace pod based on the definite workspace pod and appropriate
// templates. The result of this function is not expected to be modified prior to being passed to Kubernetes.
func (m *Manager) createWorkspacePod(startContext *startWorkspaceContext) (*corev1.Pod, error) {
	podTemplate, err := getWorkspacePodTemplate(m.Config.WorkspacePodTemplate.DefaultPath)
	if err != nil {
		return nil, xerrors.Errorf("cannot read pod template - this is a configuration problem: %w", err)
	}
	var typeSpecificTpl *corev1.Pod
	switch startContext.Request.Type {
	case api.WorkspaceType_REGULAR:
		typeSpecificTpl, err = getWorkspacePodTemplate(m.Config.WorkspacePodTemplate.RegularPath)
	case api.WorkspaceType_PREBUILD:
		typeSpecificTpl, err = getWorkspacePodTemplate(m.Config.WorkspacePodTemplate.PrebuildPath)
	case api.WorkspaceType_PROBE:
		typeSpecificTpl, err = getWorkspacePodTemplate(m.Config.WorkspacePodTemplate.ProbePath)
	}
	if err != nil {
		return nil, xerrors.Errorf("cannot read type-specific pod template - this is a configuration problem: %w", err)
	}
	if typeSpecificTpl != nil {
		err = combineDefiniteWorkspacePodWithTemplate(podTemplate, typeSpecificTpl)
		if err != nil {
			return nil, xerrors.Errorf("cannot apply type-specific pod template: %w", err)
		}
	}

	pod, err := m.createDefiniteWorkspacePod(startContext)
	if err != nil {
		return nil, xerrors.Errorf("cannot create definite workspace pod: %w", err)
	}
	err = combineDefiniteWorkspacePodWithTemplate(pod, podTemplate)
	if err != nil {
		return nil, xerrors.Errorf("cannot create workspace pod: %w", err)
	}
	return pod, nil
}

// combineDefiniteWorkspacePodWithTemplate merges a definite workspace pod with a user-provided template.
// In essence this function just calls mergo, but we need to make sure we use the right flags (and that we can test the right flags).
func combineDefiniteWorkspacePodWithTemplate(pod *corev1.Pod, template *corev1.Pod) error {
	if template == nil {
		return nil
	}
	if pod == nil {
		return xerrors.Errorf("definite pod cannot be nil")
	}

	err := mergo.Merge(pod, template, mergo.WithAppendSlice, mergo.WithTransformers(&mergePodTransformer{}))
	if err != nil {
		return xerrors.Errorf("cannot merge workspace pod with template: %w", err)
	}

	return nil
}

// mergePodTransformer is a mergo transformer which facilitates merging of NodeAffinity and containers
type mergePodTransformer struct{}

func (*mergePodTransformer) Transformer(typ reflect.Type) func(dst, src reflect.Value) error {
	switch typ {
	case reflect.TypeOf([]corev1.NodeSelectorTerm{}):
		return mergeNodeAffinityMatchExpressions
	case reflect.TypeOf([]corev1.Container{}):
		return mergeContainer
	case reflect.TypeOf(&corev1.Probe{}):
		return mergeProbe
	}

	return nil
}

// mergeContainer merges cnotainers by name
func mergeContainer(dst, src reflect.Value) (err error) {
	// working with reflection is tricky business - add a safety net here and recover if things go sideways
	defer func() {
		r := recover()
		if er, ok := r.(error); r != nil && ok {
			err = er
		}
	}()

	if !dst.CanSet() || !src.CanSet() {
		return nil
	}

	srcs := src.Interface().([]corev1.Container)
	dsts := dst.Interface().([]corev1.Container)

	for _, s := range srcs {
		di := -1
		for i, d := range dsts {
			if d.Name == s.Name {
				di = i
				break
			}
		}
		if di < 0 {
			// We don't have a matching destination container to merge this src one into
			continue
		}

		err = mergo.Merge(&dsts[di], s, mergo.WithAppendSlice, mergo.WithOverride, mergo.WithTransformers(&mergePodTransformer{}))
		if err != nil {
			return err
		}
	}

	dst.Set(reflect.ValueOf(dsts))
	return nil
}

// mergeNodeAffinityMatchExpressions ensures that NodeAffinityare AND'ed
func mergeNodeAffinityMatchExpressions(dst, src reflect.Value) (err error) {
	// working with reflection is tricky business - add a safety net here and recover if things go sideways
	defer func() {
		r := recover()
		if er, ok := r.(error); r != nil && ok {
			err = er
		}
	}()

	if !dst.CanSet() || !src.CanSet() {
		return nil
	}

	srcs := src.Interface().([]corev1.NodeSelectorTerm)
	dsts := dst.Interface().([]corev1.NodeSelectorTerm)

	if len(dsts) > 1 {
		// we only run this mechanism if it's clear where we merge into
		return nil
	}
	if len(dsts) == 0 {
		dsts = srcs
	} else {
		for _, term := range srcs {
			dsts[0].MatchExpressions = append(dsts[0].MatchExpressions, term.MatchExpressions...)
		}
	}
	dst.Set(reflect.ValueOf(dsts))

	return nil
}

func mergeProbe(dst, src reflect.Value) (err error) {
	// working with reflection is tricky business - add a safety net here and recover if things go sideways
	defer func() {
		r := recover()
		if er, ok := r.(error); r != nil && ok {
			err = er
		}
	}()

	srcs := src.Interface().(*corev1.Probe)
	dsts := dst.Interface().(*corev1.Probe)

	if dsts != nil && srcs == nil {
		// don't overwrite with nil
	} else if dsts == nil && srcs != nil {
		// we don't have anything at dst yet - take the whole src
		*dsts = *srcs
	} else {
		dsts.HTTPGet = srcs.HTTPGet
		dsts.Exec = srcs.Exec
		dsts.TCPSocket = srcs.TCPSocket
	}

	// *srcs = *dsts
	return nil
}

// createDefiniteWorkspacePod creates a workspace pod without regard for any template.
// The result of this function can be deployed and it would work.
func (m *Manager) createDefiniteWorkspacePod(startContext *startWorkspaceContext) (*corev1.Pod, error) {
	req := startContext.Request
	workspaceContainer, err := m.createWorkspaceContainer(startContext)
	if err != nil {
		return nil, xerrors.Errorf("cannot create workspace container: %w", err)
	}
	theiaVolume, workspaceVolume, err := m.createWorkspaceVolumes(startContext)
	if err != nil {
		return nil, xerrors.Errorf("cannot create workspace volumes: %w", err)
	}

	labels := make(map[string]string)
	labels["nxpod.khulnasoft.com/networkpolicy"] = "default"
	for k, v := range startContext.Labels {
		labels[k] = v
	}
	theiaVersionLabel := fmt.Sprintf(theiaVersionLabelFmt, req.Spec.TheiaVersion)

	initCfg, err := proto.Marshal(startContext.Request.Spec.Initializer)
	if err != nil {
		return nil, xerrors.Errorf("cannot create remarshal initializer: %w", err)
	}
	initializerConfig := base64.StdEncoding.EncodeToString(initCfg)

	admissionLevel, ok := api.AdmissionLevel_name[int32(req.Spec.Admission)]
	if !ok {
		return nil, xerrors.Errorf("invalid admission level")
	}
	admissionLevel = strings.ToLower(admissionLevel)

	var prefix string
	switch req.Type {
	case api.WorkspaceType_PREBUILD:
		prefix = "prebuild"
	case api.WorkspaceType_PROBE:
		prefix = "probe"
	default:
		prefix = "ws"
	}

	annotations := map[string]string{
		"prometheus.io/scrape":         "true",
		"prometheus.io/path":           "/metrics",
		"prometheus.io/port":           strconv.Itoa(int(startContext.TheiaPort)),
		workspaceIDAnnotation:          req.Id,
		servicePrefixAnnotation:        getServicePrefix(req),
		workspaceURLAnnotation:         startContext.WorkspaceURL,
		workspaceInitializerAnnotation: initializerConfig,
		workspaceNeverReadyAnnotation:  "true",
		workspaceAdmissionAnnotation:   admissionLevel,
		ownerTokenAnnotation:           startContext.OwnerToken,
		wsk8s.TraceIDAnnotation:        startContext.TraceID,
	}
	if req.Spec.Timeout != "" {
		_, err := time.ParseDuration(req.Spec.Timeout)
		if err != nil {
			return nil, xerrors.Errorf("invalid workspace timeout \"%s\": %w", req.Spec.Timeout, err)
		}
		annotations[customTimeoutAnnotation] = req.Spec.Timeout
	}

	// By default we embue our workspace pods with some tolerance towards pressure taints,
	// see https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/#taint-based-evictions
	// for more details. As hope/assume that the pressure might go away in this time.
	// Memory and Disk pressure are no reason to stop a workspace - instead of stopping a workspace
	// we'd rather wait things out or gracefully fail the workspace ourselves.
	var perssureToleranceSeconds int64 = 30

	pod := corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:        fmt.Sprintf("%s-%s", prefix, req.Id),
			Labels:      labels,
			Annotations: annotations,
		},
		Spec: corev1.PodSpec{
			Affinity: &corev1.Affinity{
				NodeAffinity: &corev1.NodeAffinity{
					RequiredDuringSchedulingIgnoredDuringExecution: &corev1.NodeSelector{
						NodeSelectorTerms: []corev1.NodeSelectorTerm{
							{
								MatchExpressions: []corev1.NodeSelectorRequirement{
									{
										Key:      theiaVersionLabel,
										Operator: corev1.NodeSelectorOpExists,
									},
									{
										Key:      wssyncLabel,
										Operator: corev1.NodeSelectorOpExists,
									},
								},
							},
						},
					},
				},
			},
			AutomountServiceAccountToken: &boolFalse,
			ServiceAccountName:           "workspace",
			SchedulerName:                m.Config.SchedulerName,
			EnableServiceLinks:           &boolFalse,
			Containers: []corev1.Container{
				*workspaceContainer,
			},
			Volumes: []corev1.Volume{
				theiaVolume,
				workspaceVolume,
			},
			Tolerations: []corev1.Toleration{
				{
					Key:      "node.kubernetes.io/disk-pressure",
					Operator: "Exists",
					Effect:   "NoExecute",
					// Tolarate Indefinitely
				},
				{
					Key:      "node.kubernetes.io/memory-pressure",
					Operator: "Exists",
					Effect:   "NoExecute",
					// Tolarate Indefinitely
				},
				{
					Key:               "node.kubernetes.io/network-unavailable",
					Operator:          "Exists",
					Effect:            "NoExecute",
					TolerationSeconds: &perssureToleranceSeconds,
				},
			},
		},
	}

	for _, feature := range startContext.Request.Spec.FeatureFlags {
		switch feature {
		case api.WorkspaceFeatureFlag_PRIVILEGED:
			// privileged workspaces get a different security contex and a service account that allows that context to take effect.
			workspaceContainer.SecurityContext.AllowPrivilegeEscalation = &boolTrue
			workspaceContainer.SecurityContext.Privileged = &boolTrue
			pod.Spec.ServiceAccountName = "workspace-privileged"
		case api.WorkspaceFeatureFlag_FULL_WORKSPACE_BACKUP:
			removeVolume(&pod, workspaceVolumeName)
			pod.Labels[fullWorkspaceBackupAnnotation] = "true"
			pod.Annotations[fullWorkspaceBackupAnnotation] = "true"
			for i, c := range pod.Spec.Containers {
				if c.Name != "workspace" {
					continue
				}

				pod.Spec.Containers[i].Lifecycle = &corev1.Lifecycle{
					PreStop: &corev1.Handler{
						Exec: &corev1.ExecAction{
							Command: []string{"/theia/supervisor", "backup"},
						},
					},
				}
			}
			fallthrough
		case api.WorkspaceFeatureFlag_REGISTRY_FACADE:
			removeVolume(&pod, theiaVolumeName)

			spec := regapi.ImageSpec{
				BaseRef:      startContext.Request.Spec.WorkspaceImage,
				TheiaVersion: startContext.Request.Spec.TheiaVersion,
			}
			ispec, err := spec.ToBase64()
			if err != nil {
				return nil, xerrors.Errorf("cannot create remarshal image spec: %w", err)
			}
			annotations[workspaceImageSpecAnnotation] = ispec

			image := fmt.Sprintf("%s/%s/%s", m.Config.RegistryFacadeHost, regapi.ProviderPrefixRemote, startContext.Request.Id)
			for i, c := range pod.Spec.Containers {
				if c.Name == "workspace" {
					pod.Spec.Containers[i].Image = image
				}
			}

			nst := pod.Spec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution.NodeSelectorTerms
			for i, term := range nst {
				nt := term.MatchExpressions[:0]
				for _, expr := range term.MatchExpressions {
					if strings.HasPrefix(expr.Key, "nxpod.khulnasoft.com/theia.") {
						continue
					}
					nt = append(nt, expr)
				}
				nst[i].MatchExpressions = nt
			}
			pod.Spec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution.NodeSelectorTerms = nst

		case api.WorkspaceFeatureFlag_FIXED_RESOURCES:
			var cpuLimit string
			for _, c := range pod.Spec.Containers {
				if c.Name != "workspace" {
					continue
				}
				cpuLimit = c.Resources.Limits.Cpu().String()
			}
			pod.Annotations[wsk8s.CPULimitAnnotation] = cpuLimit

		case api.WorkspaceFeatureFlag_NOOP:

		default:
			return nil, xerrors.Errorf("unknown feature flag: %v", feature)
		}
	}

	return &pod, nil
}

func removeVolume(pod *corev1.Pod, name string) {
	var vols []corev1.Volume
	for _, v := range pod.Spec.Volumes {
		if v.Name == name {
			continue
		}
		vols = append(vols, v)
	}
	pod.Spec.Volumes = vols

	for i, c := range pod.Spec.Containers {
		var mounts []corev1.VolumeMount
		for _, v := range c.VolumeMounts {
			if v.Name == name {
				continue
			}
			mounts = append(mounts, v)
		}
		pod.Spec.Containers[i].VolumeMounts = mounts
	}
}

func (m *Manager) createWorkspaceContainer(startContext *startWorkspaceContext) (*corev1.Container, error) {
	limits, err := m.Config.Container.Workspace.Limits.ResourceList()
	if err != nil {
		return nil, xerrors.Errorf("cannot parse Workspace container limits: %w", err)
	}
	requests, err := m.Config.Container.Workspace.Requests.ResourceList()
	if err != nil {
		return nil, xerrors.Errorf("cannot parse Workspace container requests: %w", err)
	}
	env, err := m.createWorkspaceEnvironment(startContext)
	if err != nil {
		return nil, xerrors.Errorf("cannot create Workspace env: %w", err)
	}
	sec, err := m.createDefaultSecurityContext()
	if err != nil {
		return nil, xerrors.Errorf("cannot create Theia env: %w", err)
	}
	mountPropagation := corev1.MountPropagationHostToContainer

	return &corev1.Container{
		Name:            "workspace",
		Image:           startContext.Request.Spec.WorkspaceImage,
		SecurityContext: sec,
		ImagePullPolicy: corev1.PullAlways,
		Ports: []corev1.ContainerPort{
			{ContainerPort: startContext.TheiaPort},
		},
		Resources: corev1.ResourceRequirements{
			Limits:   limits,
			Requests: requests,
		},
		VolumeMounts: []corev1.VolumeMount{
			{
				Name:             workspaceVolumeName,
				MountPath:        workspaceDir,
				ReadOnly:         false,
				MountPropagation: &mountPropagation,
			},
			{
				Name:      theiaVolumeName,
				MountPath: theiaDir,
				ReadOnly:  true,
			},
		},
		ReadinessProbe: &corev1.Probe{
			Handler: corev1.Handler{
				HTTPGet: &corev1.HTTPGetAction{
					Path:   "/",
					Port:   intstr.FromInt((int)(startContext.TheiaSupervisorPort)),
					Scheme: corev1.URISchemeHTTP,
				},
			},
			// We make the readiness probe more difficult to fail than the liveness probe.
			// This way, if the workspace really has a problem it will be shut down by Kubernetes rather than end up in
			// some undefined state.
			FailureThreshold: 600,
			PeriodSeconds:    1,
			SuccessThreshold: 1,
			TimeoutSeconds:   1,
		},
		Env: env,
	}, nil
}

func (m *Manager) createWorkspaceEnvironment(startContext *startWorkspaceContext) ([]corev1.EnvVar, error) {
	spec := startContext.Request.Spec

	getWorkspaceRelativePath := func(segment string) string {
		return filepath.Join("/workspace", segment)
	}

	// Envs that start with NXPOD_ are appended to the Terminal environments
	result := []corev1.EnvVar{}
	result = append(result, corev1.EnvVar{Name: "NXPOD_REPO_ROOT", Value: getWorkspaceRelativePath(spec.CheckoutLocation)})
	result = append(result, corev1.EnvVar{Name: "NXPOD_CLI_APITOKEN", Value: startContext.CLIAPIKey})
	result = append(result, corev1.EnvVar{Name: "NXPOD_WORKSPACE_ID", Value: startContext.Request.Metadata.MetaId})
	result = append(result, corev1.EnvVar{Name: "NXPOD_INSTANCE_ID", Value: startContext.Request.Id})
	result = append(result, corev1.EnvVar{Name: "NXPOD_THEIA_PORT", Value: strconv.Itoa(int(startContext.TheiaPort))})
	result = append(result, corev1.EnvVar{Name: "THEIA_WORKSPACE_ROOT", Value: getWorkspaceRelativePath(spec.WorkspaceLocation)})
	result = append(result, corev1.EnvVar{Name: "NXPOD_HOST", Value: m.Config.NxpodHostURL})
	result = append(result, corev1.EnvVar{Name: "NXPOD_WORKSPACE_URL", Value: startContext.WorkspaceURL})
	result = append(result, corev1.EnvVar{Name: "THEIA_SUPERVISOR_TOKEN", Value: m.Config.TheiaSupervisorToken})
	result = append(result, corev1.EnvVar{Name: "THEIA_SUPERVISOR_ENDPOINT", Value: fmt.Sprintf(":%d", startContext.TheiaSupervisorPort)})
	result = append(result, corev1.EnvVar{Name: "THEIA_WEBVIEW_EXTERNAL_ENDPOINT", Value: "webview-{{hostname}}"})

	// We don't require that Git be configured for workspaces
	if spec.Git != nil {
		result = append(result, corev1.EnvVar{Name: "NXPOD_GIT_USER_NAME", Value: spec.Git.Username})
		result = append(result, corev1.EnvVar{Name: "NXPOD_GIT_USER_EMAIL", Value: spec.Git.Email})
	}

	// User-defined env vars (i.e. those coming from the request)
	if spec.Envvars != nil {
		for _, e := range spec.Envvars {
			if e.Name == "NXPOD_TASKS" || e.Name == "NXPOD_RESOLVED_EXTENSIONS" {
				result = append(result, corev1.EnvVar{Name: e.Name, Value: e.Value})
				continue
			} else if strings.HasPrefix(e.Name, "NXPOD_") {
				// we don't allow env vars starting with NXPOD_ and those that we do allow we've listed above
				continue
			}

			result = append(result, corev1.EnvVar{Name: e.Name, Value: e.Value})
		}
	}

	heartbeatInterval := time.Duration(m.Config.HeartbeatInterval)
	result = append(result, corev1.EnvVar{Name: "NXPOD_INTERVAL", Value: fmt.Sprintf("%d", int64(heartbeatInterval/time.Millisecond))})

	res, err := m.Config.Container.Workspace.Requests.ResourceList()
	if err != nil {
		return nil, xerrors.Errorf("cannot create environment: %w", err)
	}
	memoryInMegabyte := res.Memory().Value() / (1000 * 1000)
	result = append(result, corev1.EnvVar{Name: "NXPOD_MEMORY", Value: strconv.FormatInt(memoryInMegabyte, 10)})

	if startContext.Headless {
		result = append(result, corev1.EnvVar{Name: "NXPOD_HEADLESS", Value: "true"})
	}

	// remove empty env vars
	cleanResult := make([]corev1.EnvVar, 0)
	for _, v := range result {
		if v.Name == "" || v.Value == "" {
			continue
		}

		cleanResult = append(cleanResult, v)
	}

	return cleanResult, nil
}

func (m *Manager) createWorkspaceVolumes(startContext *startWorkspaceContext) (theia corev1.Volume, workspace corev1.Volume, err error) {
	// silly protobuf structure design - this needs to be a reference to a string,
	// so we have to assign it to a variable first to take the address
	hostPathOrCreate := corev1.HostPathDirectoryOrCreate
	hostPath := corev1.HostPathDirectory

	theia = corev1.Volume{
		Name: theiaVolumeName,
		VolumeSource: corev1.VolumeSource{
			HostPath: &corev1.HostPathVolumeSource{
				Path: m.Config.TheiaHostPath,
				Type: &hostPath,
			},
		},
	}
	workspace = corev1.Volume{
		Name: workspaceVolumeName,
		VolumeSource: corev1.VolumeSource{
			HostPath: &corev1.HostPathVolumeSource{
				Path: filepath.Join(m.Config.WorkspaceHostPath, startContext.Request.Id),
				Type: &hostPathOrCreate,
			},
		},
	}

	err = nil
	return
}

func (m *Manager) createDefaultSecurityContext() (*corev1.SecurityContext, error) {
	nxpodGUID := int64(33333)

	res := &corev1.SecurityContext{
		AllowPrivilegeEscalation: &boolFalse,
		Capabilities: &corev1.Capabilities{
			Add: []corev1.Capability{
				"AUDIT_WRITE",      // Write records to kernel auditing log.
				"FSETID",           // Don’t clear set-user-ID and set-group-ID permission bits when a file is modified.
				"KILL",             // Bypass permission checks for sending signals.
				"NET_BIND_SERVICE", // Bind a socket to internet domain privileged ports (port numbers less than 1024).
				"SYS_PTRACE",       // Trace arbitrary processes using ptrace(2).
			},
			Drop: []corev1.Capability{
				"SETPCAP",      // Modify process capabilities.
				"CHOWN",        // Make arbitrary changes to file UIDs and GIDs (see chown(2)).
				"NET_RAW",      // Use RAW and PACKET sockets.
				"DAC_OVERRIDE", // Bypass file read, write, and execute permission checks.
				"FOWNER",       // Bypass permission checks on operations that normally require the file system UID of the process to match the UID of the file.
				"SYS_CHROOT",   // Use chroot(2), change root directory.
				"SETFCAP",      // Set file capabilities.
				"SETUID",       // Make arbitrary manipulations of process UIDs.
				"SETGID",       // Make arbitrary manipulations of process GIDs and supplementary GID list.
			},
		},
		Privileged:             &boolFalse,
		ReadOnlyRootFilesystem: &boolFalse,
		RunAsGroup:             &nxpodGUID,
		RunAsNonRoot:           &boolTrue,
		RunAsUser:              &nxpodGUID,
	}

	return res, nil
}

func (m *Manager) createPortsService(workspaceID string, metaID string, servicePrefix string, ports []*api.PortSpec) (*corev1.Service, error) {
	annotations := make(map[string]string)

	// allocate ports
	serviceName := getPortsServiceName(servicePrefix)
	var portsToAllocate []int
	for _, p := range ports {
		portsToAllocate = append(portsToAllocate, int(p.Port))
	}
	alloc, err := m.ingressPortAllocator.UpdateAllocatedPorts(metaID, serviceName, portsToAllocate)
	if err != nil {
		return nil, err
	}
	serializedPorts, err := alloc.Marshal()
	if err != nil {
		return nil, err
	}
	annotations[ingressPortsAnnotation] = string(serializedPorts)

	// create service ports
	servicePorts := make([]corev1.ServicePort, len(ports))
	for i, p := range ports {
		servicePorts[i] = corev1.ServicePort{
			Port:     int32(p.Port),
			Protocol: corev1.ProtocolTCP,
			Name:     portSpecToName(p),
		}
		if p.Target != 0 {
			servicePorts[i].TargetPort = intstr.FromInt(int(p.Target))
		}

		ingressPort, _ := alloc.AllocatedPort(int(p.Port))
		url, err := renderWorkspacePortURL(m.Config.WorkspacePortURLTemplate, portURLContext{
			Host:          m.Config.NxpodHostURL,
			ID:            metaID,
			IngressPort:   fmt.Sprint(ingressPort),
			Prefix:        servicePrefix,
			WorkspacePort: fmt.Sprint(p.Port),
		})
		if err != nil {
			return nil, xerrors.Errorf("cannot render public URL for %d: %w", p.Port, err)
		}
		annotations[fmt.Sprintf("nxpod/port-url-%d", p.Port)] = url
	}

	return &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name: serviceName,
			Labels: map[string]string{
				"workspaceID":     workspaceID,
				wsk8s.MetaIDLabel: metaID,
				markerLabel:       "true",
			},
			Annotations: annotations,
		},
		Spec: corev1.ServiceSpec{
			Type:  corev1.ServiceTypeClusterIP,
			Ports: servicePorts,
			Selector: map[string]string{
				"workspaceID": workspaceID,
				markerLabel:   "true",
			},
		},
	}, nil
}

func (m *Manager) newStartWorkspaceContext(ctx context.Context, req *api.StartWorkspaceRequest) (res *startWorkspaceContext, err error) {
	// we deliberately do not shadow ctx here as we need the original context later to extract the TraceID
	span, ctx := tracing.FromContext(ctx, "newStartWorkspaceContext")
	defer tracing.FinishSpan(span, &err)

	workspaceType := strings.ToLower(api.WorkspaceType_name[int32(req.Type)])
	headless := false
	if req.Type != api.WorkspaceType_REGULAR {
		headless = true
	}

	workspaceURL, err := renderWorkspaceURL(m.Config.WorkspaceURLTemplate, req.Id, req.ServicePrefix, m.Config.NxpodHostURL)
	if err != nil {
		return nil, xerrors.Errorf("cannot get workspace URL: %w", err)
	}

	cliAPIKey, err := getRandomString(32)
	if err != nil {
		return nil, xerrors.Errorf("cannot create CLI API key: %w", err)
	}

	ownerToken, err := getRandomString(32)
	if err != nil {
		return nil, xerrors.Errorf("cannot create owner token: %w", err)
	}

	workspaceSpan := opentracing.StartSpan("workspace", opentracing.FollowsFrom(opentracing.SpanFromContext(ctx).Context()))
	traceID := tracing.GetTraceID(workspaceSpan)

	return &startWorkspaceContext{
		Labels: map[string]string{
			"app":                  "nxpod",
			"component":            "workspace",
			wsk8s.WorkspaceIDLabel: req.Id,
			wsk8s.OwnerLabel:       req.Metadata.Owner,
			wsk8s.MetaIDLabel:      req.Metadata.MetaId,
			wsk8s.TypeLabel:        workspaceType,
			headlessLabel:          fmt.Sprintf("%v", headless),
			markerLabel:            "true",
		},
		CLIAPIKey:           cliAPIKey,
		OwnerToken:          ownerToken,
		Request:             req,
		TheiaPort:           23000,
		TheiaSupervisorPort: 22999,
		WorkspaceURL:        workspaceURL,
		TraceID:             traceID,
		Headless:            headless,
	}, nil
}

func getServicePrefix(req *api.StartWorkspaceRequest) string {
	if req.ServicePrefix != "" {
		return req.ServicePrefix
	}

	return req.Id
}

// validCookieChars contains all characters which may occur in an HTTP Cookie value (unicode \u0021 through \u007E),
// without the characters , ; and / ... I did not find more details about permissible characters in RFC2965, so I took
// this list of permissible chars from Wikipedia.
//
// The tokens we produce here (e.g. owner token or CLI API token) are likely placed in cookies or transmitted via HTTP.
// To make the lifes of downstream users easier we'll try and play nice here w.r.t. to the characters used.
var validCookieChars = []byte("!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}")

func getRandomString(length int) (string, error) {
	b := make([]byte, length)
	n, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	if n != length {
		return "", io.ErrShortWrite
	}

	lrsc := len(validCookieChars)
	for i, c := range b {
		b[i] = validCookieChars[int(c)%lrsc]
	}
	return string(b), nil
}

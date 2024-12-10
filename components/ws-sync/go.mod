module github.com/khulnasoft/nxpod/ws-sync

go 1.14

// containerd, see https://github.com/containerd/containerd/issues/3031
replace github.com/docker/distribution v2.7.1+incompatible => github.com/docker/distribution v2.7.1-0.20190205005809-0d3efadf0154+incompatible // leeway ignore

replace github.com/docker/docker v1.13.1 => github.com/docker/engine v0.0.0-20190822205725-ed20165a37b4 // leeway ignore

replace github.com/Sirupsen/logrus v1.6.0 => github.com/sirupsen/logrus v1.6.0 // leeway ignore

require (
	github.com/alecthomas/jsonschema v0.0.0-20190504002508-159cbd5dba26
	github.com/alecthomas/repr v0.0.0-20200325044227-4184120f674c
	github.com/containerd/containerd v1.6.26
	github.com/containerd/typeurl v1.0.2
	github.com/docker/docker v1.13.1 // indirect
	github.com/docker/engine v17.12.0-ce-rc1.0.20200514230353-811a247d06e8+incompatible
	github.com/google/go-cmp v0.5.9
	github.com/grpc-ecosystem/go-grpc-middleware v1.3.0
	github.com/khulnasoft/nxpod/common-go v0.0.0-00010101000000-000000000000
	github.com/khulnasoft/nxpod/content-service v0.0.0-00010101000000-000000000000
	github.com/khulnasoft/nxpod/content-service/api v0.0.0-00010101000000-000000000000
	github.com/khulnasoft/nxpod/ws-sync/api v0.0.0-00010101000000-000000000000
	github.com/opencontainers/go-digest v1.0.0
	github.com/opencontainers/image-spec v1.1.0-rc2.0.20221005185240-3a7f492d3f1b
	github.com/opentracing/opentracing-go v1.1.0
	github.com/prometheus/client_golang v1.11.1
	github.com/sirupsen/logrus v1.9.3
	github.com/spf13/cobra v1.0.0
	golang.org/x/xerrors v0.0.0-20220907171357-04be3eba64a2
	google.golang.org/grpc v1.58.3
)

replace github.com/khulnasoft/nxpod/common-go => ../common-go // leeway

replace github.com/khulnasoft/nxpod/content-service => ../content-service // leeway

replace github.com/khulnasoft/nxpod/content-service/api => ../content-service-api/go // leeway

replace github.com/khulnasoft/nxpod/ws-sync/api => ../ws-sync-api/go // leeway

replace k8s.io/api => k8s.io/api v0.0.0-20190620084959-7cf5895f2711 // leeway indirect from components/common-go:lib

replace k8s.io/apiextensions-apiserver => k8s.io/apiextensions-apiserver v0.0.0-20190620085554-14e95df34f1f // leeway indirect from components/common-go:lib

replace k8s.io/apimachinery => k8s.io/apimachinery v0.0.0-20190612205821-1799e75a0719 // leeway indirect from components/common-go:lib

replace k8s.io/apiserver => k8s.io/apiserver v0.0.0-20190620085212-47dc9a115b18 // leeway indirect from components/common-go:lib

replace k8s.io/cli-runtime => k8s.io/cli-runtime v0.0.0-20190620085706-2090e6d8f84c // leeway indirect from components/common-go:lib

replace k8s.io/client-go => k8s.io/client-go v0.0.0-20190620085101-78d2af792bab // leeway indirect from components/common-go:lib

replace k8s.io/cloud-provider => k8s.io/cloud-provider v0.0.0-20190620090043-8301c0bda1f0 // leeway indirect from components/common-go:lib

replace k8s.io/cluster-bootstrap => k8s.io/cluster-bootstrap v0.0.0-20190620090013-c9a0fc045dc1 // leeway indirect from components/common-go:lib

replace k8s.io/code-generator => k8s.io/code-generator v0.15.12-beta.0 // leeway indirect from components/common-go:lib

replace k8s.io/component-base => k8s.io/component-base v0.0.0-20190620085130-185d68e6e6ea // leeway indirect from components/common-go:lib

replace k8s.io/cri-api => k8s.io/cri-api v0.0.0-20190531030430-6117653b35f1 // leeway indirect from components/common-go:lib

replace k8s.io/csi-translation-lib => k8s.io/csi-translation-lib v0.0.0-20190620090116-299a7b270edc // leeway indirect from components/common-go:lib

replace k8s.io/kube-aggregator => k8s.io/kube-aggregator v0.0.0-20190620085325-f29e2b4a4f84 // leeway indirect from components/common-go:lib

replace k8s.io/kube-controller-manager => k8s.io/kube-controller-manager v0.0.0-20190620085942-b7f18460b210 // leeway indirect from components/common-go:lib

replace k8s.io/kube-proxy => k8s.io/kube-proxy v0.0.0-20190620085809-589f994ddf7f // leeway indirect from components/common-go:lib

replace k8s.io/kube-scheduler => k8s.io/kube-scheduler v0.0.0-20190620085912-4acac5405ec6 // leeway indirect from components/common-go:lib

replace k8s.io/kubelet => k8s.io/kubelet v0.0.0-20190620085838-f1cb295a73c9 // leeway indirect from components/common-go:lib

replace k8s.io/legacy-cloud-providers => k8s.io/legacy-cloud-providers v0.0.0-20190620090156-2138f2c9de18 // leeway indirect from components/common-go:lib

replace k8s.io/metrics => k8s.io/metrics v0.0.0-20190620085625-3b22d835f165 // leeway indirect from components/common-go:lib

replace k8s.io/sample-apiserver => k8s.io/sample-apiserver v0.0.0-20190620085408-1aef9010884e // leeway indirect from components/common-go:lib

#!/bin/sh
# Copyright (c) 2022 Nxpod GmbH. All rights reserved.
# Licensed under the GNU Affero General Public License (AGPL).
# See License.AGPL.txt in the project root for license information.

set -e

touch logs.txt

# Set Domain to `preview.nxpod-self-hosted.com` if not set
if [ -z "${DOMAIN}" ]; then
  export DOMAIN="preview.nxpod-self-hosted.com"
fi

# Create a USER_ID to be used everywhere
USER_ID="$(od -x /dev/urandom | head -1 | awk '{OFS="-"; print $2$3,$4,$5,$6,$7$8$9}')"
export USER_ID

if [ "$1" != "logging" ]; then
  $0 logging > logs.txt 2>&1 &
  /prettylog
  exit
fi

# check for minimum requirements
REQUIRED_MEM_KB=$((6 * 1024 * 1024))
total_mem_kb=$(awk '/MemTotal:/ {print $2}' /proc/meminfo)
if [ "${total_mem_kb}" -lt "${REQUIRED_MEM_KB}" ]; then
    echo "Nxpod local preview requires a system with at least 6GB of memory"
    exit 1
fi

REQUIRED_CORES=4
total_cores=$(nproc)
if [ "${total_cores}" -lt "${REQUIRED_CORES}" ]; then
    echo "Nxpod local preview requires a system with at least 4 CPU Cores"
    exit 1
fi

echo "Nxpod Domain: $DOMAIN"

# With cgroupv2, We need to move the k3s processes into the
# init group when we override the entrypoint in the container
if [ -f /sys/fs/cgroup/cgroup.controllers ]; then
  mkdir -p /sys/fs/cgroup/init
  busybox xargs -rn1 < /sys/fs/cgroup/cgroup.procs > /sys/fs/cgroup/init/cgroup.procs || :
  sed -e 's/ / +/g' -e 's/^/+/' <"/sys/fs/cgroup/cgroup.controllers" >"/sys/fs/cgroup/cgroup.subtree_control"
fi


mount --make-shared /sys/fs/cgroup
mount --make-shared /proc
mount --make-shared /var/nxpod

# install in local store
mkcert -install
cat "${HOME}"/.local/share/mkcert/rootCA.pem >> /etc/ssl/certs/ca-certificates.crt
# also send root cert into a volume
cat "${HOME}"/.local/share/mkcert/rootCA.pem > /var/nxpod/nxpod-ca.crt

FN_CACERT="./ca.pem"
FN_SSLCERT="./ssl.crt"
FN_SSLKEY="./ssl.key"

cat "${HOME}"/.local/share/mkcert/rootCA.pem > "$FN_CACERT"
mkcert -cert-file "$FN_SSLCERT" \
  -key-file "$FN_SSLKEY" \
  "*.ws.${DOMAIN}" "*.${DOMAIN}" "${DOMAIN}" "reg.${DOMAIN}" "registry.default.svc.cluster.local" "nxpod.default" "ws-manager.default.svc" "ws-manager" "ws-manager-dev" "registry-facade" "server" "ws-manager-bridge" "ws-proxy" "ws-manager" "ws-daemon.default.svc" "ws-daemon" "wsdaemon"

CACERT=$(base64 -w0 < "$FN_CACERT")
SSLCERT=$(base64 -w0 < "$FN_SSLCERT")
SSLKEY=$(base64 -w0 < "$FN_SSLKEY")

mkdir -p /var/lib/rancher/k3s/server/manifests/nxpod

cat << EOF > /var/lib/rancher/k3s/server/manifests/nxpod/customCA-cert.yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: ca-key-pair
  labels:
    app: nxpod
data:
  ca.crt: $CACERT
EOF

cat << EOF > /var/lib/rancher/k3s/server/manifests/nxpod/https-cert.yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: https-certificates
  labels:
    app: nxpod
type: kubernetes.io/tls
data:
  tls.crt: $SSLCERT
  tls.key: $SSLKEY
EOF

cat << EOF > /var/lib/rancher/k3s/server/manifests/nxpod/builtin-registry-certs.yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: builtin-registry-certs
  labels:
    app: nxpod
type: kubernetes.io/tls
data:
  ca.crt: $CACERT
  tls.crt: $SSLCERT
  tls.key: $SSLKEY
EOF

cat << EOF > /var/lib/rancher/k3s/server/manifests/nxpod/ws-manager-tls.yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: ws-manager-tls
  labels:
    app: nxpod
type: kubernetes.io/tls
data:
  ca.crt: $CACERT
  tls.crt: $SSLCERT
  tls.key: $SSLKEY
EOF

cat << EOF > /var/lib/rancher/k3s/server/manifests/nxpod/ws-manager-client-tls.yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: ws-manager-client-tls
  labels:
    app: nxpod
type: kubernetes.io/tls
data:
  ca.crt: $CACERT
  tls.crt: $SSLCERT
  tls.key: $SSLKEY
EOF

cat << EOF > /var/lib/rancher/k3s/server/manifests/nxpod/ws-daemon-tls.yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: ws-daemon-tls
  labels:
    app: nxpod
type: kubernetes.io/tls
data:
  ca.crt: $CACERT
  tls.crt: $SSLCERT
  tls.key: $SSLKEY
EOF

cat << EOF > /var/lib/rancher/k3s/server/manifests/nxpod/builtin-registry-facade-cert.yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: builtin-registry-facade-cert
  labels:
    app: nxpod
type: kubernetes.io/tls
data:
  ca.crt: $CACERT
  tls.crt: $SSLCERT
  tls.key: $SSLKEY
EOF

/nxpod-installer init > config.yaml
yq e -i '.domain = "'"${DOMAIN}"'"' config.yaml
yq e -i '.certificate.name = "https-certificates"' config.yaml
yq e -i '.certificate.kind = "secret"' config.yaml
yq e -i '.customCACert.name = "ca-key-pair"' config.yaml
yq e -i '.customCACert.kind = "secret"' config.yaml
yq e -i '.observability.logLevel = "debug"' config.yaml
yq e -i '.workspace.runtime.containerdSocket = "/run/k3s/containerd/containerd.sock"' config.yaml
yq e -i '.workspace.runtime.containerdRuntimeDir = "/var/lib/rancher/k3s/agent/containerd/io.containerd.runtime.v2.task/k8s.io/"' config.yaml
yq e -i '.workspace.pvc.size = "10Gi"' config.yaml
yq e -i '.workspace.resources.requests.memory = "500Mi"' config.yaml
yq e -i '.workspace.resources.requests.cpu = "500m"' config.yaml
yq e -i '.experimental.telemetry.data.platform = "local-preview"' config.yaml

echo "extracting images to download ahead..."
/nxpod-installer render --use-experimental-config --config config.yaml | grep 'image:' | sed 's/ *//g' | sed 's/image://g' | sed 's/\"//g' | sed 's/^-//g' | sort | uniq > /nxpod-images.txt
echo "downloading images..."
while read -r image "$(cat /nxpod-images.txt)"; do
   # shellcheck disable=SC2154
   ctr images pull "$image" >/dev/null &
done

ctr images pull "docker.io/nxpod/workspace-full:latest" >/dev/null &

echo "images pulled"
/nxpod-installer render --use-experimental-config --config config.yaml --output-split-files /var/lib/rancher/k3s/server/manifests/nxpod

# store files in `nxpod.debug` for debugging purposes
for f in /var/lib/rancher/k3s/server/manifests/nxpod/*.yaml; do (cat "$f"; echo) >> /var/lib/rancher/k3s/server/nxpod.debug; done
# remove unused resources
rm /var/lib/rancher/k3s/server/manifests/nxpod/*NetworkPolicy*
rm /var/lib/rancher/k3s/server/manifests/nxpod/*Certificate*
rm /var/lib/rancher/k3s/server/manifests/nxpod/*Issuer*
# update PersistentVolumeClaim's to use k3s's `local-path` storage class
for f in /var/lib/rancher/k3s/server/manifests/nxpod/*PersistentVolumeClaim*.yaml; do yq e -i '.spec.storageClassName="local-path"' "$f"; done
# Set `volumeClassTemplate` so that each replica creates its own PVC
# update Statefulset's to use k3s's `local-path` storage class
for f in /var/lib/rancher/k3s/server/manifests/nxpod/*StatefulSet*.yaml; do yq e -i '.spec.volumeClaimTemplates[0].spec.storageClassName="local-path"' "$f"; done

# removing init container from ws-daemon (systemd and Ubuntu)
yq eval-all -i 'del(.spec.template.spec.initContainers[0])' /var/lib/rancher/k3s/server/manifests/nxpod/*_DaemonSet_ws-daemon.yaml

# set lower requirements
yq eval-all -i '.spec.template.spec.containers[0].resources.requests.memory="250Mi"' /var/lib/rancher/k3s/server/manifests/nxpod/*_DaemonSet_ws-daemon.yaml
yq eval-all -i '.spec.template.spec.containers[0].resources.requests.cpu="250m"' /var/lib/rancher/k3s/server/manifests/nxpod/*_DaemonSet_ws-daemon.yaml
yq eval-all -i '.spec.template.spec.containers[0].resources.requests.memory="250Mi"' /var/lib/rancher/k3s/server/manifests/nxpod/*_Deployment_minio.yaml

# set storage requests to be lower
for f in /var/lib/rancher/k3s/server/manifests/nxpod/*PersistentVolumeClaim*.yaml; do
    yq e -i '.spec.resources.requests.storage="1Gi"' "$f";
done

for f in /var/lib/rancher/k3s/server/manifests/nxpod/*StatefulSet*.yaml; do
    yq e -i '.spec.volumeClaimTemplates[0].spec.resources.requests.storage="1Gi"' "$f";
done

touch /var/lib/rancher/k3s/server/manifests/coredns.yaml.skip
mv -f /app/manifests/coredns.yaml /var/lib/rancher/k3s/server/manifests/custom-coredns.yaml

for f in /var/lib/rancher/k3s/server/manifests/nxpod/*.yaml; do (cat "$f"; echo) >> /var/lib/rancher/k3s/server/manifests/nxpod.yaml; done
rm -rf /var/lib/rancher/k3s/server/manifests/nxpod

echo "manifests generated"
# waits for nxpod pods to be ready, and manually runs the `nxpod-telemetry` cronjob
run_telemetry(){
  # wait for the k3s cluster to be ready and Nxpod workloads are added
  sleep 100
  # indefinitely wait for Nxpod pods to be ready
  kubectl wait --timeout=-1s --for=condition=ready pod -l app=nxpod,component!=migrations
  echo "Nxpod pods are ready"
  # honour DO_NOT_TRACK if set
  if [ -n "${DO_NOT_TRACK}" ] && [ "${DO_NOT_TRACK}" -eq 1 ]; then
    # suspend the cronjob
    kubectl patch cronjobs nxpod-telemetry -p '{"spec" : {"suspend" : true }}'
  else
    # manually run the cronjob
    kubectl create job nxpod-telemetry-init --from=cronjob/nxpod-telemetry
  fi
}

run_telemetry 2>&1 &

/bin/k3s server --disable traefik \
  --node-label nxpod.io/workload_meta=true \
  --node-label nxpod.io/workload_ide=true \
  --node-label nxpod.io/workload_workspace_services=true \
  --node-label nxpod.io/workload_services=true \
  --node-label nxpod.io/workload_workspace_regular=true \
  --node-label nxpod.io/workload_workspace_headless=true

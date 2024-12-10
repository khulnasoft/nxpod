#
# Terraform Module: nxpod
#

hostname: ${hostname}
components:
  proxy:
    loadBalancerIP: ${loadBalancerIP}

installPodSecurityPolicies: true

imagePrefix: eu.gcr.io/nxpod-core-dev/build/
version: cw-core-docker-installer.7
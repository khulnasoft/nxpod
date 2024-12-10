components:
  imageBuilder:
    registryCerts: []
    registry:
      name: "${hostname}/${project}"
      secretName: ${secret_name}

  workspace:
    pullSecret:
      secretName: ${secret_name}

docker-registry:
  enabled: false

nxpod_selfhosted:
  variants:
    customRegistry: true

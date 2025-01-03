components:
  wsSync:
    hostWorkspaceArea: /var/nxpod/workspaces
    name: ws-sync
    remoteStorage:
      kind: minio
      minio:
        accessKey: ${access_key}
        endpoint: minio:9000
        secretKey: ${secret_key}
        tmpdir: /tmp
minio:
  enabled: false
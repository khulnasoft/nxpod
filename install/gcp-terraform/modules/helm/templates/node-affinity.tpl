affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: nxpod.io/workload_meta
          operator: In
          values:
          - "true"

components:
  workspace:
    template:
      spec:
        affinity:
          nodeAffinity:
            requiredDuringSchedulingIgnoredDuringExecution:
              nodeSelectorTerms:
              - matchExpressions:
                - key: nxpod.io/workload_workspace
                  operator: In
                  values:
                  - "true"
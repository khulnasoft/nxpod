affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: nxpod.khulnasoft.com/workload_meta
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
                - key: nxpod.khulnasoft.com/workload_workspace
                  operator: In
                  values:
                  - "true"
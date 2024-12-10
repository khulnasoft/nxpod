/**
 * Copyright (c) 2021 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

(import './dashboards/SLOs/workspace-startup-time.libsonnet') +
{
  grafanaDashboards+:: {
    // Import raw json files here.
    // Example:
    // 'my-new-dashboard.json': (import 'dashboards/components/new-component.json'),
    'nxpod-cluster-autoscaler-k3s.json': (import 'dashboards/nxpod-cluster-autoscaler-k3s.json'),
    'nxpod-node-resource-metrics.json': (import 'dashboards/nxpod-node-resource-metrics.json'),
    'nxpod-grpc-server.json': (import 'dashboards/nxpod-grpc-server.json'),
    'nxpod-grpc-client.json': (import 'dashboards/nxpod-grpc-client.json'),
    'nxpod-connect-server.json': (import 'dashboards/nxpod-connect-server.json'),
    'nxpod-overview.json': (import 'dashboards/nxpod-overview.json'),
    'nxpod-nodes-overview.json': (import 'dashboards/nxpod-nodes-overview.json'),
    'nxpod-admin-node.json': (import 'dashboards/nxpod-admin-node.json'),
    'nxpod-admin-workspace.json': (import 'dashboards/nxpod-admin-workspace.json'),
    'nxpod-applications.json': (import 'dashboards/nxpod-applications.json'),
    'redis.json': (import 'dashboards/redis.json')
  },
}

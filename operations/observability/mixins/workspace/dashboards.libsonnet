/**
 * Copyright (c) 2021 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

{
  grafanaDashboards+:: {
    // Import raw json files here.
    // Example:
    // 'my-new-dashboard.json': (import 'dashboards/components/new-component.json'),
    'nxpod-component-agent-smith.json': (import 'dashboards/components/agent-smith.json'),
    'nxpod-component-content-service.json': (import 'dashboards/components/content-service.json'),
    'nxpod-component-registry-facade.json': (import 'dashboards/components/registry-facade.json'),
    'nxpod-component-ws-daemon.json': (import 'dashboards/components/ws-daemon.json'),
    'nxpod-component-ws-manager-mk2.json': (import 'dashboards/components/ws-manager-mk2.json'),
    'nxpod-component-ws-proxy.json': (import 'dashboards/components/ws-proxy.json'),
    'nxpod-workspace-success-criteria.json': (import 'dashboards/success-criteria.json'),
    'nxpod-workspace-coredns.json': (import 'dashboards/coredns.json'),
    'nxpod-node-swap.json': (import 'dashboards/node-swap.json'),
    'nxpod-node-ephemeral-storage.json': (import 'dashboards/ephemeral-storage.json'),
    'nxpod-node-problem-detector.json': (import 'dashboards/node-problem-detector.json'),
    'nxpod-network-limiting.json': (import 'dashboards/network-limiting.json'),
    'nxpod-component-image-builder.json': (import 'dashboards/components/image-builder.json'),
    'nxpod-psi.json': (import 'dashboards/node-psi.json'),
    'nxpod-workspace-psi.json': (import 'dashboards/workspace-psi.json'),
    'nxpod-workspace-registry-facade-blobsource.json': (import 'dashboards/registry-facade-blobsource.json'),
  },
}

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
    'nxpod-component-blobserve.json': (import 'dashboards/components/blobserve.json'),
    'nxpod-component-openvsx-proxy.json': (import 'dashboards/components/openvsx-proxy.json'),
    'nxpod-component-openvsx-mirror.json': (import 'dashboards/components/openvsx-mirror.json'),
    'nxpod-component-ssh-gateway.json': (import 'dashboards/components/ssh-gateway.json'),
    'nxpod-component-supervisor.json': (import 'dashboards/components/supervisor.json'),
    'nxpod-component-jb.json': (import 'dashboards/components/jb.json'),
    'nxpod-component-browser-overview.json': (import 'dashboards/components/browser-overview.json'),
    'nxpod-component-code-browser.json': (import 'dashboards/components/code-browser.json'),
    'nxpod-component-ide-startup-time.json': (import 'dashboards/components/ide-startup-time.json'),
    'nxpod-component-ide-service.json': (import 'dashboards/components/ide-service.json'),
    'nxpod-component-local-ssh.json': (import 'dashboards/components/local-ssh.json'),
  },
}

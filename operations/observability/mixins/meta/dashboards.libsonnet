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
    'nxpod-component-dashboard.json': (import 'dashboards/components/dashboard.json'),
    'nxpod-component-db.json': (import 'dashboards/components/db.json'),
    'nxpod-component-ws-manager-bridge.json': (import 'dashboards/components/ws-manager-bridge.json'),
    'nxpod-component-proxy.json': (import 'dashboards/components/proxy.json'),
    'nxpod-component-server.json': (import 'dashboards/components/server.json'),
    'nxpod-component-server-garbage-collector.json': (import 'dashboards/components/server-garbage-collector.json'),
    'nxpod-component-usage.json': (import 'dashboards/components/usage.json'),
    'nxpod-slo-login.json': (import 'dashboards/SLOs/login.json'),
    'nxpod-meta-overview.json': (import 'dashboards/components/meta-overview.json'),
    'nxpod-meta-services.json': (import 'dashboards/components/meta-services.json'),
    'nxpod-components-spicedb.json': (import 'dashboards/components/spicedb.json'),
  },
}

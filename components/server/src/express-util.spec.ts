/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import * as chai from "chai"
import { isAllowedWebsocketDomain } from "./express-util";
const expect = chai.expect

const HOSTURL_HOSTNAME = "gpl-2732-ws-csrf.staging.nxpod.khulnasoft.com";

describe('express-util', function() {
  describe('isAllowedWebsocketDomain', function() {
    it('should return false for workspace-port locations', function() {
      const result = isAllowedWebsocketDomain("http://3000-aee7da59-2b15-42a6-9773-2546ed487149.ws-eu.gpl-2732-ws-csrf.staging.nxpod.khulnasoft.com", HOSTURL_HOSTNAME);
      expect(result).to.be.false;
    });

    it('should return true for workspace locations', function() {
      const result = isAllowedWebsocketDomain("http://aee7da59-2b15-42a6-9773-2546ed487149.ws-eu.gpl-2732-ws-csrf.staging.nxpod.khulnasoft.com", HOSTURL_HOSTNAME);
      expect(result).to.be.true;
    });

    it('should return true for workspaces locations', function() {
      const result = isAllowedWebsocketDomain("http://gpl-2732-ws-csrf.staging.nxpod.khulnasoft.com", HOSTURL_HOSTNAME);
      expect(result).to.be.true;
    });
  });
});

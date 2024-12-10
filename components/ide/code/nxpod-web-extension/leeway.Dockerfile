# Copyright (c) 2020 Nxpod GmbH. All rights reserved.
# Licensed under the GNU Affero General Public License (AGPL).
# See License.AGPL.txt in the project root for license information.
FROM node:18 as builder

ARG CODE_EXTENSION_COMMIT

RUN apt update -y \
    && apt install jq --no-install-recommends -y

RUN mkdir /nxpod-code-web \
    && cd /nxpod-code-web \
    && git init \
    && git remote add origin https://github.com/khulnasoft/nxpod-code \
    && git fetch origin $CODE_EXTENSION_COMMIT --depth=1 \
    && git reset --hard FETCH_HEAD
WORKDIR /nxpod-code-web
RUN yarn --frozen-lockfile --network-timeout 180000

# update package.json
RUN cd nxpod-web && \
    setSegmentKey="setpath([\"segmentKey\"]; \"untrusted-dummy-key\")" && \
    jqCommands="${setSegmentKey}" && \
    cat package.json | jq "${jqCommands}" > package.json.tmp && \
    mv package.json.tmp package.json
RUN yarn build:nxpod-web && yarn --cwd nxpod-web/ inject-commit-hash


FROM scratch

COPY --from=builder --chown=33333:33333 /nxpod-code-web/nxpod-web/out /ide/extensions/nxpod-web/out/
COPY --from=builder --chown=33333:33333 /nxpod-code-web/nxpod-web/public /ide/extensions/nxpod-web/public/
COPY --from=builder --chown=33333:33333 /nxpod-code-web/nxpod-web/resources /ide/extensions/nxpod-web/resources/
COPY --from=builder --chown=33333:33333 /nxpod-code-web/nxpod-web/package.json /nxpod-code-web/nxpod-web/package.nls.json /nxpod-code-web/nxpod-web/README.md /nxpod-code-web/nxpod-web/LICENSE.txt /ide/extensions/nxpod-web/

# Copyright (c) 2022 Nxpod GmbH. All rights reserved.
# Licensed under the GNU Affero General Public License (AGPL).
# See License.AGPL.txt in the project root for license information.



FROM cgr.dev/chainguard/wolfi-base:latest@sha256:b3dd9cf08283b959c6a0a3c833e68b2882a50129930215060154b43ae6a3e81c

RUN apk add --no-cache git bash ca-certificates
COPY components-ee-agent-smith--app/agent-smith /app/
RUN chmod +x /app/agent-smith

ARG __GIT_COMMIT
ARG VERSION

ENV NXPOD_BUILD_GIT_COMMIT=${__GIT_COMMIT}
ENV NXPOD_BUILD_VERSION=${VERSION}
ENTRYPOINT [ "/app/agent-smith" ]
CMD [ "-v", "help" ]

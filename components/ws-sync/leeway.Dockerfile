# Copyright (c) 2020 TypeFox GmbH. All rights reserved.
# Licensed under the GNU Affero General Public License (AGPL).
# See License-AGPL.txt in the project root for license information.

FROM alpine:latest

## Installing coreutils is super important here as otherwise the loopback device creation fails!
RUN apk add --no-cache git bash openssh-client lz4 e2fsprogs coreutils tar

# Add nxpod user for operations (e.g. checkout because of the post-checkout hook!)
RUN addgroup -g 33333 nxpod \
    && adduser -D -h /home/nxpod -s /bin/sh -u 33333 -G nxpod nxpod \
    && echo "nxpod:nxpod" | chpasswd

COPY components-ws-sync--app/ws-sync /app/ws-syncd

USER root
ENTRYPOINT [ "/app/ws-syncd" ]
CMD [ "-v", "help" ]
FROM alpine:3.8

RUN apk add --no-cache --update bash

RUN addgroup -g 33333 nxpod
RUN adduser -D -h /home/nxpod -s /bin/sh -u 33333 -G nxpod nxpod
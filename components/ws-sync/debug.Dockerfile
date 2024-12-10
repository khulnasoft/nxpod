FROM golang:1.13-alpine AS debugger
RUN apk add --no-cache git
RUN go get -u github.com/go-delve/delve/cmd/dlv

FROM alpine:latest
RUN apk add --no-cache git bash openssh-client lz4 e2fsprogs

# Add nxpod user for operations (e.g. checkout because of the post-checkout hook!)
# RUN addgroup -g 33333 nxpod \
#     && adduser -D -h /home/nxpod -s /bin/sh -u 33333 -G nxpod nxpod \
#     && echo "nxpod:nxpod" | chpasswd

COPY --from=debugger /go/bin/dlv /usr/bin
COPY ws-syncd /app/ws-syncd
ENTRYPOINT [ "/app/ws-syncd" ]
CMD [ "-v", "help" ]
FROM buildpack-deps:xenial

RUN addgroup --gid 33333 nxpod
# '--no-log-init': see https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#user
RUN useradd --no-log-init --create-home --home-dir /home/nxpod --shell /bin/bash --uid 33333 --gid 33333 nxpod

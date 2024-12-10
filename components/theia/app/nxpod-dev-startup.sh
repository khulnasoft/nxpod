#!/bin/bash

# remove the workspace prefix
export NXPOD_HOST=$(echo $NXPOD_WORKSPACE_URL | sed -e 's/\(.*\/\).*\ws-eu.\(.*\)/\1\2/')
export NXPOD_WORKSPACE_ID=$NXPOD_WORKSPACE_ID

npx theia start --hostname 0.0.0.0 --port 3000 ../../..
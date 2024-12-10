#!/bin/bash
# Copyright (c) 2020 TypeFox GmbH. All rights reserved.
# Licensed under the GNU Affero General Public License (AGPL).
# See License-AGPL.txt in the project root for license information.

# >>> Expects to be run as root

# Quit immediately on non-zero exit code
set -e;

# Install necessary tools only if they are not yet installed
INSTALLED_PACKAGES=$(dpkg-query -f '${Package} ${Status}\n' -W bash-completion git vim | wc -l)
if [ $INSTALLED_PACKAGES != 3 ]; then
    # The first 'clean' is needed to avoid apt-get detecting package meta data changes
    # (like changed labels) which result in errors and broken builds/workspaces!
    apt-get clean && rm -rf /var/lib/apt/lists/*;

    # vim: used as Git-editor (see .bashrc-append)
    apt-get update --allow-insecure-repositories;
    apt-get install -yq \
        bash-completion \
        git \
        vim

    # Cleanup to keep the image as small as possible
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/*;
fi

# Disable root login
#
# Note: The root account should already be disabled by default, at least in Ubuntu.
# Source: https://askubuntu.com/a/20453
#
# In the past, we used to set a password here, when Nxpod managed workspaces via SSH.
# Now, it doesn't really matter if root is locked or not, because we prevent privilege
# escalation in containers with "allowPrivilegeEscalation=false" anyway:
# https://kubernetes.io/docs/concepts/policy/pod-security-policy/#privilege-escalation
passwd -l root || true

# Create gp-preview symlink required for the browser variable
ln -s /usr/bin/gp /usr/bin/gp-preview

# Create Nxpod user
if ! id -u nxpod; then
    # user doesn't exist, let's add it.
    echo "Creating new user 'nxpod'.";
    addgroup --gid 33333 nxpod;
    # '--no-log-init': see https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#user
    useradd --no-log-init --create-home --home-dir /home/nxpod --shell /bin/bash --uid 33333 --gid 33333 nxpod;
    echo "nxpod:nxpod" | chpasswd;

    # To allow users to not know anything about our nxpod user, copy over all stuff from the previous user (root)
    cp -R /root/. /home/nxpod;
    chown -R nxpod:nxpod /home/nxpod/;
else
    USER_ID=$(id -u nxpod)
    if [ $USER_ID -eq 33333 ]; then
        # users exists and has user id 33333. We hope that the user does not have ID 0, because that grants root privileges
        echo "Found user 'nxpod'. Reusing it.";
        echo "nxpod:nxpod" | chpasswd;
    else
        # error
        echo "Error: User 'nxpod' exists but does not have user-id 33333. The user-id is $UID";
        exit 1;
    fi
fi

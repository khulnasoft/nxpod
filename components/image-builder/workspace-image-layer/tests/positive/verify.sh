#!/bin/bash

USER_ID=$(id -u nxpod)
if [ $USER_ID -ne 33333 ]; then
    echo "user 'nxpod' not present or wrong user-id."
    exit 1
fi

if [ -z "$(which git)" ]; then
    echo "git not installed!"
fi

if [ -z "$(which bash)" ]; then
    echo "bash not installed!"
fi

echo "Tests passed successfully!"
exit 0
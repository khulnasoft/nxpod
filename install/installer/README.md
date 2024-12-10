## GCP

```
docker run --rm -it \
    -v $HOME/nxpod-gcp-installation:/workspace \
    -e PROJECT_ID=foobar \
    -e REGION=europe-west1 \
    eu.gcr.io/nxpod-core-dev/install/installer:dev scripts/gcp.sh
```

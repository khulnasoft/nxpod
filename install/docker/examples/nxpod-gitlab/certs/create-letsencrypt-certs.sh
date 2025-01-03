#!/usr/bin/env bash

DOMAIN=example.com
EMAIL=info@example.com

docker run -it --rm -v $(pwd)/letsencrypt:/letsencrypt --user $(id -u):$(id -g) certbot/certbot certonly \
    --config-dir /letsencrypt/config \
    --work-dir /letsencrypt/work \
    --logs-dir /letsencrypt/logs \
    --manual \
    --preferred-challenges=dns \
    --email $EMAIL \
    --agree-tos \
    -d $DOMAIN \
    -d *.$DOMAIN \
    -d *.gitlab.$DOMAIN \
    -d *.nxpod.$DOMAIN \
    -d *.ws.nxpod.$DOMAIN


find letsencrypt/config/live -name "*.pem" -exec cp {} ./ \;

openssl dhparam -out dhparams.pem 2048

# Install Nxpod on GCP


## Requirements
  - DNS entries:
    - <your-base-domain> -> <your IP>
    - *.<your-base-domain> -> <your IP>
    - *.ws.<your-base-domain> -> <your IP>

  - HTTPS certificate for:
    - <your-base-domain>
    - *.<your-base-domain>
    - *.ws.<your-base-domain>

  - A GitHub OAuth App (HowTo Link: https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/)
    - callback URL set to: "https://<your-base-domain>/auth/github/callback"
    - we need:
      - clientId
      - clientSecret

## Before you begin
 - install [gcloud cli](https://cloud.google.com/sdk/docs/#install_the_latest_cloud_tools_version_cloudsdk_current_version)
   - `gcloud components install beta`
 - setup Google cloud project
 - choose a [zone and region](https://cloud.google.com/compute/docs/regions-zones/#available) to install your Nxpod cluster
 - [Enable APIs](https://cloud.google.com/endpoints/docs/openapi/enable-api#enabling_an_api):
   - Identity and Access Management (IAM)
   - Cloud SQL Admin API

```
gcloud auth login <e-mail>
gcloud config set core/project <gcloud-project>
gcloud config set compute/region <gcloud-region>
gcloud config set compute/zone <gcloud-zone>

PROJECT_ID=<gcloud-project-id>
REGION=<gcloud-region>
```


## Required


### IP

```
gcloud compute addresses create nxpod-inbound-ip --region=$REGION
IP_ADDRESS=$(gcloud compute addresses describe nxpod-inbound-ip --region $REGION | grep "address:" | cut -d' ' -f2)
```


### VPC Network

```
gcloud compute networks create nxpod-vpc --bgp-routing-mode=regional --subnet-mode=auto
```


### Cluster

```
gcloud iam service-accounts create nxpod-nodes-meta
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-meta@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/clouddebugger.agent
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-meta@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/cloudtrace.agent
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-meta@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/errorreporting.writer
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-meta@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/logging.viewer
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-meta@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/logging.logWriter
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-meta@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/monitoring.metricWriter
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-meta@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/monitoring.viewer

gcloud iam service-accounts create nxpod-nodes-workspace
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-workspace@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/clouddebugger.agent
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-workspace@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/cloudtrace.agent
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-workspace@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/errorreporting.writer
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-workspace@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/logging.viewer
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-workspace@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/logging.logWriter
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-workspace@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/monitoring.metricWriter
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-nodes-workspace@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/monitoring.viewer
```

Choose one (or more) zones to install your cluster to
```
ZONES=us-west1-a,us-west1-b
gcloud beta container clusters create nxpod-cluster \
        --region=$REGION    \
        --node-locations=$ZONES \
        --cluster-version="1.13.7-gke.24" \
        --addons=NetworkPolicy  \
        \
        --no-enable-basic-auth \
        --no-issue-client-certificate \
        \
        --enable-ip-alias \
        --cluster-ipv4-cidr="10.8.0.0/14" \
        --services-ipv4-cidr="10.0.0.0/20" \
        --network=nxpod-vpc \
        \
        --enable-network-policy \
        --enable-pod-security-policy \
        \
        --metadata disable-legacy-endpoints=true \
        --num-nodes=1 \
        --enable-autoscaling --min-nodes=1 --max-nodes=3 \
        --service-account=nxpod-nodes-meta@$PROJECT_ID.iam.gserviceaccount.com \
        --node-labels="nxpod.khulnasoft.com/workload_meta=true" \
        --machine-type=n1-standard-4 \
        --image-type=cos \
        --disk-size=100 \
        --disk-type=pd-ssd \
        --enable-autorepair \
        --local-ssd-count=0 \
        --workload-metadata-from-node=SECURE

gcloud beta container node-pools create workspace-pool-1 \
        --region=$REGION    \
        --cluster=nxpod-cluster \
        \
        --metadata disable-legacy-endpoints=true \
        --num-nodes=0 \
        --enable-autoscaling --min-nodes=0 --max-nodes=10 \
        --service-account=nxpod-nodes-workspace@$PROJECT_ID.iam.gserviceaccount.com \
        --node-labels="nxpod.khulnasoft.com/workload_workspace=true" \
        --machine-type=n1-standard-16 \
        --image-type=ubuntu \
        --disk-size=200 \
        --disk-type=pd-ssd \
        --enable-autorepair \
        --local-ssd-count=1
```

## Optional

### GCP Managed DB

```
DB_PW=$(openssl rand -base64 20)
DB_NAME=nxpod-db
BACKUP_TIME="04:00"
gcloud sql instances create $DB_NAME \
    --database-version MYSQL_5_7 \
    --storage-size=100 \
    --storage-auto-increase \
    --tier=db-n1-standard-4 \
    --region=$REGION \
    --backup-start-time=$BACKUP_TIME \
    --failover-replica-name=$DB_NAME-failover \
    --replica-type=FAILOVER \
    --enable-bin-log

gcloud sql users set-password root --host % --instance $DB_NAME --password $DB_PW
echo "Database root password: $DB_PW"
```
Note: Store password securely for later use!

```
gcloud iam service-accounts create nxpod-cloudsql-client
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-cloudsql-client@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/cloudsql.client
gcloud iam service-accounts keys create nxpod-cloudsql-client-key.json --iam-account=nxpod-cloudsql-client@$PROJECT_ID.iam.gserviceaccount.com
```


#### Initialize DB

 1. [Get `cloud_sql_proxy` binary](https://cloud.google.com/sql/docs/mysql/sql-proxy#install)
    ```
    wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy
    chmod +x cloud_sql_proxy
    ```

 2. Connect to DB
    ```
    ./cloud_sql_proxy -instances=$PROJECT_ID:$REGION:$DB_NAME=tcp:0.0.0.0:3306 -credential_file=./nxpod-cloudsql-client-key.json
    ```

    2nd terminal: login with root password
    ```
    mysql -u root -P 3306 -h 127.0.0.1 -p
    ```

 3. Execute init scripts
    Generate password for nxpod user:
    ```
    NXPOD_DB_PW=$(openssl rand -base64 20)
    ```

    ```
    set @nxpodDbPassword = <NXPOD_DB_PW>;

    source config/db/init/00-create-user.sql
    source config/db/init/01-recreate-nxpod-db.sql
    source config/db/init/02-create-and-init-sessions-db.sql
    ```


### GCP Buckets for workspace backups

```
gcloud iam service-accounts create nxpod-workspace-syncer
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-workspace-syncer@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/storage.admin
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-workspace-syncer@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/storage.objectAdmin
gcloud iam service-accounts keys create nxpod-workspace-syncer-key.json --iam-account=nxpod-workspace-syncer@$PROJECT_ID.iam.gserviceaccount.com
```


### GCP Registry

Push and Pull access to the registry
```
gcloud iam service-accounts create nxpod-registry-full
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:nxpod-registry-full@$PROJECT_ID.iam.gserviceaccount.com" --role=roles/storage.admin
gcloud iam service-accounts keys create nxpod-registry-full-key.json --iam-account=nxpod-registry-full@$PROJECT_ID.iam.gserviceaccount.com
```

## Install

cluster init:
```
kubectl create -f tiller-sa.yaml
helm init --service-account tiller
```

install nxpod:
```
cd nxpod
helm dependencies update
helm install -f values.yaml [[-f <optional-values.yaml>]...] --name nxpod .
```

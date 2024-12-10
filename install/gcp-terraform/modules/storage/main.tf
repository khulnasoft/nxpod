/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the MIT License. See License-MIT.txt in the project root for license information.
 */


resource "google_project_service" "nxpod_storage" {
  count   = length(local.google_services)
  project = var.project
  service = local.google_services[count.index]

  disable_on_destroy = false
}

## IAM
resource "random_id" "nxpod_storage" {
  byte_length = 2
}

resource "google_service_account" "nxpod_storage" {
  account_id   = "nxpod-workspace-syncer-${random_id.nxpod_storage.hex}"
  display_name = "nxpod-workspace-syncer"
  description  = "nxpod-workspace-syncer"
  project      = var.project
}

data "google_iam_role" "nxpod_storage_storage_admin_roleinfo" {
  name = "roles/storage.admin"
}

data "google_iam_role" "nxpod_storage_object_admin_roleinfo" {
  name = "roles/storage.objectAdmin"
}

resource "google_project_iam_custom_role" "nxpod_storage" {
  role_id     = "nxpod.storage.${random_id.nxpod_storage.hex}"
  title       = "Nxpod Storage ${random_id.nxpod_storage.hex}"
  description = "Nxpod Storage Role ${random_id.nxpod_storage.hex}"
  permissions = [
    "storage.buckets.create",
    "storage.buckets.delete",
    "storage.buckets.get",
    "storage.buckets.getIamPolicy",
    "storage.buckets.list",
    "storage.buckets.setIamPolicy",
    "storage.buckets.update",
    "storage.objects.create",
    "storage.objects.delete",
    "storage.objects.get",
    "storage.objects.getIamPolicy",
    "storage.objects.list",
    "storage.objects.setIamPolicy",
    "storage.objects.update",
  ]
}

resource "google_project_iam_binding" "nxpod_storage" {
  project = var.project
  role    = google_project_iam_custom_role.nxpod_storage.id
  members = [
    "serviceAccount:${google_service_account.nxpod_storage.email}"
  ]
}

resource "google_service_account_key" "nxpod_storage" {
  service_account_id = google_service_account.nxpod_storage.name
}

## Kubernetes resources
resource "kubernetes_secret" "nxpod_storage" {
  metadata {
    name      = "nxpod-storage-${random_id.nxpod_storage.hex}"
    namespace = var.nxpod.namespace
  }

  data = {
    "key.json" = base64decode(google_service_account_key.nxpod_storage.private_key)
  }

  depends_on = [
    var.requirements,
  ]

}

## Helm values.yaml
data "template_file" "nxpod_storage_values" {
  template = file("${path.module}/templates/values.tpl")
  vars = {
    project     = var.project
    region      = var.region
    secret_name = "nxpod-storage-${random_id.nxpod_storage.hex}"
  }
}

resource "null_resource" "done" {
  depends_on = [
    kubernetes_secret.nxpod_storage
  ]
}

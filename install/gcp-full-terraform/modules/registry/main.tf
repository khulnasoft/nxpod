/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the MIT License. See License-MIT.txt in the project root for license information.
 */

#
# Enable Service APIs
#

# # https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_project_service
# resource "google_project_service" "nxpod_registry" {
#   count   = length(local.google_services)
#   project = var.project
#   service = local.google_services[count.index]

#   disable_dependent_services = false

# }



#
# Service Account
#

# https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/id
resource "random_id" "nxpod_registry" {
  byte_length = 2
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_service_account
resource "google_service_account" "nxpod_registry" {
  account_id   = "nxpod-registry-${random_id.nxpod_registry.hex}"
  display_name = "nxpod-registry-full"
  description  = "Nxpod Registry Admin"
  project      = var.project
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_project_iam_custom_role
resource "google_project_iam_custom_role" "nxpod_registry" {
  role_id     = "nxpod.registry"
  title       = "Nxpod Registry"
  description = "Nxpod Registry Role"
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

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_project_iam
resource "google_project_iam_binding" "nxpod_registry" {
  project = var.project
  role    = google_project_iam_custom_role.nxpod_registry.id
  members = [
    "serviceAccount:${google_service_account.nxpod_registry.email}"
  ]
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_service_account_key
resource "google_service_account_key" "nxpod_registry" {
  service_account_id = google_service_account.nxpod_registry.name
}



#
# registry-auth
#

# https://registry.terraform.io/providers/hashicorp/template/latest/docs/data-sources/file
data "template_file" "nxpod_registry_auth" {
  template = file("${path.module}/templates/registry-auth.tpl")
  vars = {
    hostname = var.hostname
    auth     = base64encode("_json_key: ${base64decode(google_service_account_key.nxpod_registry.private_key)}")
  }
}

# https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs/resources/secret
resource "kubernetes_secret" "nxpod_registry_auth" {
  metadata {
    name      = "nxpod-registry-${random_id.nxpod_registry.hex}"
    namespace = var.nxpod.namespace
  }

  data = {
    ".dockerconfigjson" = data.template_file.nxpod_registry_auth.rendered
  }

  type = "kubernetes.io/dockerconfigjson"

  depends_on = [
    var.requirements
  ]

}

# https://registry.terraform.io/providers/hashicorp/template/latest/docs/data-sources/file
data "template_file" "nxpod_values_registry" {
  template = file("${path.module}/templates/values.tpl")
  vars = {
    hostname = var.hostname
    project     = var.project
    secret_name = kubernetes_secret.nxpod_registry_auth.metadata[0].name
  }
}



#
# End
#

resource "null_resource" "done" {
  depends_on = [
    kubernetes_secret.nxpod_registry_auth
  ]
}

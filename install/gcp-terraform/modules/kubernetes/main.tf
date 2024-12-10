/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the MIT License. See License-MIT.txt in the project root for license information.
 */


resource "google_project_service" "container" {
  project = var.project
  service = "container.googleapis.com"

  disable_on_destroy = false
}

data "google_compute_network" "nxpod" {
  name = var.network

  depends_on = [
    var.requirements
  ]
}

resource "random_id" "nxpod_cluster" {
  byte_length = 2
}

resource "google_service_account" "nxpod_cluster" {
  account_id   = "nxpod-cluster-${random_id.nxpod_cluster.hex}"
  display_name = "nxpod-cluster-${random_id.nxpod_cluster.hex}"
  description  = "Nxpod Meta Nodes ${var.project}"
  project      = var.project
}

resource "google_project_iam_binding" "nxpod_cluster" {
  count   = length(local.roles)
  project = var.project
  role    = local.roles[count.index]
  members = [
    "serviceAccount:${google_service_account.nxpod_cluster.email}",
  ]
}

resource "random_password" "kubernetes" {
  length  = 32
  special = false
}

resource "google_container_cluster" "nxpod" {
  depends_on = [
    google_project_service.container
  ]

  name     = "${var.name}-${random_id.nxpod_cluster.hex}"
  project  = var.project
  location = var.location

  remove_default_node_pool = true
  initial_node_count       = var.kubernetes.initial_node_count

  master_auth {
    username = var.username
    password = random_password.kubernetes.result

    client_certificate_config {
      issue_client_certificate = true
    }
  }

  network            = var.network
  min_master_version = "1.15.12-gke.9"
}

resource "google_container_node_pool" "nxpod_cluster" {
  name       = "${google_container_cluster.nxpod.name}-${random_id.nxpod_cluster.hex}-nodepool"
  location   = var.location
  cluster    = google_container_cluster.nxpod.name
  node_count = 1

  node_config {
    preemptible     = var.kubernetes.node_pool.preemptible
    machine_type    = var.kubernetes.node_pool.machine_type
    disk_size_gb    = var.kubernetes.node_pool.disk_size_gb
    disk_type       = var.kubernetes.node_pool.disk_type
    local_ssd_count = var.kubernetes.node_pool.local_ssd_count

    metadata = {
      disable-legacy-endpoints = "true"
    }

    labels = {
      "nxpod.khulnasoft.com/workload_meta"      = "true"
      "nxpod.khulnasoft.com/workload_workspace" = "true"
    }

    image_type = var.kubernetes.node_pool.image_type

    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/devstorage.read_write",
    ]

    service_account = google_service_account.nxpod_cluster.email
  }
}

data "template_file" "kubeconfig" {
  depends_on = [
    google_container_node_pool.nxpod_cluster
  ]

  template = file("${path.module}/templates/kubeconfig.tpl")
  vars = {
    server                     = google_container_cluster.nxpod.endpoint
    certificate_authority_data = google_container_cluster.nxpod.master_auth[0].cluster_ca_certificate
    name                       = google_container_cluster.nxpod.name
    namespace                  = var.nxpod.namespace
    # client_certificate         = google_container_cluster.nxpod.master_auth[0].client_certificate
    # client_key                 = google_container_cluster.nxpod.master_auth[0].client_key
    username = google_container_cluster.nxpod.master_auth[0].username
    password = google_container_cluster.nxpod.master_auth[0].password
  }
}

resource "local_file" "nxpod_cluster_kubeconfig" {
  depends_on = [
    google_container_node_pool.nxpod_cluster
  ]

  content  = data.template_file.kubeconfig.rendered
  filename = "${path.root}/secrets/kubeconfig"
}

resource "null_resource" "kubernetes_credentials" {
  depends_on = [
    google_container_cluster.nxpod
  ]

  provisioner "local-exec" {
    command = "gcloud container clusters get-credentials $CLUSTER --region $REGION --project $PROJECT"

    environment = {
      CLUSTER = google_container_cluster.nxpod.name
      REGION  = var.location
      PROJECT = var.project
    }
  }
}

resource "null_resource" "done" {
  depends_on = [
    google_container_node_pool.nxpod_cluster
  ]
}

/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the MIT License. See License-MIT.txt in the project root for license information.
 */


resource "google_project_service" "project" {
  project = var.project
  service = "compute.googleapis.com"

  disable_on_destroy = false
}

resource "random_id" "nxpod" {
  byte_length = 2
}

resource "google_compute_network" "nxpod" {
  name                    = "${var.name}-${random_id.nxpod.hex}"
  description             = "Nxpod Cluster Network"
  auto_create_subnetworks = true

  depends_on = [
    google_project_service.project
  ]
}

resource "google_compute_address" "nxpod" {
  name = "nxpod-static-ip"

  project = var.project
  region  = var.region

  depends_on = [
    google_project_service.project
  ]
}

resource "null_resource" "done" {
  depends_on = [
    google_compute_network.nxpod
  ]
}

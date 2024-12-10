/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the MIT License. See License-MIT.txt in the project root for license information.
 */

#
# GCP Region
#

data "google_compute_zones" "available" {
  project = var.project
  region  = var.region
}



# https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/id
resource "random_id" "nxpod" {
    byte_length = 2
}



#
# VPC Network
#

resource "google_compute_network" "nxpod" {
  name                    = "${var.name}-${random_id.nxpod.hex}"
  description             = "Nxpod Cluster Network"
  auto_create_subnetworks = false
}



#
# VPC Subnetworks
#

resource "google_compute_subnetwork" "nxpod" {
  count                    = length(data.google_compute_zones.available.names)
  name                     = "${google_compute_network.nxpod.name}-${random_id.nxpod.hex}-${count.index}"
  ip_cidr_range            = "10.${count.index}.0.0/16"
  region                   = var.region
  network                  = google_compute_network.nxpod.id
  private_ip_google_access = true
}


#
# End
#

resource "null_resource" "done" {
  depends_on = [
    google_compute_subnetwork.nxpod
  ]
}

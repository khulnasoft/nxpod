/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the MIT License. See License-MIT.txt in the project root for license information.
 */

#
# Enable Service APIs
#

# # https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_project_service
# resource "google_project_service" "nxpod_database" {
#   count   = length(local.google_services)
#   project = var.project
#   service = local.google_services[count.index]
#   disable_dependent_services = false
# }
# # https://registry.terraform.io/providers/hashicorp/time/latest/docs/resources/sleep
# resource "time_sleep" "nxpod_database" {
#   create_duration = "60s"
#   depends_on = [
#     google_project_service.nxpod_database
#   ]
# }



#
# Network Configuration
#

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_global_address
resource "google_compute_global_address" "nxpod_database" {
  name          = "${var.project}-nxpod-db-private-ip"
  address_type  = "INTERNAL"
  purpose       = "VPC_PEERING"
  prefix_length = 16
  network       = var.network.id
  project       = var.project
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/service_networking_connection
resource "google_service_networking_connection" "nxpod_database" {
  network                 = var.network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.nxpod_database.name]
}



#
# Cloud SQL Instance
#

# https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/password
resource "random_password" "nxpod_database_root" {
  length  = 32
  special = false
}

# https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/id
resource "random_id" "nxpod_database" {
  byte_length = 2
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database_instance
resource "google_sql_database_instance" "nxpod_database" {
  name             = "${var.database.name}-${random_id.nxpod_database.hex}"
  database_version = var.database.version
  region           = var.region

  root_password = random_password.nxpod_database_root.result

  settings {
    tier      = var.database.tier
    disk_type = var.database.disk_type
    disk_size = var.database.disk_size
    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network.id
    }
  }

  depends_on = [
    google_service_networking_connection.nxpod_database,
  ]

}



#
# SQL Databases
#

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database
resource "google_sql_database" "nxpod_database" {
  count     = length(var.database.tables)
  name      = var.database.tables[count.index]
  instance  = google_sql_database_instance.nxpod_database.name
  charset   = var.database.charset
  collation = var.database.collation
}



#
# DB User
#

# https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/password
resource "random_password" "nxpod_database_user" {
  length  = 32
  special = false
}

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_user
resource "google_sql_user" "nxpod_database" {
  name     = var.database.username
  instance = google_sql_database_instance.nxpod_database.name
  password = random_password.nxpod_database_user.result
  project  = var.project
}

# https://registry.terraform.io/providers/hashicorp/template/latest/docs/data-sources/file
data "template_file" "nxpod_values_database" {
  template = file("${path.module}/templates/values.tpl")
  vars = {
    host     = google_sql_database_instance.nxpod_database.private_ip_address
    password = google_sql_user.nxpod_database.password
  }
}

#
# Network Peering
#

# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_network_peering_routes_config
resource "google_compute_network_peering_routes_config" "nxpod_database" {
  count   = length(local.google_network_peering_routes)
  peering = local.google_network_peering_routes[count.index]
  network = var.network.name

  import_custom_routes = true
  export_custom_routes = true

  depends_on = [
    google_sql_database_instance.nxpod_database
  ]

}



# https://registry.terraform.io/providers/hashicorp/time/latest/docs/resources/sleep
resource "time_sleep" "nxpod_database_peering" {
  create_duration = "600s"
  depends_on = [
    google_sql_database.nxpod_database,
    google_compute_network_peering_routes_config.nxpod_database
  ]
}



#
# Kubernetes Resources
#

# https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs/resources/secret
resource "kubernetes_secret" "nxpod_database" {
  metadata {
    name      = "${var.database.name}-${random_id.nxpod_database.hex}"
    namespace = var.nxpod.namespace
  }

  data = {
    host          = google_sql_database_instance.nxpod_database.private_ip_address
    root-password = google_sql_database_instance.nxpod_database.root_password
    user          = google_sql_user.nxpod_database.name
    password      = google_sql_user.nxpod_database.password
  }

  # This dependency is added to make sure that the kubernetes cluster is up and running before any kubernetes resource would be deployed
  depends_on = [
    time_sleep.nxpod_database_peering,
    var.requirements
  ]


}

# https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs/resources/job
resource "kubernetes_job" "mysql_initializer" {
  metadata {
    name      = "gp-db-init-${random_id.nxpod_database.hex}"
    namespace = var.nxpod.namespace
  }
  spec {
    template {
      metadata {}
      spec {
        container {
          name    = "db-initialization"
          image   = "gcr.io/khulnasoft/db-migrations:v0.4.0-dev-selfhosted-nxpod-db-init.15"
          command = ["/init.sh", "&&", "echo", "finished"]
          env {
            name = "MYSQL_HOST"
            value_from {
              secret_key_ref {
                name = "${var.database.name}-${random_id.nxpod_database.hex}"
                key  = "host"
              }
            }
          }
          env {
            name  = "MYSQL_USER"
            value = "nxpod"
          }
          env {
            name  = "MYSQL_PORT"
            value = "3306"
          }
          env {
            name = "MYSQL_ROOT_PASSWORD"
            value_from {
              secret_key_ref {
                name = "${var.database.name}-${random_id.nxpod_database.hex}"
                key  = "password"
              }
            }
          }
        }
        restart_policy = "Never"
      }
    }
    backoff_limit = 4
  }

  # This dependency is added to make sure that the kubernetes cluster is up and running before any kubernetes resource would be deployed
  depends_on = [
    time_sleep.nxpod_database_peering,
    kubernetes_secret.nxpod_database,
    var.requirements
  ]

}



#
# End
#

resource "null_resource" "done" {
  depends_on = [
    kubernetes_secret.nxpod_database,
    kubernetes_job.mysql_initializer,
  ]
}

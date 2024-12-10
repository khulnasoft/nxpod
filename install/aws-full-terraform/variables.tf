variable "project" {
  type = object({
    name = string
  })
  default = {
    name = "self-hosted"
  }
}

variable "nxpod" {
  type = object({
    namespace  = string
    valuesFile = string
  })
  default = {
    namespace  = "default"
    valuesFile = "./values.yml"
  }
}

variable "aws" {
  type = object({
    region  = string
    profile = string
  })
  default = {
    region  = "us-east-2"
    profile = "default"
  }
}

variable "kubernetes" {
  type = object({
    cluster_name  = string
    home_dir      = string
    version       = string
    node_count    = number
    instance_type = string
  })
  default = {
    cluster_name  = "nxpod-cluster"
    version       = "1.16"
    node_count    = 6
    instance_type = "m4.large"
    home_dir      = "/home/nxpod"
  }
}

variable "dns" {
  type = object({
    domain    = string
    zone_name = string
  })
}

variable "cert_manager" {
  type = object({
    chart     = string
    email     = string
    namespace = string
  })
}


variable "database" {
  type = object({
    name           = string
    port           = number
    instance_class = string
    engine_version = string
    user_name      = string
    password       = string
  })
  default = {
    name           = "nxpod"
    user_name      = "nxpod"
    password       = random_password.mysql_password.result
    engine_version = "5.7.26"
    port           = 3306
    instance_class = "db.t2.micro"
  }
}


variable "auth_providers" {
  type = list(
    object({
      id            = string
      host          = string
      client_id     = string
      client_secret = string
      settings_url  = string
      callback_url  = string
      protocol      = string
      type          = string
    })
  )
}

variable "vpc" {
  type = object({
    name = string
  })
  default = {
    name = "nxpod-network"
  }
}

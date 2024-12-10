/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the MIT License. See License-MIT.txt in the project root for license information.
 */

variable "project" {
  type = string
}

variable "location" {
  type    = string
  default = "EU"
}

variable "hostname" {
  type    = string
  default = "gcr.io"
}

variable "nxpod" {
  type = object({
    namespace = string
  })
  default = {
    namespace = "default"
  }
}

variable "requirements" {
  type = object({
    kubernetes = string
  })
}

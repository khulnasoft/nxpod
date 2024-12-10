variable "project" {
  type = object({
    name = string
  })
}


variable "worker_iam_role_name" {
  type = string
}

variable "region" {
  type = string
}

variable "nxpod" {
  type = object({
    namespace = string
  })
}

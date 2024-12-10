variable "preview_name" {
  type        = string
  description = "name of the preview env"
}

variable "preview_ip" {
  type        = string
  description = "IP for the preview env: ingress in cluster, or machine ip"
}

variable "workspace_ip" {
  type        = string
  description = "IP for the workspace: LB in dev cluster for previews, or machine ip"
}

variable "cert_issuer" {
  type        = string
  default     = "letsencrypt-issuer-nxpod-core-dev"
  description = "Certificate issuer"
}

variable "gcp_project_dns" {
  type        = string
  default     = "nxpod-core-dev"
  description = "The GCP project in which to create DNS records"
}

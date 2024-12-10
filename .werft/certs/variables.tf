variable "namespace" {
    type = string
}

# e.g.: nxpod-dev.com
variable "dns_zone_domain" {
    type = string
}

# e.g.: my-branch.staging.nxpod-dev.com
variable "domain" {
    type = string
}

# e.g.: ["", "*.", "*.ws."]
variable "subdomains" {
    type = list(string)
}
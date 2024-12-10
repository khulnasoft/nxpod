/**
 * Copyright (c) 2020 TypeFox GmbH. All rights reserved.
 * Licensed under the MIT License. See License-MIT.txt in the project root for license information.
 */

#
#
#

output "zone" {
  value = google_dns_managed_zone.nxpod
}

output "static_ip" {
  value = google_compute_address.nxpod.address
}

output "done" {
  value = null_resource.done.id
}

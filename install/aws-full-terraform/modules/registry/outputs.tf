output "output" {
  value = local.registry
}

output "values" {
  value = data.template_file.nxpod_registry_values.rendered
}
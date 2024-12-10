output "instance" {
  value = local.database
}

output "values" {
  value = data.template_file.nxpod_values_database.rendered
}

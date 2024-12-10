locals {
  database = {
    host     = aws_db_instance.nxpod.address
    port     = aws_db_instance.nxpod.port
    username = aws_db_instance.nxpod.username
    password = aws_db_instance.nxpod.password
  }
}

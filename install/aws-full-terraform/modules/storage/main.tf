#
# S3 Bucket
#

resource "aws_s3_bucket" "nxpod_storage" {
  bucket = "${var.project.name}-storage"
  acl    = "private"
  tags = {
    project = var.project.name
  }
}

resource "aws_s3_access_point" "nxpod_storage" {
  bucket = aws_s3_bucket.nxpod_storage.id
  name   = "${var.project.name}-storage"
  vpc_configuration {
    vpc_id = var.vpc_id
  }
}


resource "aws_s3_bucket_policy" "nxpod_storage" {
  bucket = aws_s3_bucket.nxpod_storage.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Principal": {
          "AWS": "${aws_iam_user.nxpod_storage.arn}"
      },
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["${aws_s3_bucket.nxpod_storage.arn}"]
    },
    {
      "Principal": {
          "AWS": "${aws_iam_user.nxpod_storage.arn}"
      },
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": ["${aws_s3_bucket.nxpod_storage.arn}/*"]
    }
  ]
}
EOF
}


#
# IAM
#

resource "aws_iam_user" "nxpod_storage" {
  name = "${var.project.name}-storage"

  tags = {
    project = var.project.name
  }
}



resource "aws_iam_user_policy" "nxpod_storage" {
  name = "${var.project.name}-storage"

  policy = <<-EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": "*"
        },
        {
            "Sid": "readonly",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket",
                "s3:HeadBucket"
            ],
            "Resource": "${aws_s3_bucket.nxpod_storage.arn}"
        }
    ]
}
EOF
  user   = aws_iam_user.nxpod_storage.name
}


resource "aws_iam_access_key" "nxpod_storage" {
  user = aws_iam_user.nxpod_storage.name
}


resource "helm_release" "nxpod_storage" {
  name       = "minio"
  repository = "https://helm.min.io"
  chart      = "minio"
  wait       = false


  set {
    name  = "fullnameOverride"
    value = "minio"
  }

  set {
    name  = "accessKey"
    value = aws_iam_access_key.nxpod_storage.id
  }

  set {
    name  = "secretKey"
    value = aws_iam_access_key.nxpod_storage.secret
  }


  set {
    name  = "s3gateway.accessKey"
    value = aws_iam_access_key.nxpod_storage.id
  }

  set {
    name  = "s3gateway.secretKey"
    value = aws_iam_access_key.nxpod_storage.secret
  }

  set {
    name  = "s3gateway.enabled"
    value = "true"
  }

  set {
    name  = "s3gateway.replicas"
    value = 1
  }
}



data "template_file" "nxpod_storage" {
  template = file("${path.module}/templates/values.tpl")
  vars = {
    access_key = aws_iam_access_key.nxpod_storage.id
    secret_key = aws_iam_access_key.nxpod_storage.secret
  }
}

locals {
  bucket_name = join(".", compact([var.name, var.environment]))
}

resource "aws_s3_bucket" "spa" {
  bucket = local.bucket_name

  force_destroy = true

  tags = {
    origin      = "terraform"
    entity      = var.name
    environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "spa_access" {
  bucket = aws_s3_bucket.spa.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "spa_bucket_policy" {
  depends_on = [aws_s3_bucket_public_access_block.spa_access]

  bucket = aws_s3_bucket.spa.id
  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AddPerm",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::${local.bucket_name}/*"
            ]
        }
    ]
}
POLICY

}

resource "aws_s3_bucket_website_configuration" "spa_bucket_website" {
  bucket = aws_s3_bucket.spa.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Resource to avoid error "AccessControlListNotSupported: The bucket does not allow ACLs"
resource "aws_s3_bucket_ownership_controls" "s3_bucket_acl_ownership" {
  depends_on = [aws_s3_bucket_public_access_block.spa_access]
  bucket     = aws_s3_bucket.spa.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "spa_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.s3_bucket_acl_ownership]

  bucket = aws_s3_bucket.spa.id
  acl    = "public-read"
}

resource "null_resource" "spa" {
  depends_on = [aws_s3_bucket.spa, aws_s3_bucket_ownership_controls.s3_bucket_acl_ownership]

  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    working_dir = var.source-files
    command     = "aws s3 sync . s3://$BUCKET --acl public-read --delete"

    environment = {
      BUCKET = aws_s3_bucket.spa.bucket
    }
  }

}

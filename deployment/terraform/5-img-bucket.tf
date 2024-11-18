resource "aws_s3_bucket" "image" {
  bucket        = "${var.app-name}-${var.env}-image"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "image-access" {
  bucket = aws_s3_bucket.image.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

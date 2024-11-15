resource "random_pet" "image_bucket_name" {
  prefix = "${var.app-name}-${var.env}-image"
  length = 2
}

resource "aws_s3_bucket" "image" {
  bucket        = random_pet.image_bucket_name.id
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "image-access" {
  bucket = aws_s3_bucket.image.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

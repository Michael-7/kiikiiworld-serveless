resource "random_pet" "lambda_bucket_name" {
  prefix = "${var.app-name}-${var.env}-lambdas"
  length = 2
}

resource "aws_s3_bucket" "lambda" {
  bucket        = random_pet.lambda_bucket_name.id
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "lambda-access" {
  bucket = aws_s3_bucket.lambda.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

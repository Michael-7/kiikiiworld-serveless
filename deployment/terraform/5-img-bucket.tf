resource "aws_s3_bucket" "image" {
  bucket        = "${var.app-name}-${var.env}-image"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "image_access" {
  bucket = aws_s3_bucket.image.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "image_cors" {
  bucket = aws_s3_bucket.image.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST"]
    allowed_origins = ["*"] #TODO Lock this down to specific url
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}

# resource "aws_s3_bucket_policy" "image_size" {
#   bucket = aws_s3_bucket.image.id

#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Sid       = "AllowOnlyImagesUnder5MB"
#         Effect    = "Allow"
#         Principal = "*"
#         Action    = "s3:PutObject"
#         Resource  = "${aws_s3_bucket.image.arn}/*"
#         Condition = {
#           StringLike = {
#             "s3:RequestObjectKey" : ["*.jpg", "*.jpeg", "*.png", "*.gif"]
#           }
#         }
#       }
#     ]
#   })  
# }

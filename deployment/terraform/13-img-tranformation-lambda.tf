resource "aws_iam_role" "image_transform_role" {
  name = "${var.app-name}-image-transformation-${var.env}-lamda-role"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy_attachment" "this" {
  role       = aws_iam_role.image_transform_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "this" {
  function_name = "${var.app-name}-image-transformation-${var.env}"

  s3_bucket = aws_s3_bucket.lambda.id
  s3_key    = aws_s3_object.image_transform_zip.key

  runtime = "nodejs20.x"
  handler = "image-transformation.handler"

  timeout = 6

  source_code_hash = data.archive_file.image_transform_zip_file.output_base64sha256

  role = aws_iam_role.image_transform_role.arn
  layers = ["arn:aws:lambda:eu-central-1:329806435145:layer:node-sharp-layer:1"]
}

resource "aws_cloudwatch_log_group" "this" {
  name = "/aws/lambda/${aws_lambda_function.this.function_name}"

  retention_in_days = 14
}

// This will need to change once we do it in a pipeline because this has side effects
data "archive_file" "image_transform_zip_file" {
  type = "zip"

  source_dir  = "../../backend/image-transformation"
  output_path = "../../backend/compiled-functions/${var.app-name}-image-transformation.zip"
}

resource "aws_s3_object" "image_transform_zip" {
  bucket = aws_s3_bucket.lambda.id

  key    = "${var.app-name}-image-transformation.zip"
  source = data.archive_file.image_transform_zip_file.output_path

  etag = filemd5(data.archive_file.image_transform_zip_file.output_path)
}

####################################################################

# POLICY
data "aws_iam_policy_document" "s3_policy" {
  statement {
    effect = "Allow"
    actions = ["s3:PutObject", "s3:GetObject"]
    resources = ["${aws_s3_bucket.image.arn}/*"]
  }
}

resource "aws_iam_policy" "lambda_image_transform_s3" {
  name        = "lambda-image-transform-s3"
  description = "Image Lambda policies"
  policy      = data.aws_iam_policy_document.s3_policy.json
}

resource "aws_iam_role_policy_attachment" "img_transform_lambda_policy" {
  role       = aws_iam_role.image_transform_role.name
  policy_arn = aws_iam_policy.lambda_image_transform_s3.arn
}

# Allow S3 to invoke the Lambda
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.image.arn
}

# S3 Bucket Notification that triggers the Lambda
resource "aws_s3_bucket_notification" "trigger_lambda" {
  bucket = aws_s3_bucket.image.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.this.arn
    events = ["s3:ObjectCreated:*"]
    filter_prefix       = "original/"
    filter_suffix       = ".jpg"
  }

  lambda_function {
    lambda_function_arn = aws_lambda_function.this.arn
    events = ["s3:ObjectCreated:*"]
    filter_prefix       = "original/"
    filter_suffix       = ".png"
  }

  depends_on = [aws_lambda_permission.allow_s3]
}


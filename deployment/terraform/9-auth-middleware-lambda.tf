# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_authorizer

# LAMBDA FUNCTIE
resource "aws_iam_role" "this" {
  name = "${var.app-name}-auth-middleware-${var.env}-lamda-role"

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
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "this" {
  function_name = "${var.app-name}-auth-middleware-${var.env}"

  s3_bucket = aws_s3_bucket.lambda.id
  s3_key    = aws_s3_object.this.key

  runtime = "nodejs20.x"
  handler = "auth-middleware-lambda.handler"

  timeout = 6

  source_code_hash = data.archive_file.this.output_base64sha256

  role = aws_iam_role.this.arn
}

resource "aws_cloudwatch_log_group" "this" {
  name = "/aws/lambda/${aws_lambda_function.this.function_name}"

  retention_in_days = 14
}

// This will need to change once we do it in a pipeline because this has side effects
data "archive_file" "this" {
  type = "zip"

  source_dir  = "../../backend/auth-middleware"
  output_path = "../../backend/compiled-functions/${var.app-name}-auth-middleware.zip"
}

resource "aws_s3_object" "this" {
  bucket = aws_s3_bucket.lambda.id

  key    = "${var.app-name}-auth-middleware.zip"
  source = data.archive_file.this.output_path

  etag = filemd5(data.archive_file.this.output_path)
}

// API Gateway v2
resource "aws_apigatewayv2_authorizer" "auth_middleware" {
  api_id                            = aws_apigatewayv2_api.this.id
  authorizer_type                   = "REQUEST"
  authorizer_uri                    = aws_lambda_function.this.invoke_arn
  identity_sources = ["$request.header.Auth"]
  name                              = "auth_middleware-authorizer"
  authorizer_payload_format_version = "1.0"
}

// API Gateway V1
# resource "aws_api_gateway_authorizer" "auth_middleware" {
#   name                   = "auth_middleware"
#   rest_api_id            = aws_apigatewayv2_api.this.id
#   authorizer_uri         = aws_lambda_function.this.invoke_arn
#   authorizer_credentials = aws_iam_role.invocation_role.arn
# }
#
# data "aws_iam_policy_document" "invocation_assume_role" {
#   statement {
#     effect = "Allow"
#
#     principals {
#       type = "Service"
#       identifiers = ["apigateway.amazonaws.com"]
#     }
#
#     actions = ["sts:AssumeRole"]
#   }
# }
#
# resource "aws_iam_role" "invocation_role" {
#   name               = "api_gateway_auth_invocation"
#   path               = "/"
#   assume_role_policy = data.aws_iam_policy_document.invocation_assume_role.json
# }
#
# data "aws_iam_policy_document" "invocation_policy" {
#   statement {
#     effect = "Allow"
#     actions = ["lambda:InvokeFunction"]
#     resources = [aws_lambda_function.this.arn]
#   }
# }
#
# resource "aws_iam_role_policy" "invocation_policy" {
#   name   = "default"
#   role   = aws_iam_role.invocation_role.id
#   policy = data.aws_iam_policy_document.invocation_policy.json
# }


# module "auth_lambda" {
#   source = "./modules/lambda"
#
#   env                       = var.env
#   name                      = "${var.app-name}-auth-middleware"
#   filename                  = "auth-middleware-lambda"
#   source_dir                = "../../backend/auth-middleware"
#   lambda_bucket_id          = aws_s3_bucket.lambda.id
#   api_gateway_id            = aws_apigatewayv2_api.this.id
#   api_gateway_execution_arn = aws_apigatewayv2_api.this.execution_arn
# }
#
# # POLICY
# resource "aws_iam_role_policy_attachment" "auth_lambda_policy" {
#   role       = module.auth_lambda.role_name
#   policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
# }



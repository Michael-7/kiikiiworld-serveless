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

resource "aws_lambda_permission" "allow_apigw_invocation_admin" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_lambda_permission" "allow_apigw_invocation_user" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_lambda_function" "admin" {
  function_name = "${var.app-name}-auth-admin-middleware-${var.env}"

  s3_bucket = aws_s3_bucket.lambda.id
  s3_key    = aws_s3_object.this.key

  runtime = "nodejs20.x"
  handler = "auth-middleware-lambda.handler"

  timeout = 3

  source_code_hash = data.archive_file.this.output_base64sha256

  role = aws_iam_role.this.arn

  environment {
    variables = {
      role = "ADMIN"
    }
  }
}

resource "aws_lambda_function" "user" {
  function_name = "${var.app-name}-auth-user-middleware-${var.env}"

  s3_bucket = aws_s3_bucket.lambda.id
  s3_key    = aws_s3_object.this.key

  runtime = "nodejs20.x"
  handler = "auth-middleware-lambda.handler"

  timeout = 3

  source_code_hash = data.archive_file.this.output_base64sha256

  role = aws_iam_role.this.arn

  environment {
    variables = {
      role = "USER"
    }
  }
}

resource "aws_cloudwatch_log_group" "admin" {
  name = "/aws/lambda/${aws_lambda_function.admin.function_name}"

  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "user" {
  name = "/aws/lambda/${aws_lambda_function.user.function_name}"

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

// API Gateway v2 Authorizers
resource "aws_apigatewayv2_authorizer" "admin" {
  api_id                            = aws_apigatewayv2_api.this.id
  authorizer_type                   = "REQUEST"
  authorizer_uri                    = aws_lambda_function.admin.invoke_arn
  identity_sources = ["$request.header.Authorization"]
  name                              = "admin-authorizer"
  authorizer_payload_format_version = "2.0"
  enable_simple_responses           = true
  authorizer_result_ttl_in_seconds  = 0
}

resource "aws_apigatewayv2_authorizer" "user" {
  api_id                            = aws_apigatewayv2_api.this.id
  authorizer_type                   = "REQUEST"
  authorizer_uri                    = aws_lambda_function.user.invoke_arn
  identity_sources = ["$request.header.Authorization"]
  name                              = "user-authorizer"
  authorizer_payload_format_version = "2.0"
  enable_simple_responses           = true
  authorizer_result_ttl_in_seconds  = 0
}

resource "aws_iam_role" "test_lambda_role" {
  name = "${var.app-name}-${var.env}-test-lambda-role"

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

resource "aws_iam_role_policy_attachment" "test_lambda_policy" {
  role       = aws_iam_role.test_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# // THIS WILL NEED TO BE MORE GRANULAR WE NEED ACCESS TO SECRETS MANAGER DB_CREDENTIALS
resource "aws_iam_role_policy_attachment" "test_lambda_policy_2" {
  role       = aws_iam_role.test_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_lambda_function" "this" {
  function_name = "${var.app-name}-${var.env}-test"

  s3_bucket = aws_s3_bucket.lambda.id
  s3_key    = aws_s3_object.lambda_test.key

  runtime = "nodejs20.x"
  handler = "index.handler"

  timeout = 15

  source_code_hash = data.archive_file.lambda_test.output_base64sha256

  role = aws_iam_role.test_lambda_role.arn
}

resource "aws_cloudwatch_log_group" "test_lambda" {
  name = "/aws/lambda/${aws_lambda_function.this.function_name}"

  retention_in_days = 14
}

// This will need to change once we do it in a pipeline because this has side effects
data "archive_file" "lambda_test" {
  type = "zip"

  source_dir  = "../../backend/test"
  output_path = "../../backend/compiled-functions/test.zip"
}

resource "aws_s3_object" "lambda_test" {
  bucket = aws_s3_bucket.lambda.id

  key    = "test.zip"
  source = data.archive_file.lambda_test.output_path

  etag = filemd5(data.archive_file.lambda_test.output_path)
}

// ############## GATEWAY CONNECTION ###########################

resource "aws_apigatewayv2_integration" "lambda_test" {
  api_id = aws_apigatewayv2_api.this.id

  integration_uri    = aws_lambda_function.this.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_test" {
  api_id = aws_apigatewayv2_api.this.id

  route_key = "GET /test"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_test.id}"
}

resource "aws_apigatewayv2_route" "post_test" {
  api_id = aws_apigatewayv2_api.this.id

  route_key = "POST /test"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_test.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}


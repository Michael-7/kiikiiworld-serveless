resource "aws_iam_role" "this" {
  name = "${var.name}-${var.env}-lamda-role"

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
  function_name = "${var.name}-${var.env}"

  s3_bucket = var.lambda_bucket_id
  s3_key    = aws_s3_object.this.key

  runtime = "nodejs20.x"
  handler = "${var.filename}.handler"

  timeout = var.timeout

  source_code_hash = data.archive_file.this.output_base64sha256

  role   = aws_iam_role.this.arn
  layers = var.layers
}

resource "aws_cloudwatch_log_group" "this" {
  name = "/aws/lambda/${aws_lambda_function.this.function_name}"

  retention_in_days = 14
}

// This will need to change once we do it in a pipeline because this has side effects
data "archive_file" "this" {
  type = "zip"

  source_dir  = var.source_dir
  output_path = "../../backend/compiled-functions/${var.name}.zip"
}

resource "aws_s3_object" "this" {
  bucket = var.lambda_bucket_id

  key    = "${var.name}.zip"
  source = data.archive_file.this.output_path

  etag = filemd5(data.archive_file.this.output_path)
}

// ############## GATEWAY CONNECTION ###########################

resource "aws_apigatewayv2_integration" "this" {
  api_id = var.api_gateway_id

  integration_uri    = aws_lambda_function.this.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_lambda_permission" "this" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${var.api_gateway_execution_arn}/*/*"
}


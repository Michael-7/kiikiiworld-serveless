module "auth_lambda" {
  source = "./modules/lambda"

  env                       = var.env
  name                      = "${var.app-name}-auth"
  filename                  = "auth-lambda"
  source_dir                = "../../backend/auth"
  lambda_bucket_id          = aws_s3_bucket.lambda.id
  api_gateway_id            = aws_apigatewayv2_api.this.id
  api_gateway_execution_arn = aws_apigatewayv2_api.this.execution_arn
  layers = ["arn:aws:lambda:eu-central-1:187925254637:layer:AWS-Parameters-and-Secrets-Lambda-Extension:12"]
}

# POLICY
resource "aws_iam_role_policy_attachment" "auth_lambda_policy" {
  role       = module.auth_lambda.role_name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

// TODO: can this policy be shared between 9-auth-middleware-lambda?
resource "aws_iam_role_policy" "auth_secrets" {
  role   = module.auth_lambda.role_name
  name   = "${var.app-name}-auth-${var.env}-secrets-policy"
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowSecretsManagerAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:eu-central-1:329806435145:secret:kiikiiworld-live-hj0YBK"
    }
  ]
}
POLICY
}

# API GATEWAT ENDPOINTS
## LOGIN
resource "aws_apigatewayv2_route" "get_auth_login" {
  api_id = aws_apigatewayv2_api.this.id

  route_key = "GET /login"
  target    = "integrations/${module.auth_lambda.api_gateway_intergration_id}"
}

resource "aws_apigatewayv2_route" "post_auth_login" {
  api_id = aws_apigatewayv2_api.this.id

  route_key = "POST /login"
  target    = "integrations/${module.auth_lambda.api_gateway_intergration_id}"
}

resource "aws_apigatewayv2_route" "options_auth_login" {
  api_id = aws_apigatewayv2_api.this.id

  route_key = "OPTIONS /login"
  target    = "integrations/${module.auth_lambda.api_gateway_intergration_id}"
}

## REGISTER
resource "aws_apigatewayv2_route" "get_auth_register" {
  api_id = aws_apigatewayv2_api.this.id

  route_key = "GET /register"
  target    = "integrations/${module.auth_lambda.api_gateway_intergration_id}"
}

resource "aws_apigatewayv2_route" "post_auth_register" {
  api_id = aws_apigatewayv2_api.this.id

  route_key = "POST /register"
  target    = "integrations/${module.auth_lambda.api_gateway_intergration_id}"
}

resource "aws_apigatewayv2_route" "options_auth_register" {
  api_id = aws_apigatewayv2_api.this.id

  route_key = "OPTIONS /register"
  target    = "integrations/${module.auth_lambda.api_gateway_intergration_id}"
}

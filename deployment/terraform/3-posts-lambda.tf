module "posts_lambda" {
  source = "./modules/lambda"

  env = var.env
  name = "${var.app-name}-posts"
  filename = "posts-lambda"
  source_dir = "../../backend/posts"
  lambda_bucket_id = aws_s3_bucket.lambda.id
  api_gateway_id = aws_apigatewayv2_api.this.id
  api_gateway_execution_arn = aws_apigatewayv2_api.this.execution_arn
}

# POLICY
resource "aws_iam_role_policy_attachment" "posts_lambda_policy" {
  role       = module.posts_lambda.role_name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

# API GATEWAT ENDPOINTS
resource "aws_apigatewayv2_route" "get_posts" {
  api_id = aws_apigatewayv2_api.this.id

  route_key = "GET /posts"
  target    = "integrations/${module.posts_lambda.api_gateway_intergration_id}"
}

resource "aws_apigatewayv2_route" "post_posts" {
  api_id = aws_apigatewayv2_api.this.id

  route_key = "POST /posts"
  target    = "integrations/${module.posts_lambda.api_gateway_intergration_id}"
}


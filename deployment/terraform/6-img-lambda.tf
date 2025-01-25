module "img_lambda" {
  source = "./modules/lambda"

  env                       = var.env
  name                      = "${var.app-name}-image"
  filename                  = "image-lambda"
  source_dir                = "../../backend/image"
  lambda_bucket_id          = aws_s3_bucket.lambda.id
  api_gateway_id            = aws_apigatewayv2_api.this.id
  api_gateway_execution_arn = aws_apigatewayv2_api.this.execution_arn
}

# POLICY
data "aws_iam_policy_document" "policy" {
  statement {
    effect = "Allow"
    actions = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.image.arn}/*"]
  }
}

resource "aws_iam_policy" "lambda_image_s3" {
  name        = "lambda-image-s3"
  description = "Image Lambda policies"
  policy      = data.aws_iam_policy_document.policy.json
}

resource "aws_iam_role_policy_attachment" "img_lambda_policy" {
  role       = module.img_lambda.role_name
  policy_arn = aws_iam_policy.lambda_image_s3.arn
}

# API GATEWAT ENDPOINTS
resource "aws_apigatewayv2_route" "get_image" {
  api_id             = aws_apigatewayv2_api.this.id
  route_key          = "GET /image"
  target             = "integrations/${module.img_lambda.api_gateway_intergration_id}"
  authorization_type = "CUSTOM"
  authorizer_id      = aws_apigatewayv2_authorizer.admin.id
}

resource "aws_apigatewayv2_route" "post_image" {
  api_id             = aws_apigatewayv2_api.this.id
  route_key          = "POST /image"
  target             = "integrations/${module.img_lambda.api_gateway_intergration_id}"
  authorization_type = "CUSTOM"
  authorizer_id      = aws_apigatewayv2_authorizer.admin.id
}

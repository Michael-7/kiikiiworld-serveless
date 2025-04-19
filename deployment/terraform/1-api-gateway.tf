resource "aws_apigatewayv2_api" "this" {
  name          = var.app-name
  protocol_type = "HTTP"

  // TODO: Lock this down when i have a url
  cors_configuration {
    allow_origins = [
      "http://localhost:3000", "https://www.kiikiiworld.com", "https://kiikiiworld.com"
    ]
    allow_methods = ["POST", "GET", "OPTIONS", "DELETE", "PATCH"]
    allow_headers = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"]
    expose_headers = ["Content-Type", "Authorization"]

    allow_credentials = true
    max_age           = 300
  }
}

resource "aws_apigatewayv2_stage" "live" {
  api_id = aws_apigatewayv2_api.this.id

  name        = "live"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      authorizer              = "$context.authorizer.error"
    })
  }
}

resource "aws_apigatewayv2_domain_name" "this" {
  domain_name = "api.kiikiiworld.com"

  domain_name_configuration {
    certificate_arn = "arn:aws:acm:eu-central-1:329806435145:certificate/cdb5f377-8d38-4e26-adae-4319f2379e16"
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "mapping" {
  api_id          = aws_apigatewayv2_api.this.id
  domain_name     = aws_apigatewayv2_domain_name.this.id
  stage           = aws_apigatewayv2_stage.live.name
  api_mapping_key = "" # or set to path prefix if needed
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api-gw/${aws_apigatewayv2_api.this.name}"

  retention_in_days = 14
}

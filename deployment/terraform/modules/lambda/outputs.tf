output "role_name" {
  description = "The name of the role attached to the lambda function."
  value = aws_iam_role.this.name
}

output "api_gateway_intergration_id" {
  description = "The id of the rescources that attaches this lambda to a API gateway. Used to add routes."
  value = aws_apigatewayv2_integration.this.id
}

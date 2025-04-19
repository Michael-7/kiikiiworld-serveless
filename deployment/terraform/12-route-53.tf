resource "aws_route53_zone" "main" {
  name = "kiikiiworld.com" # Replace with your domain name
}

resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "kiikiiworld.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3-spa.domain_name
    zone_id                = aws_cloudfront_distribution.s3-spa.hosted_zone_id
    evaluate_target_health = false
  }
}

# Add a record for www.kiikiiworld.com
resource "aws_route53_record" "www_alias" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.kiikiiworld.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3-spa.domain_name
    zone_id                = aws_cloudfront_distribution.s3-spa.hosted_zone_id
    evaluate_target_health = false
  }
}

# Add a record for api.kiikiiworld.com
resource "aws_route53_record" "api_alias" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.kiikiiworld.com"
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.this.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.this.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# This is used to verify a cert when you want to create a new one.
# resource "aws_route53_record" "validation_record_1" {
#   zone_id = aws_route53_zone.main.zone_id
#   name    = "_6c2e6480f498d39542d885228f1b8923.kiikiiworld.com."
#   type    = "CNAME"
#   records = ["_538f339be319b4ef992396b4e0ef0745.zfyfvmchrl.acm-validations.aws."]
#   ttl     = 300
# }

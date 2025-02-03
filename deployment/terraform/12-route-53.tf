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

resource "aws_route53_record" "validation_record_1" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_6c2e6480f498d39542d885228f1b8923.kiikiiworld.com."
  type    = "CNAME"
  records = ["_538f339be319b4ef992396b4e0ef0745.zfyfvmchrl.acm-validations.aws."]
  ttl     = 300
}

resource "aws_route53_record" "validation_record_2" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_06636ffe0ef5ff30be88b91e80f2865e.www.kiikiiworld.com."
  type    = "CNAME"
  records = ["_842d129608ce74b9a29df8bab89d5b83.zfyfvmchrl.acm-validations.aws."]
  ttl     = 300
}

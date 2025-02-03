locals {
  bucket-name = join("-", compact([var.app-name, var.env, "spa"]))
  urls = ["kiikiiworld.com", "www.kiikiiworld.com"]
}

resource "aws_cloudfront_origin_access_identity" "s3-spa" {
  comment = local.bucket-name
}

resource "aws_cloudfront_distribution" "s3-spa" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = local.urls
  price_class         = "PriceClass_100"

  origin {
    domain_name = aws_s3_bucket_website_configuration.spa_bucket_website.website_endpoint
    origin_id   = local.bucket-name

    custom_origin_config {
      origin_protocol_policy = "http-only"
      http_port              = 80
      https_port             = 443
      origin_ssl_protocols = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = local.bucket-name

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy     = "redirect-to-https"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.spa-header-policy.id
  }
  #
  # ordered_cache_behavior {
  #   path_pattern     = "index.html"
  #   allowed_methods = ["GET", "HEAD"]
  #   cached_methods = ["GET", "HEAD"]
  #   target_origin_id = local.spa-origin-id
  #
  #   forwarded_values {
  #     query_string = false
  #
  #     cookies {
  #       forward = "none"
  #     }
  #   }
  #
  #   viewer_protocol_policy     = "redirect-to-https"
  #   response_headers_policy_id = aws_cloudfront_response_headers_policy.spa-index-header-policy.id
  # }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 404
    response_code         = 200
    response_page_path    = "/404.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = "arn:aws:acm:us-east-1:329806435145:certificate/95ba3e21-2664-4195-aa97-c84b1c4faf77"
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2019"
  }

  # viewer_certificate {
  #   cloudfront_default_certificate = true
  # }

  tags = {
    origin      = "terraform"
    entity      = var.app-name
    environment = var.env
  }

  lifecycle {
    create_before_destroy = true
  }
}

# TODO: THis needs to go on when everytihng is stable
resource "null_resource" "cloud-front" {
  depends_on = [aws_cloudfront_distribution.s3-spa]

  provisioner "local-exec" {
    command = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.s3-spa.id} --paths '/*'"
  }

  triggers = {
    always_run = timestamp()
  }
}

resource "aws_cloudfront_response_headers_policy" "spa-header-policy" {
  name = "spa-header-policy"

  security_headers_config {
    # content_security_policy {
    #   content_security_policy = "default-src 'self'; style-src 'self' 'unsafe-inline'"
    #   override                = false
    # }

    # content_type_options {
    #   override = false
    # }

    # frame_options {
    #   frame_option = "DENY"
    #   override     = false
    # }

    # referrer_policy {
    #   referrer_policy = "strict-origin-when-cross-origin"
    #   override        = false
    # }

    # xss_protection {
    #   override   = false
    #   protection = false
    # }
  }

  custom_headers_config {
    # items {
    #   header   = "Cache-Control"
    #   override = true
    #   value    = "max-age=604800, immutable"
    # }
    items {
      header   = "Cache-Control"
      override = true
      value    = "max-age=0, no-cache"
    }
  }
}
#
# resource "aws_cloudfront_response_headers_policy" "spa-index-header-policy" {
#   name = "spa-index-header-policy"
#
#   security_headers_config {
#     content_security_policy {
#       content_security_policy = "default-src 'self'; connect-src 'self' ${var.directus-url} analytics.ic.uva.nl; style-src 'self' 'unsafe-inline'"
#       override                = false
#     }
#
#     content_type_options {
#       override = false
#     }
#
#     frame_options {
#       frame_option = "DENY"
#       override     = false
#     }
#
#     referrer_policy {
#       referrer_policy = "strict-origin-when-cross-origin"
#       override        = false
#     }
#
#     xss_protection {
#       override   = false
#       protection = false
#     }
#   }
#
#   custom_headers_config {
#     items {
#       header   = "Cache-Control"
#       override = true
#       value    = "max-age=0, no-cache"
#     }
#   }
# }

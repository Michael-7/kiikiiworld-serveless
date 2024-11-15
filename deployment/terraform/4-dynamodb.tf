resource "aws_dynamodb_table" "blog_items" {
  name           = "${var.app-name}-${var.env}"
  billing_mode   = "PROVISIONED" #TODO when I go live this needs to be on-demand
  read_capacity  = 6
  write_capacity = 6
  hash_key       = "PostType"
  range_key      = "DateId"

  attribute {
    name = "DateId"
    type = "S"
  }

  attribute {
    name = "PostType"
    type = "S"
  }

  attribute {
    name = "YearMonth"
    type = "S"
  }

  ttl {
    attribute_name = "TimeToExist"
    enabled        = true
  }

  global_secondary_index {
    name               = "${var.app-name}-${var.env}-feed"
    hash_key           = "YearMonth"
    range_key          = "DateId"
    write_capacity     = 2
    read_capacity      = 2
    projection_type    = "ALL"
  }

  tags = {
    Name        = var.app-name
    Environment = var.env
  }
}

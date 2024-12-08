resource "aws_dynamodb_table" "blog_items" {
  name           = "${var.app-name}-${var.env}"
  billing_mode   = "PROVISIONED" #TODO when I go live this needs to be on-demand
  read_capacity  = 1
  write_capacity = 1
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
    name = "PostYear"
    type = "S"
  }

  ttl {
    attribute_name = "TimeToExist"
    enabled        = true
  }

  global_secondary_index {
    name               = "${var.app-name}-${var.env}-feed"
    hash_key           = "PostYear"
    range_key          = "DateId"
    write_capacity     = 1
    read_capacity      = 1
    projection_type    = "ALL"
  }

  tags = {
    Name        = var.app-name
    Environment = var.env
  }
}

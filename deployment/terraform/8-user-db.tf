resource "aws_dynamodb_table" "user_table" {
  name           = "${var.app-name}-users-${var.env}"
  billing_mode = "PROVISIONED" #TODO when I go live this needs to be on-demand
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "Username"

  attribute {
    name = "Username"
    type = "S"
  }

  ttl {
    attribute_name = "TimeToExist"
    enabled        = true
  }

  tags = {
    Name        = var.app-name
    Environment = var.env
  }
}

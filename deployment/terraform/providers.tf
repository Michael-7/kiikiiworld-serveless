provider "aws" {
  region = var.region
}

terraform {
  required_version = ">= 1.0"

  backend "s3" {
    bucket = "kiikiiworld-terraform-state"
    key    = "state"
    region = "eu-central-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.56"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.3.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
  }
}

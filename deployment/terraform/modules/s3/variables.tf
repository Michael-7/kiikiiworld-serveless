variable "name" {
  description = "The name of the s3 bucket."
  type        = string
}

variable "environment" {
  description = "Custom name that represents this environment type. (Example: prod)"
  type        = string
}

variable "source-files" {
  description = "The source directory for the s3 bucket files to upload. (Example: ../../)"
  type        = string
}

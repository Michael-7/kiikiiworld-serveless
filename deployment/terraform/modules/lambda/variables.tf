variable "name" {
  description = "The name of the lambda bucket."
  type        = string
}

variable "env" {
  description = "Custom name that represents this environment type. (Example: prod)"
  type        = string
}

variable "timeout" {
  description = "How long untill the function timesout."
  type        = number
  default     = 6
}

variable "filename" {
  description = "The filename of the lambda function."
  type        = string
  default     = "index"
}

variable "source_dir" {
  description = "The source directory where the lambda files are."
  type        = string
}

variable "lambda_bucket_id" {
  description = "The bucket id where the lambda function will be stored."
  type        = string
}

variable "api_gateway_id" {
  description = "The API Gateway ID this lambda will be a part of."
  type        = string
}

variable "api_gateway_execution_arn" {
  description = "The API Gateway execution arn this lambda will be a part of."
  type        = string
}

variable "layers" {
  description = "ARN's of lambda layers"
  type = list(string)
  default = []
}

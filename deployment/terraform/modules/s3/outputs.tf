output "fqdn" {
  description = "The bucket fqdn."
  value       = aws_s3_bucket.spa.bucket_domain_name
}

output "id" {
  description = "The bucket id."
  value       = aws_s3_bucket.spa.id
}

output "arn" {
  description = "The ARN of the bucket."
  value       = aws_s3_bucket.spa.arn
}

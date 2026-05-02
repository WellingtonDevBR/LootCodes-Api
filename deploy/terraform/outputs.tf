output "instance_id" {
  description = "Set GitHub Actions variable EC2_INSTANCE_IDS to this value."
  value       = aws_instance.api.id
}

output "public_ip" {
  description = "Effective public IPv4 for the API instance (Elastic IP if allocate_elastic_ip, else ephemeral)."
  value       = length(aws_eip.api) > 0 ? aws_eip.api[0].public_ip : aws_instance.api.public_ip
}

output "ec2_elastic_ip_allocation_id" {
  description = "EC2 Elastic IP allocation ID when allocate_elastic_ip is true."
  value       = try(aws_eip.api[0].id, null)
}

output "private_ip" {
  value = aws_instance.api.private_ip
}

output "api_url_example" {
  description = "Health check URL (use after deploy and .env)."
  value = (
    !var.enable_https_alb ? "http://${length(aws_eip.api) > 0 ? aws_eip.api[0].public_ip : aws_instance.api.public_ip}:3000/health" : (
      var.create_alb_https_listener ? "https://${var.api_fqdn}/health" : "http://${aws_lb.api[0].dns_name}/health"
    )
  )
}

output "alb_dns_name" {
  description = "ALB DNS hostname (for manual DNS or verification)."
  value       = var.enable_https_alb ? aws_lb.api[0].dns_name : null
}

output "https_api_url" {
  description = "Canonical HTTPS base URL after ACM is issued and create_alb_https_listener is true."
  value       = var.enable_https_alb && var.create_alb_https_listener ? "https://${var.api_fqdn}" : null
}

output "acm_dns_validation_records" {
  description = "CNAME records for ACM; after they propagate, set create_alb_https_listener = true and apply."
  value = var.enable_https_alb ? [
    for dvo in aws_acm_certificate.api[0].domain_validation_options : {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ] : []
}

output "ssm_session_hint" {
  description = "Connect without SSH using Session Manager."
  value       = "aws ssm start-session --target ${aws_instance.api.id} --region ${var.aws_region}"
}

output "security_group_id" {
  value = aws_security_group.api.id
}

output "iam_instance_profile_arn" {
  value = aws_iam_instance_profile.ec2.arn
}

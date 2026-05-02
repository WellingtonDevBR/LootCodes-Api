output "instance_id" {
  description = "Set GitHub Actions variable EC2_INSTANCE_IDS to this value."
  value       = aws_instance.api.id
}

output "public_ip" {
  description = "Public IPv4 (if associate_public_ip is true and subnet routes to IGW)."
  value       = aws_instance.api.public_ip
}

output "private_ip" {
  value = aws_instance.api.private_ip
}

output "api_url_example" {
  description = "Health check URL (use after deploy and .env)."
  value       = var.enable_https_alb ? "https://${var.api_fqdn}/health" : "http://${aws_instance.api.public_ip}:3000/health"
}

output "alb_dns_name" {
  description = "ALB DNS hostname (for manual DNS or verification)."
  value       = var.enable_https_alb ? aws_lb.api[0].dns_name : null
}

output "https_api_url" {
  description = "Canonical HTTPS base URL when ALB is enabled."
  value       = var.enable_https_alb ? "https://${var.api_fqdn}" : null
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

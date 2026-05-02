variable "aws_region" {
  type        = string
  description = "AWS region (e.g. us-east-1)."
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Used for resource names and tags."
  default     = "lootcodes-api"
}

variable "environment" {
  type        = string
  description = "Environment tag (e.g. production, staging)."
  default     = "production"
}

variable "ecr_repository_name" {
  type        = string
  description = "ECR repository name for API images (must exist or be created separately)."
  default     = "lootcodes-api"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type."
  default     = "t3.small"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID. Leave null to use the account default VPC."
  default     = null
}

variable "subnet_id" {
  type        = string
  description = "Subnet ID for the instance (public subnet recommended for a simple public API). Leave null to pick the first subnet in the chosen VPC."
  default     = null
}

variable "associate_public_ip" {
  type        = bool
  description = "Associate a public IPv4 address (typical for direct :3000 access without a load balancer)."
  default     = true
}

variable "api_ingress_cidr_blocks" {
  type        = list(string)
  description = "CIDRs allowed to reach the API on port 3000. Use your IP /32 (e.g. ['203.0.113.10/32']) and/or a load balancer subnet. Avoid 0.0.0.0/0 unless you accept the risk."
  default     = []
}

variable "ssh_ingress_cidr_blocks" {
  type        = list(string)
  description = "If non-empty, allow SSH (22) from these CIDRs. Prefer empty and use SSM Session Manager only."
  default     = []
}

variable "ec2_key_pair_name" {
  type        = string
  description = "Name of an existing EC2 key pair in this region (must match AWS Console → Key pairs). Use Eneba if you connect with Eneba.pem. Terraform does not create or upload the .pem file."
  default     = "Eneba"

  validation {
    condition = (
      length(var.ssh_ingress_cidr_blocks) == 0 ||
      (length(var.ec2_key_pair_name) > 0)
    )
    error_message = "When ssh_ingress_cidr_blocks is set, ec2_key_pair_name must be non-empty."
  }
}

variable "deploy_directory" {
  type        = string
  description = "Path on the instance for docker-compose.prod.yml and .env (must match GitHub Actions EC2_DEPLOY_DIR)."
  default     = "/opt/lootcodes-api"
}

variable "root_volume_size_gb" {
  type        = number
  description = "Root EBS volume size (GiB)."
  default     = 30
}

variable "enable_unrestricted_api_ingress" {
  type        = bool
  description = "If true, allow 0.0.0.0/0 on port 3000 (not recommended for production)."
  default     = false
}

variable "availability_zones_exclude" {
  type        = list(string)
  description = "Subnets in these AZs are skipped when auto-picking a subnet (e.g. us-east-1e often lacks t3 capacity)."
  default     = ["us-east-1e"]
}

variable "extra_tags" {
  type        = map(string)
  description = "Additional tags for all tagged resources."
  default     = {}
}

variable "enable_https_alb" {
  type        = bool
  description = "If true, create an internet-facing ALB with ACM TLS, HTTP→HTTPS redirect, and Route53 DNS validation. EC2 :3000 accepts traffic only from the ALB security group."
  default     = false
}

variable "api_fqdn" {
  type        = string
  description = "Public hostname for the API (e.g. api.lootcodes.com). Required when enable_https_alb is true. Used for ACM cert and optional Route53 alias."
  default     = ""
}

variable "route53_zone_id" {
  type        = string
  description = "Route53 hosted zone ID for the api_fqdn parent zone (e.g. Z... for lootcodes.com). If empty, create the ACM DNS validation CNAME at your DNS provider (see acm_dns_validation_records output), then re-run apply."
  default     = ""
}

variable "create_route53_alias_for_api" {
  type        = bool
  description = "When enable_https_alb is true, create an A (alias) record from api_fqdn to the ALB. Set false if you manage DNS elsewhere (update manually after apply)."
  default     = true
}

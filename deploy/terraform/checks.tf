# Fail fast when a public IP is requested but we would have fallen back to a private subnet.

check "https_alb_requires_dns_inputs" {
  assert {
    condition = (
      !var.enable_https_alb ||
      (length(var.api_fqdn) > 0 && length(var.route53_zone_id) > 0)
    )
    error_message = "When enable_https_alb is true, set api_fqdn and route53_zone_id (for ACM DNS validation records)."
  }
}

check "https_alb_requires_two_public_azs" {
  assert {
    condition = (
      !var.enable_https_alb ||
      length(local.alb_subnet_ids) >= 2
    )
    error_message = "enable_https_alb requires at least two public subnets in different availability_zones (map_public_ip_on_launch) outside availability_zones_exclude. Add subnets or set subnet_id / vpc_id appropriately."
  }
}

check "ec2_public_subnet_when_associate_public_ip" {
  assert {
    condition = (
      var.subnet_id != null ||
      !var.associate_public_ip ||
      local.subnet_id_auto_public != null
    )
    error_message = "associate_public_ip is true but no map_public_ip_on_launch subnet exists outside availability_zones_exclude. Set subnet_id in terraform.tfvars to a subnet with a route to an Internet Gateway (SSM and ECR need HTTPS egress), or set associate_public_ip = false and provide NAT/VPC endpoints."
  }
}

resource "aws_security_group" "api" {
  name_prefix = "${local.name_prefix}-sg-"
  description = var.enable_https_alb ? "LootCodes API EC2 - SSM egress; API :3000 from ALB only" : "LootCodes API EC2 - SSM egress, API on 3000 from allowed CIDRs only"
  vpc_id      = local.vpc_id

  # No default ingress; explicit rules below.

  egress {
    description      = "HTTPS (ECR, updates, etc.)"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    description = "HTTP (optional package mirrors)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  dynamic "ingress" {
    for_each = var.enable_https_alb ? [1] : []
    content {
      description     = "Fastify API port 3000 from ALB only"
      from_port       = 3000
      to_port         = 3000
      protocol        = "tcp"
      security_groups = [aws_security_group.alb[0].id]
    }
  }

  dynamic "ingress" {
    for_each = !var.enable_https_alb && length(local.api_ingress) > 0 ? [1] : []
    content {
      description = "Fastify API port 3000 (host and container)"
      from_port   = 3000
      to_port     = 3000
      protocol    = "tcp"
      cidr_blocks = local.api_ingress
    }
  }

  dynamic "ingress" {
    for_each = length(var.ssh_ingress_cidr_blocks) > 0 ? [1] : []
    content {
      description = "SSH (prefer SSM; restrict tightly)"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = var.ssh_ingress_cidr_blocks
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

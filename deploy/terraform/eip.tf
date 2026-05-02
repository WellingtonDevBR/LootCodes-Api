# Single public IPv4 for the API instance (stable across stop/start).
#
# Note: Application Load Balancers use AWS-managed addresses — you cannot attach
# a standard EC2 Elastic IP to an ALB. Expose the ALB via its DNS name or a
# Route53 alias; use this EIP only for direct EC2 access (e.g. :3000) or failover.
resource "aws_eip" "api" {
  count  = var.allocate_elastic_ip ? 1 : 0
  domain = "vpc"

  tags = merge(
    {
      Name        = "${local.name_prefix}-ec2-eip"
      Description = "LootCodes API EC2 — keep; release orphans via cleanup-extra-eips.sh"
    },
    var.extra_tags,
  )

  depends_on = [aws_instance.api]
}

resource "aws_eip_association" "api" {
  count         = var.allocate_elastic_ip ? 1 : 0
  instance_id   = aws_instance.api.id
  allocation_id = aws_eip.api[0].id
}

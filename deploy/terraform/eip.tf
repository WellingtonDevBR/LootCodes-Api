# Single *customer* Elastic IP for the API EC2 instance (stable across stop/start).
#
# Internet-facing Application Load Balancers do NOT use this resource. AWS creates
# separate "Elastic IPs" in the EC2 console for each ALB subnet/AZ (see ServiceManaged
# = "alb" in describe-addresses). Those are required for the ALB; you cannot attach
# one shared customer EIP to the ALB, and disassociate attempts in the console often fail
# with "permission" errors because ELB owns those ENIs.
#
# Expect at most 1 tagged customer EIP on EC2 (when local.create_ec2_elastic_ip). The ALB adds
# alb_availability_zone_count AWS-managed addresses (see ServiceManaged = "alb"). You cannot attach
# a customer EIP to an Application Load Balancer; use Global Accelerator if you need fixed Anycast IPs.
resource "aws_eip" "api" {
  count  = local.create_ec2_elastic_ip ? 1 : 0
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
  count         = local.create_ec2_elastic_ip ? 1 : 0
  instance_id   = aws_instance.api.id
  allocation_id = aws_eip.api[0].id
}

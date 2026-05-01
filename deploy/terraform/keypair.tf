# Fail at plan if the key pair name is wrong or missing in this region.
data "aws_key_pair" "ssh" {
  key_name = var.ec2_key_pair_name
}

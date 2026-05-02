terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# With `aws login` (short-lived sessions), run before apply:
#   eval "$(aws configure export-credentials --format env)"
# so Terraform uses the same credentials as the AWS CLI (otherwise the provider may try IMDS and fail).
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = merge(
      {
        Project     = var.project_name
        Environment = var.environment
        ManagedBy   = "terraform"
      },
      var.extra_tags,
    )
  }
}

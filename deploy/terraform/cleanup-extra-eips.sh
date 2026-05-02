#!/usr/bin/env bash
# Release Elastic IPs that are NOT associated with the given EC2 instance ID.
# Default is dry-run. Use --execute to disassociate (EC2 only) and release.
#
# Skips allocations associated with non-EC2 ENIs (e.g. NAT Gateway) to avoid accidents.
#
# Usage:
#   ./cleanup-extra-eips.sh i-0123456789abcdef0          # dry-run
#   ./cleanup-extra-eips.sh i-0123456789abcdef0 --execute
#
# Requires: AWS CLI, region from AWS_REGION or us-east-1.

set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
KEEP_INSTANCE_ID="${1:-}"
EXECUTE=false

if [[ -z "$KEEP_INSTANCE_ID" ]] || [[ "$KEEP_INSTANCE_ID" == "--execute" ]]; then
  echo "Usage: $0 <instance-id-to-keep> [--execute]" >&2
  exit 1
fi
if [[ "${2:-}" == "--execute" ]]; then
  EXECUTE=true
fi

echo "Region=$REGION keep_instance=$KEEP_INSTANCE_ID execute=$EXECUTE" >&2

# AllocationId AssociationId InstanceId PublicIp Name
while IFS=$'\t' read -r alloc assoc instance publicip name; do
  [[ -z "$alloc" ]] && continue

  if [[ "$instance" == "$KEEP_INSTANCE_ID" ]]; then
    echo "KEEP  $publicip  name=${name:-<none>}  alloc=$alloc  (matches instance)"
    continue
  fi

  if [[ -z "$instance" || "$instance" == "None" ]]; then
    if [[ -z "$assoc" || "$assoc" == "None" ]]; then
      echo "ORPHAN $publicip  name=${name:-<none>}  alloc=$alloc  (unassociated — idle EIP charges)"
      if [[ "$EXECUTE" == true ]]; then
        aws ec2 release-address --allocation-id "$alloc" --region "$REGION"
        echo "  released $alloc" >&2
      fi
    else
      echo "SKIP $publicip  alloc=$alloc  (associated but no InstanceId — likely NAT/LB/ENI; check console)"
    fi
    continue
  fi

  echo "OTHER_EC2 $publicip  name=${name:-<none>}  alloc=$alloc  instance=$instance"
  if [[ "$EXECUTE" == true ]]; then
    aws ec2 disassociate-address --association-id "$assoc" --region "$REGION"
    aws ec2 release-address --allocation-id "$alloc" --region "$REGION"
    echo "  disassociated and released $alloc" >&2
  fi
done < <(aws ec2 describe-addresses --region "$REGION" \
  --query 'Addresses[].[AllocationId,AssociationId,InstanceId,PublicIp,Tags[?Key==`Name`].Value|[0]]' \
  --output text)

if [[ "$EXECUTE" != true ]]; then
  echo "" >&2
  echo "Dry-run only. Re-run with --execute after verifying the list." >&2
fi

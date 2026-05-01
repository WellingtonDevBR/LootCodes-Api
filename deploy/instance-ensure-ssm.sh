#!/usr/bin/env bash
# Run on the EC2 host as root: fixes "SSM not registered" when the agent never reached AWS.
#   sudo bash deploy/instance-ensure-ssm.sh
# Requires outbound HTTPS (443) to regional SSM endpoints.

set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

dnf install -y amazon-ssm-agent curl ca-certificates

TOKEN=$(curl -fsS -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
REGION=$(curl -fsS -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/placement/region)
echo "Detected region: $REGION"

systemctl enable amazon-ssm-agent
systemctl restart amazon-ssm-agent
sleep 4

if systemctl is-active --quiet amazon-ssm-agent; then
  echo "amazon-ssm-agent is active"
else
  echo ":: amazon-ssm-agent not active; recent logs:" >&2
  journalctl -u amazon-ssm-agent -n 80 --no-pager >&2 || true
  exit 1
fi

echo "Last agent log lines (see also /var/log/amazon/ssm/amazon-ssm-agent.log):"
journalctl -u amazon-ssm-agent -n 25 --no-pager || true

echo ""
echo "In 1–2 minutes check AWS Console: Systems Manager → Fleet Manager → this instance should show Online."
echo "Then re-run GitHub Actions deploy."

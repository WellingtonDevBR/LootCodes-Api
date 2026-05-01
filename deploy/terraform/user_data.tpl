#!/bin/bash
set -euo pipefail
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

dnf install -y docker docker-compose-plugin awscli
systemctl enable --now docker

mkdir -p '${deploy_directory}'
chmod 700 '${deploy_directory}'

# ec2-user / ssm-user may run docker depending on AMI; add common users to docker group.
for u in ec2-user ssm-user; do
  if id "$u" &>/dev/null; then
    usermod -aG docker "$u" || true
  fi
done

echo "Bootstrap complete. Copy docker-compose.prod.yml and .env to ${deploy_directory} then deploy via GitHub Actions."

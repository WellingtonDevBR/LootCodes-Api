#!/bin/bash
set -euo pipefail
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

dnf install -y docker awscli
if ! dnf install -y docker-compose-plugin; then
  COMPOSE_VER="${DOCKER_COMPOSE_VERSION:-2.24.7}"
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64) CARCH=x86_64 ;;
    aarch64) CARCH=aarch64 ;;
    *) echo "Unsupported arch: $ARCH"; exit 1 ;;
  esac
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -fsSL "https://github.com/docker/compose/releases/download/v${COMPOSE_VER}/docker-compose-linux-${CARCH}" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi
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

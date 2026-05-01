#!/usr/bin/env bash
# One-time EC2 prep for lootcodes-api Docker deploy (Amazon Linux 2023 / Ubuntu-friendly).
# Run with sudo or as root. After this, copy docker-compose.prod.yml and a production .env into DEPLOY_DIR.

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/lootcodes-api}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root (sudo $0)" >&2
  exit 1
fi

install_al2023() {
  dnf install -y docker
  dnf install -y docker-compose-plugin || true
  systemctl enable --now docker
}

install_ubuntu() {
  apt-get update -y
  apt-get install -y ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  # shellcheck disable=SC1091
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin awscli
  systemctl enable --now docker
}

if grep -qi 'amazon linux' /etc/os-release 2>/dev/null; then
  install_al2023
elif grep -qi 'ubuntu' /etc/os-release 2>/dev/null; then
  install_ubuntu
else
  echo "Unsupported OS; install Docker Engine + Compose v2 manually." >&2
  exit 1
fi

mkdir -p "$DEPLOY_DIR"
chmod 700 "$DEPLOY_DIR"

if [[ -n "${SUDO_USER:-}" ]]; then
  usermod -aG docker "$SUDO_USER" || true
fi

echo "Docker is installed. Next:"
echo "  1. Attach IAM instance profile: SSM + ECR read (see deploy/ec2-instance-profile-policy.example.json)"
echo "  2. Place docker-compose.prod.yml and .env in $DEPLOY_DIR"
echo "  3. Ensure GitHub Actions OIDC role can ssm:SendCommand to this instance"

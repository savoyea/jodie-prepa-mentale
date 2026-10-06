#!/bin/bash
set -e

VPS_USER="ubuntu"
VPS_IP="51.68.120.195"
SSH_KEY="$HOME/.ssh/id_rsa"
REMOTE_DIR="/opt/jodie-site"

echo "==> Push GitHub..."
git push

echo "==> Deploy sur le VPS..."
sshpass -P "Enter passphrase" -p "louboutin" ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "${VPS_USER}@${VPS_IP}" "
  cd ${REMOTE_DIR}
  git pull
  npm ci --prefer-offline
  npm run build
  rsync -a --delete ${REMOTE_DIR}/dist/ /var/www/jodie-v2/
  echo '==> Done — https://jodie.arsava.fr'
"

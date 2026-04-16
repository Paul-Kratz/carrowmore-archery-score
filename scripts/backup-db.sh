#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v mongodump >/dev/null 2>&1; then
  echo "mongodump is not installed. Install MongoDB Database Tools first." >&2
  exit 1
fi

if [[ -f ".env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source ".env.local"
  set +a
fi

if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

if [[ -z "${MONGODB_URI:-}" ]]; then
  echo "MONGODB_URI is not set. Add it to .env.local or .env before running backups." >&2
  exit 1
fi

mkdir -p backups

timestamp="$(date +%Y%m%d-%H%M%S)"
output_path="backups/archery-backup-${timestamp}.archive"

mongodump --uri "$MONGODB_URI" --archive="$output_path" --gzip

echo "Backup written to $output_path"

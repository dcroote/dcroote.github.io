#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CONFIG="subscribe-worker/wrangler.toml"
DEPLOY_LOG="$(mktemp)"
trap 'rm -f "$DEPLOY_LOG"' EXIT

echo "Before continuing, create:"
echo "  1. A Cloudflare Turnstile widget for www.derekcroote.com"
echo "  2. A Buttondown API key"
echo
read -r -p "Turnstile site key (public): " TURNSTILE_SITE_KEY

if [[ -z "$TURNSTILE_SITE_KEY" ]]; then
  echo "A Turnstile site key is required." >&2
  exit 1
fi

pnpm install

# wrangler whoami exits 0 even when logged out, so inspect its output.
WHOAMI_OUTPUT="$(pnpm exec wrangler whoami 2>&1 || true)"
printf '%s\n' "$WHOAMI_OUTPUT"
if printf '%s\n' "$WHOAMI_OUTPUT" | grep -qi 'not authenticated'; then
  echo "Opening Cloudflare login..."
  pnpm exec wrangler login
fi

put_secrets() {
  local existing
  existing="$(pnpm exec wrangler secret list --config "$CONFIG" 2>/dev/null || true)"
  if printf '%s\n' "$existing" | grep -q 'TURNSTILE_SECRET' &&
    printf '%s\n' "$existing" | grep -q 'BUTTONDOWN_API_KEY'; then
    echo
    read -r -p "Worker secrets already exist. Update them now? [y/N] " UPDATE_SECRETS
    if [[ ! "${UPDATE_SECRETS}" =~ ^[Yy]$ ]]; then
      echo "Keeping existing Worker secrets."
      return
    fi
  fi

  echo
  echo "Next, Wrangler will prompt for each secret (input is hidden)."
  echo
  echo ">>> Enter the Turnstile SECRET key (not the site key)"
  pnpm exec wrangler secret put TURNSTILE_SECRET --config "$CONFIG"
  echo
  echo ">>> Enter the Buttondown API key"
  pnpm exec wrangler secret put BUTTONDOWN_API_KEY --config "$CONFIG"
}

worker_exists() {
  pnpm exec wrangler secret list --config "$CONFIG" >/dev/null 2>&1
}

deploy_worker() {
  local label=$1
  echo "$label"
  # Stream Wrangler output live. Capturing with $() hides progress and can
  # look hung if Wrangler prompts or takes a while.
  set +e
  pnpm worker:deploy 2>&1 | tee "$DEPLOY_LOG"
  local status=${PIPESTATUS[0]}
  set -e
  if [[ "$status" -ne 0 ]]; then
    echo "Worker deploy failed (exit $status). See output above." >&2
    exit "$status"
  fi
}

# Prefer binding secrets before publishing a new version when the Worker
# already exists, so the updated code never serves without credentials.
if worker_exists; then
  put_secrets
  deploy_worker "Deploying the subscription Worker..."
else
  deploy_worker "Deploying the subscription Worker for the first time..."
  put_secrets
fi

WORKER_URL="$(
  awk 'match($0, /https:\/\/[^[:space:]]+\.workers\.dev/) {
    print substr($0, RSTART, RLENGTH)
    exit
  }' "$DEPLOY_LOG"
)"

if [[ -z "$WORKER_URL" ]]; then
  read -r -p "Paste the workers.dev URL from the deployment output: " WORKER_URL
fi

SECRET_LIST="$(pnpm exec wrangler secret list --config "$CONFIG")"
printf '%s\n' "$SECRET_LIST" | grep -q 'TURNSTILE_SECRET'
printf '%s\n' "$SECRET_LIST" | grep -q 'BUTTONDOWN_API_KEY'

# Point the site at the Worker only after secrets are confirmed present.
WORKER_URL="$WORKER_URL" TURNSTILE_SITE_KEY="$TURNSTILE_SITE_KEY" node <<'NODE'
const fs = require("node:fs");

const path = "_config.yml";
const workerUrl = process.env.WORKER_URL;
const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY;
if (!workerUrl || !turnstileSiteKey) {
  throw new Error("WORKER_URL and TURNSTILE_SITE_KEY are required");
}

let config = fs.readFileSync(path, "utf8");
const replacements = [
  [/^subscribe_worker_url:.*$/m, `subscribe_worker_url: ${JSON.stringify(workerUrl)}`],
  [/^turnstile_site_key:.*$/m, `turnstile_site_key: ${JSON.stringify(turnstileSiteKey)}`],
];

for (const [pattern, value] of replacements) {
  if (!config.match(pattern)) {
    throw new Error(`Could not find ${pattern} in ${path}`);
  }
  config = config.replace(pattern, value);
}

fs.writeFileSync(path, config);
NODE

echo
echo "Configured _config.yml with:"
echo "  Worker: $WORKER_URL"
echo "  Turnstile site key: $TURNSTILE_SITE_KEY"
echo
echo "Secrets are stored on the Worker. Keep Buttondown Public subscriptions"
echo "disabled, then publish _config.yml."

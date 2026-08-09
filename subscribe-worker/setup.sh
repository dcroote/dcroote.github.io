#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Before continuing, create:"
echo "  1. A Cloudflare Turnstile widget for www.derekcroote.com"
echo "  2. A Buttondown API key"
echo
read -r -p "Turnstile site key (public): " TURNSTILE_SITE_KEY

if [[ -z "$TURNSTILE_SITE_KEY" ]]; then
  echo "A Turnstile site key is required." >&2
  exit 1
fi

npm install

if ! npx wrangler whoami >/dev/null 2>&1; then
  echo "Opening Cloudflare login..."
  npx wrangler login
fi

echo "Deploying the subscription Worker..."
DEPLOY_OUTPUT="$(npm run worker:deploy 2>&1)"
printf '%s\n' "$DEPLOY_OUTPUT"

WORKER_URL="$(
  printf '%s\n' "$DEPLOY_OUTPUT" |
    awk 'match($0, /https:\/\/[^[:space:]]+\.workers\.dev/) { print substr($0, RSTART, RLENGTH); exit }'
)"

if [[ -z "$WORKER_URL" ]]; then
  read -r -p "Paste the workers.dev URL from the deployment output: " WORKER_URL
fi

echo
echo "Paste each secret when Wrangler prompts. Input is hidden."
npx wrangler secret put TURNSTILE_SECRET --config subscribe-worker/wrangler.toml
npx wrangler secret put BUTTONDOWN_API_KEY --config subscribe-worker/wrangler.toml

WORKER_URL="$WORKER_URL" TURNSTILE_SITE_KEY="$TURNSTILE_SITE_KEY" ruby <<'RUBY'
path = "_config.yml"
config = File.read(path)
config.sub!(
  /^subscribe_worker_url:.*$/,
  "subscribe_worker_url: #{ENV.fetch("WORKER_URL").inspect}",
)
config.sub!(
  /^turnstile_site_key:.*$/,
  "turnstile_site_key: #{ENV.fetch("TURNSTILE_SITE_KEY").inspect}",
)
File.write(path, config)
RUBY

echo
echo "Configured _config.yml with:"
echo "  Worker: $WORKER_URL"
echo "  Turnstile site key: $TURNSTILE_SITE_KEY"
echo
echo "Keep Buttondown Public subscriptions disabled, then publish _config.yml."

# Secure newsletter subscriptions

The site submits newsletter signups to a Cloudflare Worker instead of exposing
Buttondown's public form endpoint. The Worker verifies Cloudflare Turnstile,
checks the honeypot, rate-limits each IP address, and then calls Buttondown with
an API key stored by Cloudflare.

Buttondown should remain in Private mode. API-created subscribers still receive
Buttondown's normal double-opt-in confirmation email.

## One-time setup

1. In [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile),
   add a **Managed** widget:
   - Name: `derekcroote.com newsletter`
   - Hostname: `www.derekcroote.com`
   - Pre-clearance: off
2. Copy its site key and secret key.
3. Create a Buttondown API key in
   [Buttondown API settings](https://buttondown.com/settings/api).
4. From the repository root, run:

   ```sh
   ./subscribe-worker/setup.sh
   ```

   The script logs in to Cloudflare, deploys the Worker, prompts securely for
   both secret keys, and writes the public Worker URL and Turnstile site key to
   `_config.yml`.
5. Commit and publish the `_config.yml` update.

Never add `TURNSTILE_SECRET` or `BUTTONDOWN_API_KEY` to `_config.yml`, GitHub, or
browser JavaScript. They are stored only as encrypted Worker secrets.

## Commands

Run the Worker tests:

```sh
npm test
```

Deploy code updates after the one-time setup:

```sh
npm run worker:deploy
```

Develop locally:

```sh
npm run worker:dev
```

When using Cloudflare's always-pass test keys for a local end-to-end test, add
`--var TURNSTILE_TEST_MODE:true` to the Wrangler command. This mode accepts only
the test response's `example.com` hostname and omitted action. It is
intentionally absent from `wrangler.toml`.

Cloudflare's production settings live in `wrangler.toml`. The rate limiter
allows five attempts per IP per minute. Turnstile tokens must be issued for
`www.derekcroote.com` with the `newsletter_subscribe` action.

## Production checks

After publishing:

1. Submit a new address at `https://www.derekcroote.com`.
2. Confirm that `/subscribed/` appears without a Buttondown page in between.
3. Confirm the address remains unactivated until its confirmation link is used.
4. Confirm that Buttondown's public page and legacy embed endpoint reject new
   subscriptions while Private mode is enabled.

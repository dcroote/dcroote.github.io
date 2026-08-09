const BUTTONDOWN_DEFAULT_URL = "https://api.buttondown.com/v1/subscribers";
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_TEST_HOSTNAME = "example.com";
const MAX_REQUEST_BYTES = 8_192;
const MAX_TURNSTILE_TOKEN_LENGTH = 2_048;

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  ALLOWED_ORIGIN: string;
  BUTTONDOWN_API_KEY: string;
  BUTTONDOWN_API_URL?: string;
  SUBSCRIBE_RATE_LIMITER: RateLimiter;
  TURNSTILE_ACTION: string;
  TURNSTILE_HOSTNAME: string;
  TURNSTILE_SECRET: string;
  TURNSTILE_TEST_MODE?: string;
}

interface TurnstileResult {
  success?: boolean;
  hostname?: string;
  action?: string;
}

interface SubscriptionRequest {
  email: string;
  company: string;
  turnstileToken: string;
}

interface ButtondownPayload {
  email_address: string;
  ip_address?: string;
}

export type FetchImpl = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

function jsonResponse(
  origin: string,
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function htmlJsRequiredResponse(allowedOrigin: string): Response {
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>JavaScript required</title>
</head>
<body>
  <p>JavaScript is required to subscribe. Please enable it and try again from <a href="${allowedOrigin}/">the site</a>.</p>
</body>
</html>`;

  return new Response(body, {
    status: 400,
    headers: {
      ...corsHeaders(allowedOrigin),
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function isJsonContentType(contentType: string): boolean {
  return contentType.toLowerCase().startsWith("application/json");
}

function isFormContentType(contentType: string): boolean {
  const normalized = contentType.toLowerCase();
  return (
    normalized.startsWith("application/x-www-form-urlencoded") ||
    normalized.startsWith("multipart/form-data")
  );
}

function isValidEmail(email: string): boolean {
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function parseSubscriptionRequest(body: unknown): SubscriptionRequest | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;

  const record = body as Record<string, unknown>;
  return {
    email:
      typeof record.email === "string"
        ? record.email.trim().toLowerCase()
        : "",
    company:
      typeof record.company === "string" ? record.company.trim() : "",
    turnstileToken:
      typeof record.turnstileToken === "string"
        ? record.turnstileToken.trim()
        : "",
  };
}

async function readTextWithLimit(
  request: Request,
  maxBytes: number,
): Promise<string | null> {
  const contentLengthHeader = request.headers.get("Content-Length");
  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);
    if (
      !Number.isFinite(contentLength) ||
      contentLength < 0 ||
      contentLength > maxBytes
    ) {
      return null;
    }
  }

  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(merged);
}

async function verifyTurnstile(
  token: string,
  ipAddress: string,
  env: Env,
  fetchImpl: FetchImpl,
): Promise<boolean> {
  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET);
  body.append("response", token);
  body.append("idempotency_key", crypto.randomUUID());
  if (ipAddress) body.append("remoteip", ipAddress);

  const response = await fetchImpl(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body,
  });
  if (!response.ok) return false;

  const result = (await response.json()) as TurnstileResult;
  const isTestMode = env.TURNSTILE_TEST_MODE === "true";
  const hostnameMatches = isTestMode
    ? result.hostname === TURNSTILE_TEST_HOSTNAME
    : result.hostname === env.TURNSTILE_HOSTNAME;
  const actionMatches = isTestMode
    ? result.action === undefined
    : result.action === env.TURNSTILE_ACTION;

  return result.success === true && hostnameMatches && actionMatches;
}

function createButtondownSubscriber(
  email: string,
  ipAddress: string,
  env: Env,
  fetchImpl: FetchImpl,
): Promise<Response> {
  const payload: ButtondownPayload = { email_address: email };
  if (ipAddress) payload.ip_address = ipAddress;

  return fetchImpl(env.BUTTONDOWN_API_URL || BUTTONDOWN_DEFAULT_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function handleRequest(
  request: Request,
  env: Env,
  fetchImpl: FetchImpl = fetch,
): Promise<Response> {
  const origin = request.headers.get("Origin") || "";
  if (origin !== env.ALLOWED_ORIGIN) {
    return new Response("Forbidden", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(origin, 405, { ok: false, error: "method" });
  }

  if (!env.BUTTONDOWN_API_KEY || !env.TURNSTILE_SECRET) {
    return jsonResponse(origin, 500, {
      ok: false,
      error: "configuration",
    });
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (isFormContentType(contentType)) {
    // Native <form> posts cannot complete Turnstile; tell users JS is required.
    return htmlJsRequiredResponse(env.ALLOWED_ORIGIN);
  }

  if (!isJsonContentType(contentType)) {
    return jsonResponse(origin, 400, { ok: false, error: "request" });
  }

  const rawBody = await readTextWithLimit(request, MAX_REQUEST_BYTES);
  if (rawBody === null) {
    return jsonResponse(origin, 400, { ok: false, error: "request" });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse(origin, 400, { ok: false, error: "request" });
  }

  const subscription = parseSubscriptionRequest(body);
  if (!subscription) {
    return jsonResponse(origin, 400, { ok: false, error: "request" });
  }

  const { company, email, turnstileToken } = subscription;

  // Silently accept honeypot submissions so simple bots do not adapt.
  if (company) {
    return jsonResponse(origin, 200, { ok: true });
  }

  if (
    !isValidEmail(email) ||
    !turnstileToken ||
    turnstileToken.length > MAX_TURNSTILE_TOKEN_LENGTH
  ) {
    return jsonResponse(origin, 400, { ok: false, error: "request" });
  }

  const ipAddress = request.headers.get("CF-Connecting-IP") || "";

  let turnstileIsValid: boolean;
  try {
    turnstileIsValid = await verifyTurnstile(
      turnstileToken,
      ipAddress,
      env,
      fetchImpl,
    );
  } catch {
    return jsonResponse(origin, 503, {
      ok: false,
      error: "verification",
    });
  }

  if (!turnstileIsValid) {
    return jsonResponse(origin, 400, {
      ok: false,
      error: "verification",
    });
  }

  // Rate-limit only after Turnstile passes so junk tokens cannot burn the
  // per-IP Buttondown quota.
  const rateLimit = await env.SUBSCRIBE_RATE_LIMITER.limit({
    key: ipAddress || "unknown",
  });
  if (!rateLimit.success) {
    return jsonResponse(origin, 429, { ok: false, error: "rate_limit" });
  }

  let buttondownResponse: Response;
  try {
    buttondownResponse = await createButtondownSubscriber(
      email,
      ipAddress,
      env,
      fetchImpl,
    );
  } catch {
    return jsonResponse(origin, 503, { ok: false, error: "service" });
  }

  // Buttondown uses 400 for duplicate and suppressed addresses. Keep the
  // browser response generic so this endpoint cannot enumerate subscribers.
  if (buttondownResponse.ok || buttondownResponse.status === 400) {
    return jsonResponse(origin, 200, { ok: true });
  }

  return jsonResponse(origin, 503, { ok: false, error: "service" });
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};

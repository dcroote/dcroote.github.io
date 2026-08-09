const BUTTONDOWN_DEFAULT_URL = "https://api.buttondown.com/v1/subscribers";
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_TEST_HOSTNAME = "example.com";
const MAX_REQUEST_BYTES = 8_192;
const MAX_TURNSTILE_TOKEN_LENGTH = 2_048;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

function jsonResponse(origin, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function isValidEmail(email) {
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

async function verifyTurnstile(token, ipAddress, env, fetchImpl) {
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

  const result = await response.json();
  const isTestMode = env.TURNSTILE_TEST_MODE === "true";
  const hostnameMatches = isTestMode
    ? result.hostname === TURNSTILE_TEST_HOSTNAME
    : result.hostname === env.TURNSTILE_HOSTNAME;
  const actionMatches = isTestMode
    ? result.action === undefined
    : result.action === env.TURNSTILE_ACTION;
  const isValid =
    result.success === true &&
    hostnameMatches &&
    actionMatches;
  return isValid;
}

async function createButtondownSubscriber(email, ipAddress, env, fetchImpl) {
  const payload = { email_address: email };
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

export async function handleRequest(request, env, fetchImpl = fetch) {
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
    return jsonResponse(origin, 500, { ok: false, error: "configuration" });
  }

  const contentType = request.headers.get("Content-Type") || "";
  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (
    !contentType.startsWith("application/json") ||
    contentLength > MAX_REQUEST_BYTES
  ) {
    return jsonResponse(origin, 400, { ok: false, error: "request" });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(origin, 400, { ok: false, error: "request" });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const token =
    typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";

  // Silently accept honeypot submissions so simple bots do not adapt.
  if (company) {
    return jsonResponse(origin, 200, { ok: true });
  }

  if (!isValidEmail(email) || !token || token.length > MAX_TURNSTILE_TOKEN_LENGTH) {
    return jsonResponse(origin, 400, { ok: false, error: "request" });
  }

  const ipAddress = request.headers.get("CF-Connecting-IP") || "";
  const rateLimit = await env.SUBSCRIBE_RATE_LIMITER.limit({
    key: ipAddress || "unknown",
  });
  if (!rateLimit.success) {
    return jsonResponse(origin, 429, { ok: false, error: "rate_limit" });
  }

  let turnstileIsValid;
  try {
    turnstileIsValid = await verifyTurnstile(token, ipAddress, env, fetchImpl);
  } catch {
    return jsonResponse(origin, 503, { ok: false, error: "verification" });
  }

  if (!turnstileIsValid) {
    return jsonResponse(origin, 400, { ok: false, error: "verification" });
  }

  let buttondownResponse;
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
  fetch(request, env) {
    return handleRequest(request, env);
  },
};

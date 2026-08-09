import assert from "node:assert/strict";
import test from "node:test";

import { handleRequest } from "../src/worker.js";

const ORIGIN = "https://www.derekcroote.com";
const TURNSTILE_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const BUTTONDOWN_URL = "https://api.buttondown.test/v1/subscribers";

function createEnv(rateLimitSuccess = true) {
  return {
    ALLOWED_ORIGIN: ORIGIN,
    BUTTONDOWN_API_KEY: "buttondown-secret",
    BUTTONDOWN_API_URL: BUTTONDOWN_URL,
    SUBSCRIBE_RATE_LIMITER: {
      async limit() {
        return { success: rateLimitSuccess };
      },
    },
    TURNSTILE_ACTION: "newsletter_subscribe",
    TURNSTILE_HOSTNAME: "www.derekcroote.com",
    TURNSTILE_SECRET: "turnstile-secret",
  };
}

function createRequest(body, origin = ORIGIN) {
  return new Request("https://subscribe.example.workers.dev", {
    method: "POST",
    headers: {
      "CF-Connecting-IP": "203.0.113.10",
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify(body),
  });
}

function createFetchMock(options = {}) {
  const calls = [];
  const fetchMock = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url) === TURNSTILE_URL) {
      const result = {
        success: options.turnstileSuccess !== false,
        hostname: options.hostname || "www.derekcroote.com",
      };
      if (!options.omitAction) result.action = "newsletter_subscribe";
      return Response.json(result);
    }

    assert.equal(String(url), BUTTONDOWN_URL);
    return new Response(null, { status: options.buttondownStatus || 201 });
  };

  return { calls, fetchMock };
}

test("creates an unactivated Buttondown subscriber after verification", async () => {
  const { calls, fetchMock } = createFetchMock();
  const response = await handleRequest(
    createRequest({
      email: "  Reader@Example.com ",
      company: "",
      turnstileToken: "valid-token",
    }),
    createEnv(),
    fetchMock,
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(calls.length, 2);

  const buttondownCall = calls[1];
  assert.equal(buttondownCall.init.headers.Authorization, "Token buttondown-secret");
  assert.deepEqual(JSON.parse(buttondownCall.init.body), {
    email_address: "reader@example.com",
    ip_address: "203.0.113.10",
  });
  assert.equal("type" in JSON.parse(buttondownCall.init.body), false);
});

test("silently discards honeypot submissions", async () => {
  let externalCalls = 0;
  const response = await handleRequest(
    createRequest({
      email: "bot@example.com",
      company: "Spam Incorporated",
      turnstileToken: "",
    }),
    createEnv(),
    async () => {
      externalCalls += 1;
      throw new Error("Unexpected external request");
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(externalCalls, 0);
});

test("rejects failed Turnstile verification before calling Buttondown", async () => {
  const { calls, fetchMock } = createFetchMock({ turnstileSuccess: false });
  const response = await handleRequest(
    createRequest({
      email: "reader@example.com",
      company: "",
      turnstileToken: "invalid-token",
    }),
    createEnv(),
    fetchMock,
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "verification",
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, TURNSTILE_URL);
});

test("accepts Cloudflare's always-pass response only in explicit test mode", async () => {
  const env = createEnv();
  env.TURNSTILE_TEST_MODE = "true";
  const { calls, fetchMock } = createFetchMock({
    hostname: "example.com",
    omitAction: true,
  });
  const response = await handleRequest(
    createRequest({
      email: "reader@example.com",
      company: "",
      turnstileToken: "always-pass-test-token",
    }),
    env,
    fetchMock,
  );

  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
});

test("rejects Cloudflare's always-pass response in production mode", async () => {
  const { calls, fetchMock } = createFetchMock({
    hostname: "example.com",
    omitAction: true,
  });
  const response = await handleRequest(
    createRequest({
      email: "reader@example.com",
      company: "",
      turnstileToken: "always-pass-test-token",
    }),
    createEnv(),
    fetchMock,
  );

  assert.equal(response.status, 400);
  assert.equal(calls.length, 1);
});

test("test mode rejects responses that do not match the test response shape", async () => {
  const env = createEnv();
  env.TURNSTILE_TEST_MODE = "true";
  const { calls, fetchMock } = createFetchMock({ hostname: "example.com" });
  const response = await handleRequest(
    createRequest({
      email: "reader@example.com",
      company: "",
      turnstileToken: "unexpected-test-token",
    }),
    env,
    fetchMock,
  );

  assert.equal(response.status, 400);
  assert.equal(calls.length, 1);
});

test("rejects requests from other browser origins", async () => {
  const response = await handleRequest(
    createRequest(
      {
        email: "reader@example.com",
        company: "",
        turnstileToken: "valid-token",
      },
      "https://derekcroote.com",
    ),
    createEnv(),
  );

  assert.equal(response.status, 403);
  assert.equal(response.headers.has("Access-Control-Allow-Origin"), false);
});

test("rate limits before spending a Turnstile token", async () => {
  let externalCalls = 0;
  const response = await handleRequest(
    createRequest({
      email: "reader@example.com",
      company: "",
      turnstileToken: "valid-token",
    }),
    createEnv(false),
    async () => {
      externalCalls += 1;
      throw new Error("Unexpected external request");
    },
  );

  assert.equal(response.status, 429);
  assert.equal(externalCalls, 0);
});

test("does not reveal existing or suppressed subscribers", async () => {
  const { fetchMock } = createFetchMock({ buttondownStatus: 400 });
  const response = await handleRequest(
    createRequest({
      email: "existing@example.com",
      company: "",
      turnstileToken: "valid-token",
    }),
    createEnv(),
    fetchMock,
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

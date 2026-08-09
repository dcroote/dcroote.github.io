import assert from "node:assert/strict";
import test from "node:test";

import {
  handleRequest,
  type Env,
  type FetchImpl,
} from "../src/worker.ts";

const ORIGIN = "https://www.derekcroote.com";
const TURNSTILE_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const BUTTONDOWN_URL = "https://api.buttondown.test/v1/subscribers";

interface FetchMockOptions {
  buttondownStatus?: number;
  hostname?: string;
  omitAction?: boolean;
  turnstileSuccess?: boolean;
}

interface FetchCall {
  url: string;
  init: RequestInit;
}

function createEnv(rateLimitSuccess = true): Env {
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

function createRequest(
  body: Record<string, string>,
  origin = ORIGIN,
  init: RequestInit = {},
): Request {
  const headers = new Headers({
    "CF-Connecting-IP": "203.0.113.10",
    "Content-Type": "application/json",
    Origin: origin,
  });
  const initHeaders = new Headers(init.headers);
  initHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  return new Request("https://subscribe.example.workers.dev", {
    method: "POST",
    ...init,
    headers,
    body: init.body ?? JSON.stringify(body),
  });
}

function createFetchMock(options: FetchMockOptions = {}): {
  calls: FetchCall[];
  fetchMock: FetchImpl;
} {
  const calls: FetchCall[] = [];
  const fetchMock: FetchImpl = async (url, init = {}) => {
    calls.push({ url, init });
    if (url === TURNSTILE_URL) {
      const result: {
        success: boolean;
        hostname: string;
        action?: string;
      } = {
        success: options.turnstileSuccess !== false,
        hostname: options.hostname || "www.derekcroote.com",
      };
      if (!options.omitAction) result.action = "newsletter_subscribe";
      return Response.json(result);
    }

    assert.equal(url, BUTTONDOWN_URL);
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
  const headers = new Headers(buttondownCall.init.headers);
  const payload = JSON.parse(String(buttondownCall.init.body)) as Record<
    string,
    unknown
  >;
  assert.equal(headers.get("Authorization"), "Token buttondown-secret");
  assert.deepEqual(payload, {
    email_address: "reader@example.com",
    ip_address: "203.0.113.10",
  });
  assert.equal("type" in payload, false);
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

test("rate limits after Turnstile and before calling Buttondown", async () => {
  const { calls, fetchMock } = createFetchMock();
  const response = await handleRequest(
    createRequest({
      email: "reader@example.com",
      company: "",
      turnstileToken: "valid-token",
    }),
    createEnv(false),
    fetchMock,
  );

  assert.equal(response.status, 429);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, TURNSTILE_URL);
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

test("rejects oversized bodies even when Content-Length is missing", async () => {
  let externalCalls = 0;
  const oversized = JSON.stringify({
    email: "reader@example.com",
    company: "",
    turnstileToken: "x".repeat(9_000),
  });
  const response = await handleRequest(
    createRequest(
      {
        email: "reader@example.com",
        company: "",
        turnstileToken: "token",
      },
      ORIGIN,
      {
        body: oversized,
        headers: {
          "Content-Type": "application/json",
        },
      },
    ),
    createEnv(),
    async () => {
      externalCalls += 1;
      throw new Error("Unexpected external request");
    },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, error: "request" });
  assert.equal(externalCalls, 0);
});

test("rejects bodies when Content-Length is non-numeric", async () => {
  let externalCalls = 0;
  const response = await handleRequest(
    createRequest(
      {
        email: "reader@example.com",
        company: "",
        turnstileToken: "token",
      },
      ORIGIN,
      {
        headers: {
          "Content-Length": "not-a-number",
          "Content-Type": "application/json",
        },
      },
    ),
    createEnv(),
    async () => {
      externalCalls += 1;
      throw new Error("Unexpected external request");
    },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, error: "request" });
  assert.equal(externalCalls, 0);
});

test("rejects non-JSON content types", async () => {
  const response = await handleRequest(
    createRequest(
      {
        email: "reader@example.com",
        company: "",
        turnstileToken: "token",
      },
      ORIGIN,
      {
        body: "email=reader@example.com",
        headers: {
          "Content-Type": "text/plain",
        },
      },
    ),
    createEnv(),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, error: "request" });
});

test("returns an HTML hint for native form posts", async () => {
  const response = await handleRequest(
    createRequest(
      {
        email: "reader@example.com",
        company: "",
        turnstileToken: "",
      },
      ORIGIN,
      {
        body: "email=reader%40example.com&company=",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    ),
    createEnv(),
  );

  assert.equal(response.status, 400);
  assert.match(
    response.headers.get("Content-Type") || "",
    /text\/html/,
  );
  assert.match(await response.text(), /JavaScript is required/);
});

test("rejects invalid email addresses", async () => {
  let externalCalls = 0;
  const response = await handleRequest(
    createRequest({
      email: "not-an-email",
      company: "",
      turnstileToken: "valid-token",
    }),
    createEnv(),
    async () => {
      externalCalls += 1;
      throw new Error("Unexpected external request");
    },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, error: "request" });
  assert.equal(externalCalls, 0);
});

test("rejects missing Turnstile tokens", async () => {
  let externalCalls = 0;
  const response = await handleRequest(
    createRequest({
      email: "reader@example.com",
      company: "",
      turnstileToken: "",
    }),
    createEnv(),
    async () => {
      externalCalls += 1;
      throw new Error("Unexpected external request");
    },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, error: "request" });
  assert.equal(externalCalls, 0);
});

test("rejects unsupported methods", async () => {
  const response = await handleRequest(
    new Request("https://subscribe.example.workers.dev", {
      method: "GET",
      headers: { Origin: ORIGIN },
    }),
    createEnv(),
  );

  assert.equal(response.status, 405);
  assert.deepEqual(await response.json(), { ok: false, error: "method" });
});

test("returns configuration errors when secrets are missing", async () => {
  const env = createEnv();
  env.BUTTONDOWN_API_KEY = "";
  const response = await handleRequest(
    createRequest({
      email: "reader@example.com",
      company: "",
      turnstileToken: "valid-token",
    }),
    env,
  );

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "configuration",
  });
});

test("returns a service error for unexpected Buttondown failures", async () => {
  const { fetchMock } = createFetchMock({ buttondownStatus: 500 });
  const response = await handleRequest(
    createRequest({
      email: "reader@example.com",
      company: "",
      turnstileToken: "valid-token",
    }),
    createEnv(),
    fetchMock,
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, error: "service" });
});

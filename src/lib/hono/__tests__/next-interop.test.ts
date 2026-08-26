import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { NextRequest } from "next/server";
import { toNextRequest, toNextResponse } from "../next-interop";

describe("toNextRequest", () => {
  it("does not consume the body when wrapping a plain Request (the /api/send production regression)", async () => {
    // Mirrors every guarded body-reading route: the guard adapter converts
    // c.req.raw to a NextRequest first, and the handler reads the JSON body
    // afterwards through c.req. Wrapping via `new NextRequest(raw)` proxies
    // the raw body stream and made that second read throw in production
    // ("Body is unusable" / "Cannot read private member #state").
    const app = new Hono();
    app.post("/send", async (c) => {
      const nextReq = toNextRequest(c);
      const auth = nextReq.headers.get("authorization");
      // The wrapper must be BODYLESS: bun's fetch primitives tolerate
      // request-from-request wrapping, but node's undici proxies the input
      // stream, so a wrapper carrying a body means production breakage even
      // when this test would otherwise pass under bun.
      const wrapperHasBody = nextReq.body !== null;
      const rawDisturbed = c.req.raw.bodyUsed;
      const body = await c.req.json();
      return c.json({ auth, body, wrapperHasBody, rawDisturbed });
    });

    const res = await app.request("http://localhost/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer svlts_mail_pk_test",
      },
      body: JSON.stringify({ subject: "hi" }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      auth: "Bearer svlts_mail_pk_test",
      body: { subject: "hi" },
      wrapperHasBody: false,
      rawDisturbed: false,
    });
  });

  it("exposes method, URL, and headers on the bodyless wrapper", async () => {
    const app = new Hono();
    app.post("/x", (c) => {
      const nextReq = toNextRequest(c);
      return c.json({
        method: nextReq.method,
        url: nextReq.url,
        header: nextReq.headers.get("x-test"),
        pathname: nextReq.nextUrl.pathname,
      });
    });

    const res = await app.request("http://localhost/x", {
      method: "POST",
      headers: { "x-test": "abc" },
      body: "ignored",
    });
    expect(await res.json()).toEqual({
      method: "POST",
      url: "http://localhost/x",
      header: "abc",
      pathname: "/x",
    });
  });

  it("passes a real NextRequest through untouched, body intact", async () => {
    const app = new Hono();
    app.post("/y", async (c) => {
      const nextReq = toNextRequest(c);
      return c.json({
        same: nextReq === c.req.raw,
        body: await c.req.json(),
      });
    });

    const nextReq = new NextRequest("http://localhost/y", {
      method: "POST",
      body: JSON.stringify({ a: 1 }),
    });
    const res = await app.request(nextReq);
    expect(await res.json()).toEqual({ same: true, body: { a: 1 } });
  });

  it("passes a structural NextRequest through when instanceof misses (duplicated class copies)", async () => {
    // Simulates a production bundle where the NextRequest class exists twice:
    // the object walks and quacks like a NextRequest but fails instanceof.
    const app = new Hono();
    app.post("/z", async (c) => {
      const nextReq = toNextRequest(c);
      return c.json({
        same: nextReq === c.req.raw,
        body: await c.req.json(),
      });
    });

    const foreign = new Request("http://localhost/z", {
      method: "POST",
      body: JSON.stringify({ b: 2 }),
    });
    Object.defineProperties(foreign, {
      nextUrl: { value: new URL("http://localhost/z") },
      cookies: { value: {} },
    });
    expect(foreign instanceof NextRequest).toBe(false);
    const res = await app.request(foreign);
    expect(await res.json()).toEqual({ same: true, body: { b: 2 } });
  });
});

describe("toNextResponse", () => {
  it("preserves status, headers, and body", async () => {
    const res = toNextResponse(
      new Response(JSON.stringify({ ok: true }), {
        status: 418,
        headers: { "Content-Type": "application/json", "X-Extra": "1" },
      }),
    );
    expect(res.status).toBe(418);
    expect(res.headers.get("x-extra")).toBe("1");
    expect(await res.json()).toEqual({ ok: true });
  });
});

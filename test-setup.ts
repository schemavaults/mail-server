import { mock } from "bun:test";

// `server-only` actively throws on import to prevent client bundles from
// pulling in server-side code. In a unit-test environment we don't have
// the Next.js boundary that makes this distinction meaningful, so neutralize
// it for all tests via a preload.
mock.module("server-only", () => ({}));

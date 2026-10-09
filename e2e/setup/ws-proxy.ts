// Minimal WebSocket → TCP proxy standing in for Neon's wsproxy during E2E
// runs (and local development against a plain Postgres).
//
// In non-production environments the app's database adapter
// (@schemavaults/dbh SchemaVaultsPostgresNeonProxyAdapter) connects to
// Postgres through the Neon serverless driver, which tunnels the raw
// Postgres wire protocol through a WebSocket at <ws-host>:5433/v1. The
// adapter's wsProxy callback returns that URL with no `?address=` query, so
// the proxy behind it must dial ONE fixed upstream — which is exactly what
// this script does: every WebSocket connection is piped byte-for-byte to
// the Postgres server named by E2E_PG_TCP_HOST / E2E_PG_TCP_PORT.
//
// NOTE: the driver's default `pipelineConnect: "password"` sends the
// cleartext PasswordMessage optimistically, so the upstream Postgres must
// accept `password` (cleartext) host auth — see the CI workflow's
// POSTGRES_HOST_AUTH_METHOD=password.
//
// Usage: bun e2e/setup/ws-proxy.ts
//   E2E_WS_PROXY_PORT  — port to listen on (default 5433)
//   E2E_PG_TCP_HOST    — upstream Postgres host (default 127.0.0.1)
//   E2E_PG_TCP_PORT    — upstream Postgres port (default 5432)

import type { Socket } from "bun";

const LISTEN_PORT = Number(process.env.E2E_WS_PROXY_PORT ?? "5433");
const TARGET_HOST = process.env.E2E_PG_TCP_HOST ?? "127.0.0.1";
const TARGET_PORT = Number(process.env.E2E_PG_TCP_PORT ?? "5432");

interface TunnelState {
  socket: Socket | null;
  /**
   * Client bytes the upstream TCP socket has not accepted yet: everything
   * received before it connects, plus whatever a write could not take
   * because the socket's send buffer was full.
   */
  pending: Uint8Array[];
  closed: boolean;
}

/**
 * Writes queued client bytes upstream until the socket stops accepting
 * them. Bun's TCP `write()` returns how many bytes it accepted and drops
 * the rest rather than buffering it, so unaccepted bytes stay queued until
 * the socket's `drain` event; ignoring a short write would silently cut a
 * large Postgres message (e.g. a multi-megabyte INSERT) short and leave
 * Postgres waiting forever for the rest.
 */
function flushPending(state: TunnelState): void {
  const socket = state.socket;
  if (socket === null) return;
  while (state.pending.length > 0) {
    const chunk = state.pending[0]!;
    const written = Math.max(socket.write(chunk), 0);
    if (written < chunk.byteLength) {
      state.pending[0] = chunk.subarray(written);
      return;
    }
    state.pending.shift();
  }
}

const server = Bun.serve<TunnelState>({
  port: LISTEN_PORT,
  fetch(req, srv) {
    // The Neon driver connects to a path like /v1; any path is accepted.
    const upgraded = srv.upgrade(req, {
      data: { socket: null, pending: [], closed: false } satisfies TunnelState,
    });
    if (upgraded) return undefined;
    return new Response("Expected a WebSocket upgrade.", { status: 400 });
  },
  websocket: {
    open(ws) {
      Bun.connect({
        hostname: TARGET_HOST,
        port: TARGET_PORT,
        socket: {
          data(_socket, data) {
            ws.sendBinary(data);
          },
          drain() {
            flushPending(ws.data);
          },
          close() {
            ws.data.closed = true;
            ws.close();
          },
          error(_socket, error) {
            console.error("[ws-proxy] Upstream TCP error: ", error);
            ws.data.closed = true;
            ws.close();
          },
        },
      })
        .then((socket) => {
          if (ws.data.closed) {
            socket.end();
            return;
          }
          ws.data.socket = socket;
          flushPending(ws.data);
        })
        .catch((error: unknown) => {
          console.error(
            `[ws-proxy] Failed to connect to ${TARGET_HOST}:${TARGET_PORT}: `,
            error,
          );
          ws.data.closed = true;
          ws.close();
        });
    },
    message(ws, message) {
      // Copied (not a view), since the bytes may sit in the queue.
      const bytes: Uint8Array =
        typeof message === "string"
          ? new TextEncoder().encode(message)
          : new Uint8Array(message);
      ws.data.pending.push(bytes);
      flushPending(ws.data);
    },
    close(ws) {
      ws.data.closed = true;
      ws.data.socket?.end();
    },
  },
});

console.log(
  `[ws-proxy] Listening on ws://127.0.0.1:${server.port}, piping to ${TARGET_HOST}:${TARGET_PORT}`,
);

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
  /** Client bytes buffered until the upstream TCP connection is open. */
  pending: Uint8Array[];
  closed: boolean;
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
          for (const chunk of ws.data.pending) {
            socket.write(chunk);
          }
          ws.data.pending = [];
          ws.data.socket = socket;
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
      const bytes: Uint8Array =
        typeof message === "string"
          ? new TextEncoder().encode(message)
          : new Uint8Array(message);
      if (ws.data.socket !== null) {
        ws.data.socket.write(bytes);
      } else {
        ws.data.pending.push(bytes);
      }
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

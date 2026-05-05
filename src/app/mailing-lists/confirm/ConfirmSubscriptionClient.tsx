"use client";

import { useCallback, useState, type ReactElement } from "react";
import { Button } from "@schemavaults/ui";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "expired" }
  | { kind: "invalid"; message: string }
  | { kind: "error"; message: string };

interface ConfirmSubscriptionClientProps {
  token: string | null;
  email: string | null;
}

export default function ConfirmSubscriptionClient({
  token,
  email,
}: ConfirmSubscriptionClientProps): ReactElement {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const linkIsMissingPieces =
    typeof token !== "string" ||
    token.length === 0 ||
    typeof email !== "string" ||
    email.length === 0;

  const handleConfirm = useCallback(async () => {
    if (linkIsMissingPieces) {
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/mailing-lists/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, email }),
      });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (res.status === 200 && json?.success) {
        setStatus({ kind: "success" });
        return;
      }
      if (res.status === 410) {
        setStatus({ kind: "expired" });
        return;
      }
      if (res.status === 400) {
        setStatus({
          kind: "invalid",
          message: json?.message ?? "Confirmation link is invalid.",
        });
        return;
      }
      setStatus({
        kind: "error",
        message:
          json?.message ?? "Something went wrong while confirming. Try again.",
      });
    } catch (e: unknown) {
      setStatus({
        kind: "error",
        message: "Network error while confirming. Try again.",
      });
    }
  }, [token, email, linkIsMissingPieces]);

  return (
    <main
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "48px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.75rem", margin: "0 0 12px 0" }}>
        Confirm your subscription
      </h1>

      {linkIsMissingPieces ? (
        <p style={{ color: "#475569", lineHeight: 1.6 }}>
          This confirmation link is missing required information. Please open
          the link from your email exactly as you received it.
        </p>
      ) : (
        <>
          <p style={{ color: "#475569", lineHeight: 1.6, margin: "0 0 16px" }}>
            Please confirm that you'd like to subscribe the following email
            address:
          </p>
          <div
            style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "12px 14px",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: 14,
              margin: "0 0 20px",
              wordBreak: "break-all",
            }}
          >
            {email}
          </div>

          {status.kind === "idle" || status.kind === "loading" ? (
            <Button
              onClick={handleConfirm}
              disabled={status.kind === "loading"}
            >
              {status.kind === "loading"
                ? "Confirming…"
                : "Confirm subscription"}
            </Button>
          ) : null}

          {status.kind === "success" ? (
            <p style={{ color: "#15803d", lineHeight: 1.6 }}>
              You're subscribed. Thanks for confirming!
            </p>
          ) : null}

          {status.kind === "expired" ? (
            <p style={{ color: "#b45309", lineHeight: 1.6 }}>
              This confirmation link has expired. Please request a new one by
              joining the mailing list again.
            </p>
          ) : null}

          {status.kind === "invalid" ? (
            <p style={{ color: "#b91c1c", lineHeight: 1.6 }}>
              {status.message}
            </p>
          ) : null}

          {status.kind === "error" ? (
            <p style={{ color: "#b91c1c", lineHeight: 1.6 }}>
              {status.message}
            </p>
          ) : null}
        </>
      )}
    </main>
  );
}

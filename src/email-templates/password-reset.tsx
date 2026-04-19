import { Button, Html, Text } from "@react-email/components";
import type { ReactElement } from "react";

export interface PasswordResetEmailProps {
  resetLink: string;
  expiresInMinutes: number;
}

export default function PasswordResetEmail(
  props: PasswordResetEmailProps,
): ReactElement {
  if (
    (typeof props.resetLink !== "string" ||
      typeof props.expiresInMinutes !== "number") &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error("Missing required props for PasswordResetEmail template!");
  }

  return (
    <Html>
      <Text>
        We received a request to reset your password. Click the button below to
        choose a new password.
      </Text>
      <Button
        href={props.resetLink}
        style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
      >
        Reset Password
      </Button>
      <Text style={{ color: "#666", fontSize: "14px", marginTop: "16px" }}>
        This link will expire in {props.expiresInMinutes} minutes. If you did
        not request a password reset, you can safely ignore this email.
      </Text>
    </Html>
  );
}

PasswordResetEmail.PreviewProps = {
  resetLink: "https://schemavaults.com/reset?token=sample-token",
  expiresInMinutes: 30,
} satisfies PasswordResetEmailProps;

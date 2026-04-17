import { Button, Html, Text } from "@react-email/components";
import type { ReactElement } from "react";

interface VerifyEmailProps {
  url: string;
  welcomeMessage?: string;
}

export default function VerifyEmail(props: VerifyEmailProps): ReactElement {
  if (
    (typeof props.url !== "string" ||
      (typeof props.welcomeMessage !== "undefined" &&
        typeof props.welcomeMessage !== "string")) &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error("Missing required props for VerifyEmail template!");
  }

  const greeting =
    typeof props.welcomeMessage === "string" && props.welcomeMessage.length > 0
      ? props.welcomeMessage
      : "Welcome! Please verify your email address to get started.";

  return (
    <Html>
      <Text>{greeting}</Text>
      <Text>
        Click the button below to verify your email address and activate your
        account.
      </Text>
      <Button
        href={props.url}
        style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
      >
        Verify Email
      </Button>
      <Text style={{ color: "#666", fontSize: "14px", marginTop: "16px" }}>
        If you did not create an account, you can safely ignore this email.
      </Text>
    </Html>
  );
}

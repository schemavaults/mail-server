import { Button, Html, Text } from "@react-email/components";
import type { ReactElement } from "react";

export default function TestEmail(props: { name: string }): ReactElement {
  if (
    typeof props.name !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error("Missing 'name' in props to fill in template!");
  }

  return (
    <Html>
      <Text>Hello {props.name}!</Text>
      <Button
        href="https://schemavaults.com"
        style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
      >
        View SchemaVaults homepage
      </Button>
    </Html>
  );
}

TestEmail.PreviewProps = {
  name: "Jane Doe",
} satisfies { name: string };

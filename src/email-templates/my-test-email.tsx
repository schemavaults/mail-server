import { Button, Html } from "@react-email/components";
import * as React from "react";

export default function TestEmail(): React.ReactElement {
  return (
    <Html>
      <Button
        href="https://schemavaults.com"
        style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
      >
        View SchemaVaults homepage
      </Button>
    </Html>
  );
}

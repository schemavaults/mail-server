import { afterEach, describe, expect, it, spyOn, type Mock } from "bun:test";
import { Resend } from "resend";
import { ResendMailTransport } from "../ResendMailTransport";

// Drives a real Resend SDK client with `fetch` stubbed, so the assertions
// are on the JSON body that would actually be POSTed to Resend's API.

const PDF_BASE64 = Buffer.from("%PDF-1.7 fake invoice bytes").toString(
  "base64",
);
const PNG_BASE64 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]).toString(
  "base64",
);

let fetchSpy: Mock<typeof fetch> | null = null;

function stubResendApi(): { requestBodies: () => unknown[] } {
  fetchSpy = spyOn(globalThis, "fetch").mockImplementation((async () =>
    new Response(JSON.stringify({ id: "resend-message-id" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })) as unknown as typeof fetch);
  const spy = fetchSpy;
  return {
    requestBodies: () =>
      spy.mock.calls.map(([, init]) =>
        JSON.parse(String((init as RequestInit | undefined)?.body)),
      ),
  };
}

afterEach(() => {
  fetchSpy?.mockRestore();
  fetchSpy = null;
});

describe("ResendMailTransport attachments", () => {
  it("sends attachments to Resend as base64 content without decoding them", async () => {
    const api = stubResendApi();
    const transport = new ResendMailTransport("", new Resend("re_test_key"));

    const result = await transport.send({
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Invoice",
      html: '<p>Invoice attached.</p><img src="cid:logo">',
      text: "Invoice attached.",
      attachments: [
        {
          filename: "invoice.pdf",
          content: PDF_BASE64,
          contentType: "application/pdf",
        },
        {
          filename: "logo.png",
          content: PNG_BASE64,
          contentId: "logo",
        },
      ],
    });

    expect(result).toEqual({ id: "resend-message-id" });
    const [body] = api.requestBodies() as [
      { attachments: Record<string, unknown>[] },
    ];
    expect(body.attachments).toEqual([
      {
        filename: "invoice.pdf",
        content: PDF_BASE64,
        content_type: "application/pdf",
      },
      // No content_type: Resend derives it from the filename. content_id
      // makes Resend send the attachment inline.
      { filename: "logo.png", content: PNG_BASE64, content_id: "logo" },
    ]);
  });

  it("omits attachments from the Resend request when there are none", async () => {
    const api = stubResendApi();
    const transport = new ResendMailTransport("", new Resend("re_test_key"));

    await transport.send({
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "No files",
      html: "<p>Hi</p>",
      text: "Hi",
    });

    const [body] = api.requestBodies() as [Record<string, unknown>];
    expect(body.attachments).toBeUndefined();
  });
});

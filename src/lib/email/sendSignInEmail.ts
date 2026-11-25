import type { EmailConfig } from "next-auth/providers";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SIGN_IN_ICON_CID, signInEmail } from "./signInEmail";

export const sendSignInEmail: EmailConfig["sendVerificationRequest"] = async ({
  identifier, url, expires, provider,
}) => {
  if (!provider.apiKey || !provider.from) {
    throw new Error("Sign-in email is not configured");
  }

  let icon: Buffer | undefined;
  try {
    icon = await readFile(join(process.cwd(), "public/icons/icon-192.png"));
  } catch {
    // A missing decorative image must not prevent an archer from signing in.
    console.warn("Sign-in email icon unavailable; sending text branding only");
  }

  const message = signInEmail({ url, expires, includeIcon: Boolean(icon) });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: provider.from, to: identifier, ...message,
      ...(icon ? { attachments: [{
        filename: "in-the-forest.png",
        content_type: "image/png",
        content_id: SIGN_IN_ICON_CID,
        content: icon.toString("base64"),
      }] } : {}),
    }),
  });

  if (!response.ok) {
    // Provider response bodies can contain recipient and request details.
    throw new Error(`Sign-in email delivery failed (${response.status})`);
  }
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export const SIGN_IN_ICON_CID = "in-the-forest-icon";

export function signInEmail({ url, expires, includeIcon = true }: {
  url: string;
  expires: Date;
  includeIcon?: boolean;
}) {
  const destination = new URL(url);
  if (!["https:", "http:"].includes(destination.protocol)) {
    throw new Error("Invalid sign-in URL protocol");
  }

  const href = escapeHtml(url);
  const expiry = new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short",
  }).format(expires);

  return {
    subject: "Your In the Forest sign-in link",
    text: `IN THE FOREST

Open your scorebook

Use this link to sign in to In the Forest:
${url}

This link can only be used once and expires on ${expiry}.

If you didn’t request this email, you can safely ignore it.
`,
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Your In the Forest sign-in link</title>
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    /* Gmail iOS inverts text even on dark fills. These wrappers preserve white
       branding/action text without forcing the rest of the email into light mode.
       https://www.hteumeuleu.com/2021/fixing-gmail-dark-mode-css-blend-modes/ */
    u + .email-body .gmail-screen { background:#000; mix-blend-mode:screen; }
    u + .email-body .gmail-difference { background:#000; mix-blend-mode:difference; }
    @media (prefers-color-scheme: dark) {
      .email-body, .email-background { background-color:#18221c !important; }
      .email-card { background-color:#243129 !important; border-color:#526355 !important; }
      .email-heading, .email-link { color:#f2eee3 !important; }
      .email-copy { color:#c6cebf !important; }
      .email-rule { border-color:#526355 !important; }
    }
    [data-ogsc] .email-background { background-color:#18221c !important; }
    [data-ogsc] .email-card { background-color:#243129 !important; border-color:#526355 !important; }
    [data-ogsc] .email-heading, [data-ogsc] .email-link { color:#f2eee3 !important; }
    [data-ogsc] .email-copy { color:#c6cebf !important; }
    [data-ogsc] .email-rule { border-color:#526355 !important; }
  </style>
</head>
<body class="email-body" style="margin:0;padding:0;background-color:#f2eee3;color:#263728;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">Your scorebook is ready. Use your sign-in link to open it.</div>
  <table class="email-background" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2eee3" style="width:100%;background-color:#f2eee3;">
    <tr><td align="center" style="padding:24px 12px 40px;">
      <!--[if mso]><table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:520px;">
        <tr><td bgcolor="#123426" style="padding:20px 24px;background-color:#123426;background-image:linear-gradient(#123426,#123426);">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            ${includeIcon ? `<td width="48" style="width:48px;vertical-align:middle;"><img src="cid:${SIGN_IN_ICON_CID}" width="40" height="40" alt="" style="display:block;border:0;width:40px;height:40px;"></td>` : ""}
            <td style="vertical-align:middle;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:26px;font-weight:bold;"><div class="gmail-screen"><div class="gmail-difference">IN THE FOREST</div></div></td>
          </tr></table>
        </td></tr>
        <tr><td class="email-card" bgcolor="#fffcf5" style="padding:32px 24px;background-color:#fffcf5;border:1px solid #d7d0be;border-top:0;">
          <h1 class="email-heading" style="margin:0 0 16px;color:#263728;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:36px;font-weight:bold;">Open your scorebook</h1>
          <p class="email-copy" style="margin:0 0 24px;font-size:16px;line-height:25px;color:#60634f;">Use the button below to sign in to In the Forest. No password needed.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" bgcolor="#123426" style="background-color:#123426;background-image:linear-gradient(#123426,#123426);border:1px solid #123426;border-radius:3px;mso-padding-alt:14px 22px;">
              <div class="gmail-screen"><div class="gmail-difference"><a href="${href}" style="display:inline-block;padding:14px 22px;border:1px solid #123426;border-radius:3px;color:#ffffff;font-size:16px;line-height:22px;font-weight:bold;text-decoration:none;text-align:center;mso-padding-alt:0;">Open your scorebook</a></div></div>
            </td>
          </tr></table>
          <p class="email-copy" style="margin:24px 0 0;font-size:14px;line-height:22px;color:#60634f;">This link can only be used once and expires on ${escapeHtml(expiry)}.</p>
          <hr class="email-rule" style="margin:24px 0;border:0;border-top:1px solid #d7d0be;">
          <p class="email-copy" style="margin:0 0 8px;font-size:13px;line-height:21px;color:#60634f;">Button not working? Copy and paste this link into your browser:</p>
          <p style="margin:0;font-size:12px;line-height:20px;word-break:break-all;overflow-wrap:anywhere;"><a class="email-link" href="${href}" style="color:#263728;text-decoration:underline;word-break:break-all;overflow-wrap:anywhere;">${href}</a></p>
        </td></tr>
        <tr><td style="padding:20px 24px 0;"><p class="email-copy" style="margin:0;font-size:13px;line-height:21px;color:#60634f;">If you didn’t request this email, you can safely ignore it.</p></td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`,
  };
}

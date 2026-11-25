import { SIGN_IN_ICON_CID, signInEmail } from "./signInEmail";

const expires = new Date("2026-11-19T14:30:00Z");
const url = "https://score.example/api/auth/callback/resend?token=abc123&email=archer%2Bclub%40example.com&callbackUrl=%2Fhistory%3Fyear%3D2026";

it("renders the brand, actual expiry, one-time guidance and a plain-text alternative", () => {
  const message = signInEmail({ url, expires });
  const document = new DOMParser().parseFromString(message.html, "text/html");
  expect(message.subject).toBe("Your In the Forest sign-in link");
  expect(document.documentElement.lang).toBe("en");
  expect(document.querySelector("h1")?.textContent).toBe("Open your scorebook");
  expect(document.body.textContent).toContain("19 Nov 2026, 14:30 UTC");
  expect(document.body.textContent).toContain("can only be used once");
  expect(document.body.textContent).toContain("If you didn’t request this email");
  expect(message.text).toContain(url);
  expect(message.text).toContain("19 Nov 2026, 14:30 UTC");
  expect(document.querySelector("img")?.getAttribute("src")).toBe(`cid:${SIGN_IN_ICON_CID}`);
  expect(document.querySelector('img[src^="http"]')).toBeNull();
});

it("retains text branding and working links when the decorative icon is unavailable", () => {
  const document = new DOMParser().parseFromString(signInEmail({ url, expires, includeIcon: false }).html, "text/html");
  expect(document.querySelector("img")).toBeNull();
  expect(document.body.textContent).toContain("IN THE FOREST");
  expect(document.querySelector("a")?.getAttribute("href")).toBe(url);
});

it("supplies a dark palette and targets Gmail's white-text fixes only at the header and action", () => {
  const document = new DOMParser().parseFromString(signInEmail({ url, expires }).html, "text/html");
  expect(document.querySelector('meta[name="color-scheme"]')?.getAttribute("content")).toBe("light dark");
  expect(document.querySelector("style")?.textContent).toContain("@media (prefers-color-scheme: dark)");
  expect(document.querySelector("style")?.textContent).toContain("u + .email-body .gmail-screen");
  const protectedText = [...document.querySelectorAll(".gmail-screen > .gmail-difference")];
  expect(protectedText).toHaveLength(2);
  expect(protectedText.map(element => element.textContent)).toEqual(["IN THE FOREST", "Open your scorebook"]);
  expect(document.querySelector(".email-copy .gmail-screen")).toBeNull();
});

it("preserves the token, encoded email and callback in the button and fallback link", () => {
  const document = new DOMParser().parseFromString(signInEmail({ url, expires }).html, "text/html");
  const links = [...document.querySelectorAll("a")];
  expect(links).toHaveLength(2);
  for (const link of links) expect(link.getAttribute("href")).toBe(url);
  expect(links[1].textContent).toBe(url);
});

it("escapes dynamic link text and attributes without changing their destination", () => {
  const unsafeUrl = `${url}&extra="><img src=x onerror='alert(1)'>&label=<script>alert(1)</script>`;
  const document = new DOMParser().parseFromString(signInEmail({ url: unsafeUrl, expires }).html, "text/html");
  expect(document.querySelectorAll("img")).toHaveLength(1);
  expect(document.querySelector("script")).toBeNull();
  expect(document.querySelector("[onerror]")).toBeNull();
  for (const link of document.querySelectorAll("a")) expect(link.getAttribute("href")).toBe(unsafeUrl);
});

it.each(["javascript:alert(1)", "data:text/html,test"])("rejects an unexpected URL protocol: %s", url => {
  expect(() => signInEmail({ url, expires })).toThrow("Invalid sign-in URL protocol");
});

import { GATE_CODE_COOKIE, getSiteGateCode } from "@/lib/runtimeConfig";

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const siteGateCode = getSiteGateCode();

  if (!siteGateCode) {
    return new Response(JSON.stringify({ message: "Access code not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (code === siteGateCode) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return new Response(JSON.stringify({ message: "Access code is valid" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `${GATE_CODE_COOKIE}=valid; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`,
      },
    });
  } else {
    return new Response(JSON.stringify({ message: "Invalid access code" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
};

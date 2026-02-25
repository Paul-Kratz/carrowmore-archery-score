const GATE_CODE_COOKIE = "x-gate-code";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code === "1609") {
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

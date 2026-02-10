export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code === "1609") {
    return new Response(JSON.stringify({ message: "Access code is valid" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ message: "Invalid access code" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
};

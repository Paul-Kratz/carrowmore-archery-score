import { getCompetitionParticipantSession } from "@/functions/competition";
import {
  COMPETITION_PARTICIPANT_COOKIE_MAX_AGE,
  getCompetitionParticipantCookieName,
} from "@/helpers/competition";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string; token: string }> },
) {
  const { code, token } = await params;
  const participantSession = await getCompetitionParticipantSession({
    code,
    token,
  });
  const redirectUrl = new URL(`/competition/${code}`, request.url);

  if (!participantSession?.participant) {
    redirectUrl.searchParams.set("error", "invalid-link");
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(getCompetitionParticipantCookieName(code), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COMPETITION_PARTICIPANT_COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}

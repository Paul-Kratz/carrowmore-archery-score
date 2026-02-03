import { ShootPage } from "@/components/pages/ShootPage";
import { ACTIVE_SHOOT_COOKIE } from "@/constants";
import { auth } from "@/lib/auth";
import { IUser } from "@/models";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Session({
  params,
}: {
  params: { shootId: string; roundNumber: number };
}) {
  const cookieStore = await cookies();
  const shootId = cookieStore.get(ACTIVE_SHOOT_COOKIE)?.value;

  const { roundNumber } = await params; // Get shoot id from route
  const authData = await auth(); // Check auth data for current user id

  if (!shootId) {
    redirect("/"); // TODO add an error
  }

  const roundNum = Number(roundNumber); // parse roundNumber as number

  if (roundNum < 1 || roundNum > 18) {
    redirect(`shoot/1`); // if invalid route param passed then go back to first round page
  }

  return (
    <ShootPage
      currentStation={roundNum}
      currentUser={authData?.user as IUser}
      shootId={shootId}
    />
  );
}

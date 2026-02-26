import { SummaryPage } from "@/components/pages/SummaryPage";
import { getShootSummary } from "@/functions/getShootSummary";
import { auth } from "@/lib/auth";
import { IShootWithParticipants, IUser } from "@/models";
import { redirect } from "next/navigation";

export default async function Summary({
  params,
}: {
  params: { shootId: string };
}) {
  const { shootId } = await params; // Get shoot id from route
  const authData = await auth(); // Check auth data for current user id

  if (!shootId) {
    redirect("/");
  }

  const shootInfo = (await getShootSummary({
    shootId,
    userId: authData?.user?.id,
  })) as IShootWithParticipants;

  return (
    <SummaryPage currentUser={authData?.user as IUser} shootInfo={shootInfo} />
  );
}

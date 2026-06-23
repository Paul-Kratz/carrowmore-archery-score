import { SummaryPage } from "@/components/pages/SummaryPage";
import { getShootWithAccess } from "@/functions/getShoot";
import { formatResponse } from "@/helpers/formatResponse";
import { auth } from "@/lib/auth";
import { IShootDenormalized, IUser } from "@/models";
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

  if (!authData?.user?.id) {
    redirect("/");
  }

  const access = await getShootWithAccess({
    shootId,
    userId: authData.user.id,
  });

  if (!access.exists || (!access.isCreator && !access.isParticipant)) {
    redirect("/");
  }

  const shootInfo = formatResponse(
    access.shoot,
  ) as unknown as IShootDenormalized;

  return (
    <SummaryPage currentUser={authData.user as IUser} shootInfo={shootInfo} />
  );
}

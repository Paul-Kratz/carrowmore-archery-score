import { ShootPage } from "@/components/pages/ShootPage";
import { auth } from "@/lib/auth";
import { IUser } from "@/models";
import { redirect } from "next/navigation";

type ShootSessionProps = {
  params: Promise<{
    shootId: string;
    roundNumber: string;
  }>;
};

export default async function ShootSession({ params }: ShootSessionProps) {
  const { shootId, roundNumber } = await params;
  const roundNum = Number(roundNumber);

  if (roundNum < 1 || roundNum > 18) {
    redirect(`/shoot/${shootId}/1`);
  }

  const authData = await auth();

  return (
    <ShootPage
      currentStation={roundNum}
      currentUser={authData?.user as IUser}
      shootId={shootId}
    />
  );
}

import { PublicCompetitionRoundPage } from "@/components/pages/competition/PublicCompetitionRoundPage";
import { isCompetitionRoundKey } from "@/helpers/competition";
import { redirect } from "next/navigation";

export default async function PublicCompetitionRound({
  params,
}: {
  params: Promise<{ code: string; roundKey: string; stationNumber: string }>;
}) {
  const { code, roundKey, stationNumber } = await params;
  const station = Number(stationNumber);

  if (!isCompetitionRoundKey(roundKey) || station < 1 || station > 18) {
    redirect(`/competition/${code}`);
  }

  return (
    <PublicCompetitionRoundPage
      code={code}
      roundKey={roundKey}
      stationNumber={station}
    />
  );
}

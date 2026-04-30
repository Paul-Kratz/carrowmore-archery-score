import { AdminCompetitionDashboard } from "@/components/pages/competition/AdminCompetitionDashboard";
import { auth } from "@/lib/auth";

export default async function CompetitionDashboard({
  params,
}: {
  params: Promise<{ competitionId: string }>;
}) {
  await auth();
  const { competitionId } = await params;

  return <AdminCompetitionDashboard competitionId={competitionId} />;
}

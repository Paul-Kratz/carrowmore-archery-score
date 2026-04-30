import { PublicCompetitionResultsPage } from "@/components/pages/competition/PublicCompetitionResultsPage";

export default async function PublicCompetitionResults({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return <PublicCompetitionResultsPage code={code} />;
}

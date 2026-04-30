import { PublicCompetitionPage } from "@/components/pages/competition/PublicCompetitionPage";

export default async function PublicCompetition({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return <PublicCompetitionPage code={code} />;
}

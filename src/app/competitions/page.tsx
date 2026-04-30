import { AdminCompetitionsPage } from "@/components/pages/competition/AdminCompetitionsPage";
import { auth } from "@/lib/auth";

export default async function Competitions() {
  await auth();

  return <AdminCompetitionsPage />;
}

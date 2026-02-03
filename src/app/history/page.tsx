import DockWrapper from "@/components/DockWrapper";
import { getParticipatedShoots } from "@/functions/getParticipatedShoots";
import { auth } from "@/lib/auth";

export default async function History() {
  const session = await auth();
  const shoots = await getParticipatedShoots(session?.user?.id as string);

  return (
    <DockWrapper>
      <h1 className="mt-20">History</h1>
      <code>{JSON.stringify(shoots)}</code>
    </DockWrapper>
  );
}

import { HistoryPage } from "@/components/pages/HistoryPage";
import { auth } from "@/lib/auth";
import { IUser } from "@/models";

export default async function History() {
  const session = await auth();

  if (!session?.user) {
    return <div className="p-4">Please log in to view your shoot history.</div>;
  }

  return <HistoryPage currentUser={session.user as IUser} />;
}

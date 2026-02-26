import { HistoryPage } from "@/components/pages/HistoryPage";
import { getShootChartData } from "@/functions/getShootChartData";
import { auth } from "@/lib/auth";
import { IShootChartData, IUser } from "@/models";

export default async function History() {
  const session = await auth();

  if (!session?.user) {
    return <div className="p-4">Please log in to view your shoot history.</div>;
  }

  const chartData = (await getShootChartData(
    session.user.id as string,
  )) as IShootChartData[];

  return (
    <HistoryPage currentUser={session.user as IUser} chartData={chartData} />
  );
}

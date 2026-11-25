import { Shoot } from "@/models";
import { formatHistoryDate } from "../history/historyUtils";

export function SummaryHeaderCard({ currentUserId, shootInfo }: {
  currentUserId: string;
  shootInfo: Shoot;
}) {
  const status = shootInfo.completed
    ? "Complete"
    : shootInfo.remainingScoreCount === 0 && shootInfo.participants.length > 0
      ? "All scored"
      : "In progress";

  return (
    <div className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
      <p className="font-semibold text-foreground">{shootInfo.clubData?.name ?? shootInfo.clubId}</p>
      <p>{formatHistoryDate(shootInfo.createdAt.getTime())}</p>
      <p>{status} · {shootInfo.totalStations} stations · {shootInfo.participants.length} {shootInfo.participants.length === 1 ? "archer" : "archers"}</p>
      {shootInfo.isCreatedBy(currentUserId) && <p>Tracked by you</p>}
      {shootInfo.notes?.trim() && (
        <div className="mt-4 border-l-2 border-border pl-3">
          <p className="font-semibold text-foreground">Notes</p>
          <p className="whitespace-pre-wrap wrap-anywhere">{shootInfo.notes}</p>
        </div>
      )}
    </div>
  );
}

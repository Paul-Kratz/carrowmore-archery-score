import { ShootParticipant } from "@/models";
import { getClubScoreValues } from "./summaryUtils";

export function ParticipantSummaryCard({ participant, clubId }: {
  participant: ShootParticipant;
  clubId: string;
}) {
  // Retain historical scores even if a club's scoring options have changed.
  const values = [...new Set([
    ...getClubScoreValues(clubId),
    ...participant.scores.flatMap(({ score }) => score === null ? [] : [score]),
  ])].sort((a, b) => b - a);
  const counts = participant.getScoreCounts(values);

  return (
    <article aria-label={`${participant.getParticipantLabel()} score pattern`} className="min-w-0 border-t border-border py-5">
      <h3 className="font-semibold wrap-anywhere">{participant.getParticipantLabel()}</h3>
      <p className="mt-1 text-sm text-muted-foreground">Average per scored station: {participant.completedStationCount ? participant.averageScore.toFixed(2) : "—"}</p>
      <dl className="mt-4 grid grid-cols-4 gap-x-2 gap-y-4 text-center">
        {values.map(score => (
          <div key={score} aria-label={`Score ${score} count ${counts.get(score) ?? 0}`}>
            <dt className="text-xs text-muted-foreground">{score} pts</dt>
            <dd className="mt-1 font-semibold tabular-nums">{counts.get(score) ?? 0}<span className="sr-only"> times</span></dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

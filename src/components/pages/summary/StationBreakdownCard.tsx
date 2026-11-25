import { ShootParticipant } from "@/models";

function scoreTone(score: number | null) {
  if (score === null) return { surface: "border-border bg-background text-muted-foreground", accent: "bg-border" };
  if (score >= 16) return { surface: "border-[#b9c899] bg-[#eef3df] text-foreground", accent: "bg-(--olive-green)" };
  if (score >= 10) return { surface: "border-[#cad8a9] bg-[#f2f5e8] text-foreground", accent: "bg-(--sage-green)" };
  if (score >= 4) return { surface: "border-[#d7c69f] bg-[#f7efd9] text-(--warm-brown)", accent: "bg-(--warm-brown)" };
  return { surface: "border-[#d9b2aa] bg-[#f5e3dd] text-[#7d2d25]", accent: "bg-[#a25a4d]" };
}

export function StationBreakdownCard({ participants, totalStations }: {
  participants: ShootParticipant[];
  totalStations: number;
}) {
  const visibleParticipants = participants.filter(participant => participant.scoreDetailsVisible);
  if (visibleParticipants.length === 0) return null;

  return (
    <div role="region" aria-label="Station breakdown" className="space-y-4">
      <p className="text-xs text-muted-foreground">— means not scored.</p>
      {visibleParticipants.map(participant => {
        const name = participant.getParticipantLabel();
        return (
          <section key={participant.id} aria-label={`${name} station scores`} className="rounded-sm border border-border bg-card p-3 sm:p-4">
            <h3 className="font-semibold wrap-anywhere">{name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{participant.completedStationCount}/{totalStations} stations scored</p>
            <ol aria-label={`${name} station breakdown`} className="mt-4 grid grid-cols-4 gap-1.5 min-[360px]:grid-cols-6">
              {Array.from({ length: totalStations }, (_, index) => index + 1).map(station => {
                const score = participant.getScoreForStation(station);
                const tone = scoreTone(score);
                return (
                  <li key={station} aria-label={`${name} station ${station} score ${score ?? "not scored"}`}
                    className={`min-w-0 overflow-hidden rounded-sm border text-center ${tone.surface}`}>
                    <div aria-hidden="true" className={`h-1 ${tone.accent}`} />
                    <div className="py-1.5">
                      <span aria-hidden="true" className="block text-xs text-muted-foreground">{station}</span>
                      <span aria-hidden="true" className="block text-sm font-semibold tabular-nums">{score ?? "—"}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

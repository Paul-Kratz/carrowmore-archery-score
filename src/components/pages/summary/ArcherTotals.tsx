import { getPegColorHex, getPegColorLabel } from "@/constants";
import { ShootParticipant } from "@/models";

export function ArcherTotals({ participants, totalStations }: {
  participants: ShootParticipant[];
  totalStations: number;
}) {
  return (
    <table className="w-full table-fixed text-sm">
      <caption className="sr-only">Archer totals</caption>
      <thead className="border-b border-border text-xs text-muted-foreground">
        <tr>
          <th scope="col" className="py-3 pr-3 text-left font-medium">Archer</th>
          <th scope="col" className="w-[28%] py-3 text-right font-medium wrap-anywhere">Total</th>
          <th scope="col" className="w-[30%] py-3 pl-3 text-right font-medium wrap-anywhere">Scored</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {participants.map(participant => (
          <tr key={participant.id}>
            <th scope="row" className="py-4 pr-3 text-left font-normal">
              <span className="block font-semibold wrap-anywhere">{participant.getParticipantLabel()}</span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {participant.pegColor && <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full border border-foreground/30" style={{ backgroundColor: getPegColorHex(participant.pegColor) }} />
                  {getPegColorLabel(participant.pegColor)} peg
                </span>}
                {participant.isGuest && <span>Guest</span>}
              </span>
            </th>
            <td className="py-4 text-right text-xl font-semibold tabular-nums">{participant.completedStationCount > 0 ? participant.totalScore : <span aria-label="No scores yet">—</span>}</td>
            <td className="py-4 pl-3 text-right tabular-nums text-muted-foreground">{participant.completedStationCount}/{totalStations}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

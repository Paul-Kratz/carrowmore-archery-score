"use client";

import { CLUBS } from "@/constants";
import { SetupSelect } from "./SetupSelect";

type ClubSelectorCardProps = {
  disabled?: boolean;
  selectedClub: string;
  onClubChange: (clubId: string) => void;
};

export function ClubSelectorCard({
  disabled = false,
  selectedClub,
  onClubChange,
}: ClubSelectorCardProps) {
  return (
    <section
      className="rounded border border-border p-4 shadow sm:p-5"
      aria-labelledby="club-heading"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="club-heading" className="text-base font-semibold">
          <label htmlFor="shoot-club" className="font-semibold">
            Club
          </label>
        </h2>
        <p className="text-sm tabular-nums text-muted-foreground">
          {CLUBS[selectedClub].totalStations} stations
        </p>
      </div>
      <SetupSelect
        id="shoot-club"
        label="Club"
        value={selectedClub}
        onValueChange={onClubChange}
        disabled={disabled}
        fullWidth
        options={Object.entries(CLUBS).map(([clubId, clubData]) => ({
          value: clubId,
          label: clubData.name,
        }))}
      />
    </section>
  );
}

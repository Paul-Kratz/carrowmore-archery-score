"use client";

import { CLUBS } from "@/constants";
import { Card, Select } from "@radix-ui/themes";
import { MapPin } from "lucide-react";

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
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-(--deep-forest-green) rounded-sm px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-(--sage-green)" />
          <h2 className="text-base font-bold">Choose club</h2>
        </div>
      </div>

      <Select.Root
        defaultValue={selectedClub}
        onValueChange={onClubChange}
        disabled={disabled}
      >
        <div className="p-4">
          <Select.Trigger
            aria-label="Club"
            className="h-12! w-full! justify-between! rounded-lg! border! border-border! bg-[#fbf7e8]! px-4! text-base! font-bold! text-foreground! shadow-sm! transition-colors! hover:border-(--deep-forest-green)! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-(--sage-green)!"
            variant="surface"
          />
        </div>
        <Select.Content
          className="rounded-lg! border! border-border! bg-popover! text-popover-foreground! shadow-xl!"
          position="popper"
        >
          <Select.Group>
            {Object.entries(CLUBS).map(([clubId, clubData]) => (
              <Select.Item
                key={clubId}
                value={clubId}
                className="text-foreground! data-highlighted:bg-[#dbe8d1]! data-[state=checked]:bg-[#dbe8d1]!"
              >
                {clubData.name}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </Card>
  );
}

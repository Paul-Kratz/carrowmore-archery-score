"use client";

import { Select } from "@radix-ui/themes";
import { scorebookStyles, scorebookTheme } from "../../shared/scorebookTheme";

type SetupSelectProps = {
  id?: string;
  label: string;
  value: string;
  disabled?: boolean;
  fullWidth?: boolean;
  onValueChange: (value: string) => void;
  options: { value: string; label: string; color?: string }[];
};

export function SetupSelect({
  id,
  label,
  value,
  disabled,
  fullWidth = false,
  onValueChange,
  options,
}: SetupSelectProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <Select.Root
      size="3"
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Select.Trigger
        id={id}
        aria-label={label}
        variant="surface"
        className={`min-h-11! justify-between! border! border-input! bg-card! text-foreground! shadow-none! ${
          fullWidth ? "min-h-12! w-full!" : "w-36! px-2!"
        }`}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          {selected?.color && (
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/20"
              style={{ backgroundColor: selected.color }}
            />
          )}
          <span className="truncate">{selected?.label}</span>
        </span>
      </Select.Trigger>
      <Select.Content
        highContrast
        position="popper"
        side="bottom"
        align={fullWidth ? "start" : "end"}
        style={scorebookTheme}
        className={`${scorebookStyles.menu} min-w-(--radix-select-trigger-width)!`}
      >
        {options.map((option) => (
          <Select.Item
            key={option.value}
            value={option.value}
            className="min-h-11! text-base!"
          >
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}

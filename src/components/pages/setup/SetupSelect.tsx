"use client";

import { Select } from "@radix-ui/themes";
import { scorebookStyles, scorebookTheme } from "../../shared/scorebookTheme";

type SetupSelectProps = {
  id?: string;
  label: string;
  value: string;
  disabled?: boolean;
  fullWidth?: boolean;
  colorOnly?: boolean;
  onValueChange: (value: string) => void;
  options: { value: string; label: string; color?: string }[];
};

export function SetupSelect({
  id,
  label,
  value,
  disabled,
  fullWidth = false,
  colorOnly = false,
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
        className={`min-h-11! border! border-input! bg-card! text-foreground! shadow-none! ${
          fullWidth ? "min-h-12! w-full! justify-between!" : colorOnly ? "w-16! justify-center! gap-2! px-0! [&_.rt-SelectTriggerInner]:flex [&_.rt-SelectTriggerInner]:flex-none [&_.rt-SelectTriggerInner>span]:flex [&_.rt-SelectIcon]:w-3" : "justify-between! px-2!"
        }`}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          {selected?.color && (
            <span
              aria-hidden="true"
              className={`${colorOnly ? "h-5 w-5" : "h-2.5 w-2.5"} shrink-0 rounded-full border border-black/20`}
              style={{ backgroundColor: selected.color }}
            />
          )}
          <span className={colorOnly ? "sr-only" : "truncate"}>{selected?.label}</span>
        </span>
      </Select.Trigger>
      <Select.Content
        highContrast
        position="popper"
        side="bottom"
        align={fullWidth ? "start" : "end"}
        style={scorebookTheme}
        className={`${scorebookStyles.menu} ${colorOnly ? "w-16! min-w-16! [&_.rt-SelectViewport]:p-1!" : fullWidth ? "min-w-(--radix-select-trigger-width)!" : ""}`}
      >
        {options.map((option) => (
          <Select.Item
            key={option.value}
            value={option.value}
            textValue={option.label}
            title={colorOnly ? option.label : undefined}
            className={`min-h-11! text-base! ${colorOnly ? "grid! grid-cols-[1.25rem_0.75rem]! justify-center! gap-x-2! px-0! [&>span:last-child]:col-start-1 [&>span:last-child]:row-start-1 [&>span:last-child]:flex [&_.rt-SelectItemIndicator]:static! [&_.rt-SelectItemIndicator]:col-start-2 [&_.rt-SelectItemIndicator]:row-start-1 [&_.rt-SelectItemIndicator]:w-3! [&_.rt-SelectItemIndicatorIcon]:w-3!" : ""}`}
          >
            <span className="inline-flex items-center gap-2">
              {option.color && <span
                aria-hidden="true"
                className={`${colorOnly ? "h-5 w-5" : "h-2.5 w-2.5"} shrink-0 rounded-full border border-black/20`}
                style={{ backgroundColor: option.color }}
              />}
              <span className={colorOnly ? "sr-only" : undefined}>{option.label}</span>
            </span>
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}

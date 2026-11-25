import type { CSSProperties } from "react";

// Shared with portalled scorebook menus, which render outside the page's theme scope.
export const scorebookTheme = {
  "--background": "#f2eee3",
  "--foreground": "#263728",
  "--card": "#fffcf5",
  "--popover": "#fffcf5",
  "--popover-foreground": "#263728",
  "--muted-foreground": "#60634f",
  "--border": "#d7d0be",
  "--input": "#7f876f",
  "--focus-8": "#123426",
  "--focus-a8": "#123426",
} as CSSProperties;

// Reuse these on Radix portal contents so pages, menus and dialogs share one treatment.
export const scorebookStyles = {
  dialog: "rounded-sm! border! border-border! bg-card! p-5! text-foreground! shadow-lg! sm:p-6!",
  dialogHeader: "mb-3 flex items-center justify-between gap-3",
  dialogTitle: "m-0! text-xl! font-semibold! text-foreground!",
  description: "text-sm! leading-relaxed! text-muted-foreground!",
  field: "min-h-11! border! border-input! bg-background! text-foreground! shadow-none!",
  primaryButton: "min-h-11! bg-primary! bg-none! px-4! font-semibold! text-white! shadow-none! hover:bg-(--deep-forest-green)! disabled:opacity-50!",
  secondaryButton: "min-h-11! border! border-input! bg-card! bg-none! px-4! text-foreground! shadow-none! hover:bg-background! disabled:opacity-50!",
  dangerButton: "min-h-11! bg-red-800! bg-none! px-4! font-semibold! text-white! shadow-none! hover:bg-red-900! disabled:opacity-50!",
  closeButton: "m-0! p-0! flex! h-11! w-11! shrink-0! items-center! justify-center! rounded-sm! text-muted-foreground! hover:bg-background! hover:text-foreground! disabled:opacity-50!",
  menu: "rounded-sm! border! border-border! bg-card! text-foreground! shadow-md!",
  menuItem: "min-h-11! rounded-sm! text-sm!",
} as const;

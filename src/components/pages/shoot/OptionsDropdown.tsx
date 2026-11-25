import { useRef, useState } from "react";
import { Button, DropdownMenu } from "@radix-ui/themes";
import { LogOut, Settings } from "lucide-react";
import { ExitDialog } from "./ExitDialog";
import { Shoot } from "@/models";
import { useShootContext } from "@/contexts/ShootContext";
import { scorebookStyles, scorebookTheme } from "@/components/shared/scorebookTheme";

type OptionsDropdownProps = { shoot: Shoot };

export const OptionsDropdown = ({ shoot }: OptionsDropdownProps) => {
  const { showScores, setShowScores } = useShootContext();
  const [exitOpen, setExitOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button ref={triggerRef} aria-label="Shoot options" variant="ghost" size="1" className="min-h-11! min-w-11! text-primary-foreground!">
          <Settings aria-hidden="true" /><DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content highContrast align="end" sideOffset={8} style={scorebookTheme} className={scorebookStyles.menu}>
        <DropdownMenu.CheckboxItem checked={showScores} onCheckedChange={setShowScores} onSelect={(event) => event.preventDefault()} className={scorebookStyles.menuItem}>
          Show total scores
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator className="my-1.5! bg-border!" />
        <DropdownMenu.Item onSelect={() => setExitOpen(true)} className={scorebookStyles.menuItem}>
          <LogOut aria-hidden="true" className="h-4 w-4" />Exit shoot
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
    {exitOpen && <ExitDialog defaultOpen shoot={shoot} onOpenChange={setExitOpen} onCloseAutoFocus={() => triggerRef.current?.focus()} />}
    </>
  );
};

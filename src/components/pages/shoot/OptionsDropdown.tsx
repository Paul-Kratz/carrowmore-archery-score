import { Button, DropdownMenu } from "@radix-ui/themes";
import { LogOut, Settings } from "lucide-react";
import { ExitDialog } from "./ExitDialog";
import { ShowScoresToggle } from "./ShotScoresToggle";
import { IShootDenormalized } from "@/models";

type OptionsDropdownProps = {
  shoot: IShootDenormalized;
};

export const OptionsDropdown = ({ shoot }: OptionsDropdownProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button
          variant="ghost"
          size="1"
          className="h-10! text-primary-foreground!"
        >
          <Settings />
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        sideOffset={8}
        className="bg-popover! text-popover-foreground!"
      >
        <div className="rounded-md px-3 hover:bg-[#edf4e9]">
          <ShowScoresToggle />
        </div>

        <DropdownMenu.Separator className="mx-3! my-1.5! bg-border!" />

        <ExitDialog
          isShootFinished={false}
          shoot={shoot}
          triggerComponent={
            <Button
              variant="ghost"
              size="1"
              className="h-10! justify-start! gap-2! rounded-md! px-5! text-sm! font-bold! text-(--deep-forest-green)!"
            >
              <LogOut />
              Exit shoot
            </Button>
          }
        />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

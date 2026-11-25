"use client";
import { useUpdateShoot } from "@/hooks/queries";
import { Shoot } from "@/models";
import { Button, Dialog, TextArea } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { ACTIVE_SHOOT_COOKIE, CLUBS } from "@/constants";
import { ForestLoader } from "@/components/shared/ForestLoader";
import { X } from "lucide-react";
import { scorebookStyles, scorebookTheme } from "@/components/shared/scorebookTheme";

type ExitDialogProps = {
  isShootFinished?: boolean;
  shoot: Shoot;
  triggerComponent?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCloseAutoFocus?: () => void;
};

export const ExitDialog = ({
  isShootFinished = false,
  shoot,
  triggerComponent,
  defaultOpen = false,
  onOpenChange,
  onCloseAutoFocus,
}: ExitDialogProps) => {
  const [notes, setNotes] = useState(shoot.notes ?? "");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [openedAt, setOpenedAt] = useState<Date | null>(() => defaultOpen ? new Date() : null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { mutateAsync } = useUpdateShoot();
  const router = useRouter();

  const scoreStartedAt = shoot.firstScoredAt
    ? new Date(shoot.firstScoredAt)
    : null;
  const shootLengthMs =
    scoreStartedAt && openedAt
      ? openedAt.getTime() - scoreStartedAt.getTime()
      : Number.NaN;
  const totalMinutes = Math.max(0, Math.floor(shootLengthMs / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const shootLength =
    Number.isFinite(shootLengthMs) && scoreStartedAt
      ? `${hours}h ${minutes}m`
      : "-";
  const dialogTitle = isShootFinished ? "Finish shoot" : "Leave shoot";
  const actionLabel = isShootFinished ? "Save & Finish" : "Save & Exit";
  const clubName = CLUBS[shoot.clubId]?.name ?? shoot.clubId;

  const saveShoot = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      await mutateAsync({
        shootId: shoot.id,
        notes,
        completed: isShootFinished,
      });
      if (isShootFinished) Cookies.remove(ACTIVE_SHOOT_COOKIE);
      else Cookies.set(ACTIVE_SHOOT_COOKIE, shoot.id);
      setIsOpen(false);
      onOpenChange?.(false);
      router.push("/");
    } catch {
      setSaveError("The shoot could not be saved. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!isSaving) {
          if (open) {
            setOpenedAt(new Date());
          }
          setIsOpen(open);
          onOpenChange?.(open);
        }
      }}
    >
      {triggerComponent && <Dialog.Trigger>{triggerComponent}</Dialog.Trigger>}
      <Dialog.Content style={scorebookTheme} className={scorebookStyles.dialog} maxWidth="420px" onCloseAutoFocus={onCloseAutoFocus ? (event) => { event.preventDefault(); onCloseAutoFocus(); } : undefined}>
        <div className={scorebookStyles.dialogHeader}>
          <Dialog.Title className={scorebookStyles.dialogTitle}>{dialogTitle}</Dialog.Title>
          <Dialog.Close>
            <Button aria-label="Close" disabled={isSaving} variant="ghost" className={scorebookStyles.closeButton}><X aria-hidden="true" className="h-5 w-5" /></Button>
          </Dialog.Close>
        </div>
        <Dialog.Description className={scorebookStyles.description}>
          {isShootFinished ? "Save your notes and finish this shoot." : "Save your notes and leave scoring. You can return to this shoot later."}
        </Dialog.Description>
        <dl className="my-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 border-y border-border py-3 text-sm">
          <dt className="text-muted-foreground">Club</dt><dd className="text-right">{clubName}</dd>
          <dt className="text-muted-foreground">Duration</dt><dd className="text-right tabular-nums">{shootLength}</dd>
        </dl>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Notes <span className="font-normal text-muted-foreground">(optional)</span></span>
          <TextArea size="3" value={notes} disabled={isSaving} placeholder="Anything worth remembering?" className={`${scorebookStyles.field} min-h-24!`} onChange={(event) => setNotes(event.target.value)} />
        </label>
        {saveError && <p role="alert" className="mt-4 text-sm text-red-800">{saveError}</p>}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Dialog.Close><Button variant="surface" disabled={isSaving} className={scorebookStyles.secondaryButton}>Cancel</Button></Dialog.Close>
          <Button onClick={saveShoot} disabled={isSaving} className={scorebookStyles.primaryButton}>
            {isSaving ? <ForestLoader label="Saving shoot" size="sm" tone="light" /> : actionLabel}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

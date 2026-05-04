"use client";
import { useUpdateShoot } from "@/hooks/queries";
import { IShoot } from "@/models";
import { Button, Dialog, TextArea } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { ACTIVE_SHOOT_COOKIE } from "@/constants";
import { ForestLoader } from "@/components/shared/ForestLoader";
import { Clock, Map, NotebookPen, TreePine, X } from "lucide-react";

type ExitDialogProps = {
  isShootFinished?: boolean;
  shoot: IShoot;
  triggerComponent: React.ReactNode;
};

export const ExitDialog = ({
  isShootFinished = false,
  shoot,
  triggerComponent,
}: ExitDialogProps) => {
  const [notes, setNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { mutateAsync } = useUpdateShoot();
  const router = useRouter();

  const scoreStartedAt = shoot.firstScoredAt
    ? new Date(shoot.firstScoredAt)
    : null;
  const shootLengthMs =
    scoreStartedAt && openedAt
      ? openedAt.getTime() - scoreStartedAt.getTime()
      : Number.NaN;
  const totalMinutes = Math.max(
    0,
    Math.floor(shootLengthMs / (1000 * 60)),
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const shootLength =
    Number.isFinite(shootLengthMs) && scoreStartedAt
      ? `${hours}h ${minutes}m`
      : "-";
  const dialogTitle = isShootFinished ? "Finish shoot" : "Leave shoot";
  const actionLabel = isShootFinished ? "Save & Finish" : "Save & Exit";
  const modeLabel = shoot.mode
    ? shoot.mode.charAt(0).toUpperCase() + shoot.mode.slice(1)
    : "-";

  const saveShoot = async () => {
    try {
      setIsSaving(true);
      await mutateAsync({
        shootId: shoot.id,
        notes,
        completed: isShootFinished,
      });
      Cookies.remove(ACTIVE_SHOOT_COOKIE);
      setIsOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error saving shoot:", error);
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
        }
      }}
    >
      <Dialog.Trigger>{triggerComponent}</Dialog.Trigger>
      <Dialog.Content
        className="overflow-hidden"
        style={{ padding: 0 }}
        maxWidth="420px"
      >
        <div className="border-b border-border bg-[linear-gradient(135deg,var(--club-red-dark),var(--club-red))] px-4 py-4 text-primary-foreground">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-(--club-gold)/70 bg-[rgba(18,52,38,0.45)]">
                <TreePine className="h-6 w-6 text-(--club-gold)" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold leading-tight">
                  {dialogTitle}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-[#dfe9cb]">
                  {isShootFinished ? "Close out this round" : "Save progress"}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close>
              <Button
                aria-label="Close"
                className="h-9 w-9 p-0 text-primary-foreground"
                disabled={isSaving}
                size="2"
                variant="ghost"
              >
                <X className="h-9 w-9" />
              </Button>
            </Dialog.Close>
          </div>
        </div>

        <div className="space-y-4 bg-card p-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-[#edf4e9] px-3 py-2">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Duration
              </div>
              <div className="text-base font-bold text-(--club-red-dark)">
                {shootLength}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-[#edf4e9] px-3 py-2">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                <Map className="h-3.5 w-3.5" />
                Trail
              </div>
              <div className="text-base font-bold text-(--club-red-dark)">
                {modeLabel}
              </div>
            </div>
          </div>

          <label className="block">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-(--club-red-dark)">
              <NotebookPen className="h-4 w-4" />
              Notes
            </div>
            <TextArea
              size="3"
              value={notes}
              disabled={isSaving}
              placeholder="Add anything worth remembering"
              className="min-h-28"
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-[1fr] gap-3 pt-1">
            <Button
              onClick={saveShoot}
              size="3"
              disabled={isSaving}
              className="forest-primary-button"
              style={{ width: "100%" }}
            >
              {isSaving ? (
                <ForestLoader label="Saving shoot" size="sm" tone="light" />
              ) : (
                <>
                  <TreePine className="w-5 h-5 mr-1" />
                  {actionLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

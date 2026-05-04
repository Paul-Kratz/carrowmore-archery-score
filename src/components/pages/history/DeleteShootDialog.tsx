"use client";

import { ForestLoader } from "@/components/shared/ForestLoader";
import { AlertDialog, Button } from "@radix-ui/themes";
import { AlertTriangle, Trash2, TreePine, X } from "lucide-react";

type DeleteShootDialogProps = {
  isDeleting?: boolean;
  open: boolean;
  onConfirm: () => Promise<void> | void;
  onOpenChange: () => void;
};

export function DeleteShootDialog({
  isDeleting = false,
  open,
  onConfirm,
  onOpenChange,
}: DeleteShootDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content
        className="overflow-hidden"
        style={{ padding: 0 }}
        maxWidth="420px"
      >
        <div className="border-b border-border bg-[linear-gradient(135deg,var(--club-red-dark),var(--club-red))] px-4 py-4 text-primary-foreground">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-(--club-gold)/70 bg-[rgba(18,52,38,0.45)]">
                <AlertTriangle className="h-6 w-6 text-(--club-gold)" />
              </div>
              <div>
                <AlertDialog.Title className="text-xl font-bold leading-tight">
                  Delete shoot
                </AlertDialog.Title>
                <AlertDialog.Description className="text-sm text-[#dfe9cb]">
                  Remove this round permanently
                </AlertDialog.Description>
              </div>
            </div>

            <AlertDialog.Cancel>
              <Button
                aria-label="Close"
                className="h-9 w-9 p-0 text-primary-foreground"
                disabled={isDeleting}
                size="2"
                variant="ghost"
              >
                <X className="h-5 w-5" />
              </Button>
            </AlertDialog.Cancel>
          </div>
        </div>

        <div className="space-y-4 bg-card p-4">
          <div className="rounded-lg border border-border bg-[#edf4e9] p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-(--club-red-dark)">
              <Trash2 className="h-4 w-4" />
              This cannot be undone
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              This will permanently delete the shoot, all participant scores, and
              any notes saved with the round.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AlertDialog.Cancel>
              <Button
                variant="surface"
                disabled={isDeleting}
                style={{ width: "100%" }}
              >
                Cancel
              </Button>
            </AlertDialog.Cancel>

            <Button
              variant="solid"
              color="red"
              onClick={onConfirm}
              disabled={isDeleting}
              style={{ width: "100%" }}
            >
              {isDeleting ? (
                <ForestLoader label="Deleting shoot" size="sm" tone="light" />
              ) : (
                <>
                  <TreePine className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

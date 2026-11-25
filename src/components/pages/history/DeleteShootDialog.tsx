"use client";

import { ForestLoader } from "@/components/shared/ForestLoader";
import {
  scorebookStyles,
  scorebookTheme,
} from "@/components/shared/scorebookTheme";
import { AlertDialog, Button } from "@radix-ui/themes";
import { useRef } from "react";

type DeleteShootDialogProps = {
  isDeleting?: boolean;
  open: boolean;
  error?: string | null;
  onConfirm: () => Promise<void> | void;
  onOpenChange: () => void;
};

export function DeleteShootDialog({
  isDeleting = false,
  open,
  error,
  onConfirm,
  onOpenChange,
}: DeleteShootDialogProps) {
  const returnFocusRef = useRef<HTMLElement | null>(null);
  if (!open) return null;

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content
        style={scorebookTheme}
        className={scorebookStyles.dialog}
        maxWidth="420px"
        onOpenAutoFocus={() => {
          returnFocusRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        }}
        onCloseAutoFocus={(event) => {
          if (returnFocusRef.current?.isConnected) {
            event.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
      >
        <div className={scorebookStyles.dialogHeader}>
          <AlertDialog.Title className={scorebookStyles.dialogTitle}>
            Delete shoot?
          </AlertDialog.Title>
        </div>
        <AlertDialog.Description className={scorebookStyles.description}>
          This will permanently delete the shoot, all participant scores and its
          notes. This cannot be undone.
        </AlertDialog.Description>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-800">
            {error}
          </p>
        )}
        <div className="mt-6 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
          <AlertDialog.Cancel>
            <Button
              disabled={isDeleting}
              variant="surface"
              className={scorebookStyles.secondaryButton}
            >
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <Button
            disabled={isDeleting}
            onClick={onConfirm}
            color="red"
            className={scorebookStyles.dangerButton}
          >
            {isDeleting ? (
              <ForestLoader label="Deleting shoot" size="sm" tone="light" />
            ) : (
              "Delete shoot"
            )}
          </Button>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

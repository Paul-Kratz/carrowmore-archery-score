"use client";

import { AlertDialog, Button, Flex } from "@radix-ui/themes";

type DeleteShootDialogProps = {
  open: boolean;
  onConfirm: () => Promise<void> | void;
  onOpenChange: () => void;
};

export function DeleteShootDialog({
  open,
  onConfirm,
  onOpenChange,
}: DeleteShootDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Delete Shoot</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure? This action cannot be undone. This will permanently delete
          the shoot and all associated scores.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>

          <Button variant="solid" color="red" onClick={onConfirm}>
            Delete Shoot
          </Button>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

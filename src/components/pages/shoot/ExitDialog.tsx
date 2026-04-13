"use client";
import { useUpdateShoot } from "@/hooks/queries";
import { IShoot } from "@/models";
import { Button, Dialog, Flex, Text, TextArea } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { ACTIVE_SHOOT_COOKIE } from "@/constants";

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
  const [isSaving, setIsSaving] = useState(false);
  const { mutateAsync } = useUpdateShoot();
  const router = useRouter();

  const shootLengthMs =
    new Date().getTime() - new Date(shoot.createdAt).getTime();
  const totalMinutes = Math.floor(shootLengthMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const shootLength = `${hours}h ${minutes}m`;

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
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger>{triggerComponent}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Exit Shoot?</Dialog.Title>

        <Text as="p" size="3" mb="1" weight="bold">
          Duration: {shootLength}
        </Text>
        <Text as="p" size="3" mb="1" weight="bold">
          Mode: {shoot.mode}
        </Text>

        <Flex direction={"column"} gap={"3"}>
          <label>
            <Text as="div" size="3" mb="1" weight="bold">
              Notes:
            </Text>
            <TextArea
              size={"3"}
              value={notes}
              placeholder="Do you want to add any notes about this shoot?"
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </Flex>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" size={"3"}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={saveShoot} size={"3"} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save & Exit"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

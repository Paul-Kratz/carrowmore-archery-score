import { useUpdateUsername } from "@/hooks/queries";
import { ForestLoader } from "@/components/shared/ForestLoader";
import { AlertDialog, Button, TextField } from "@radix-ui/themes";
import { Sprout } from "lucide-react";
import { useState } from "react";

export const AddUsernameDialog = () => {
  const { mutateAsync, isPending } = useUpdateUsername();
  const [username, setUsername] = useState("");

  const handleSave = async () => {
    if (username.trim() === "") {
      return;
    }
    try {
      await mutateAsync({ name: username });
      window.location.reload();
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };
  return (
    <AlertDialog.Root defaultOpen={true}>
      <AlertDialog.Content>
        <AlertDialog.Title>Add username to continue</AlertDialog.Title>
        <div className="flex flex-col gap-3">
          <TextField.Root
            placeholder="Enter your username to continue..."
            value={username}
            disabled={isPending}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Button
            disabled={username.trim() === "" || isPending}
            onClick={handleSave}
            className="forest-primary-button"
          >
            {isPending ? (
              <ForestLoader label="Saving username" size="sm" tone="light" />
            ) : (
              <>
                <Sprout className="w-5 h-5 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

import { useUpdateUsername } from "@/hooks/queries";
import { AlertDialog, Button, TextField } from "@radix-ui/themes";
import { useState } from "react";

export const AddUsernameDialog = () => {
  const { mutate } = useUpdateUsername();
  const [username, setUsername] = useState("");

  const handleSave = async () => {
    if (username.trim() === "") {
      return;
    }
    try {
      await mutate({ name: username });
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
            onChange={(e) => setUsername(e.target.value)}
          />

          <Button disabled={username.trim() === ""} onClick={handleSave}>
            Save
          </Button>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

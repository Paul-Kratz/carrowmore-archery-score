"use client";

import { useUpdateUsername } from "@/hooks/queries";
import { ForestLoader } from "@/components/shared/ForestLoader";
import { scorebookStyles, scorebookTheme } from "@/components/shared/scorebookTheme";
import { AlertDialog, Button, TextField } from "@radix-ui/themes";
import { useState } from "react";

export const AddUsernameDialog = () => {
  const { mutateAsync, isPending } = useUpdateUsername();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!username.trim() || isPending) return;
    setError(null);
    try {
      await mutateAsync({ name: username });
      window.location.reload();
    } catch {
      setError("Your name could not be saved. Please try again.");
    }
  };

  return (
    <AlertDialog.Root defaultOpen>
      <AlertDialog.Content style={scorebookTheme} className={scorebookStyles.dialog} maxWidth="420px">
        <AlertDialog.Title className={scorebookStyles.dialogTitle}>What should we call you?</AlertDialog.Title>
        <AlertDialog.Description className={`${scorebookStyles.description} mt-2!`}>Your name will appear on scorecards and in the archer list.</AlertDialog.Description>
        <form className="mt-5 space-y-5" onSubmit={(event) => { event.preventDefault(); void handleSave(); }}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Name</span>
            <TextField.Root value={username} disabled={isPending} autoComplete="nickname" placeholder="Your name" className={scorebookStyles.field} onChange={(event) => setUsername(event.target.value)} />
          </label>
          {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
          <Button type="submit" disabled={!username.trim() || isPending} className={`${scorebookStyles.primaryButton} w-full!`}>
            {isPending ? <ForestLoader label="Saving username" size="sm" tone="light" /> : "Save name"}
          </Button>
        </form>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

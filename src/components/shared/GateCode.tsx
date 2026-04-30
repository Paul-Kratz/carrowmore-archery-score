"use client";
import { FormEvent, useState } from "react";
import { Button, Card, Text, TextField } from "@radix-ui/themes";
import { KeyRound, ShieldCheck, TreePine } from "lucide-react";
import { useVerifyAccessCode } from "@/hooks/queries";
import { ForestLoader } from "./ForestLoader";

export const GateCode = () => {
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: verifyCode, isPending } = useVerifyAccessCode();

  const handleSetCode = async () => {
    try {
      setErrorMessage(null);
      await verifyCode({ accessCode: code });
      // Cookie is set server-side by the API; full reload so proxy sees it
      window.location.href = "/";
    } catch {
      setErrorMessage("Incorrect gate code. Please try again.");
      setCode("");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSetCode();
  };

  return (
    <div className="forest-page bg-background min-h-screen">
      <header className="bg-[var(--club-red)] text-primary-foreground border-b-4 border-[var(--club-gold)] shadow-lg">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--club-gold)] bg-[var(--club-red-dark)]">
                <TreePine className="w-6 h-6 text-[var(--club-gold)]" />
              </div>
              <div>
                <h1 className="text-xl font-bold">In the Forest</h1>
                <p className="text-xs text-[#dbe8bf]">Carrowmore Archers</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl flex-col justify-center px-4 py-8">
        <section className="mb-5 rounded-2xl border border-border bg-[linear-gradient(135deg,#fbf7e8,#dfe9cb)] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--club-red-dark)] text-primary-foreground">
              <ShieldCheck className="h-6 w-6 text-[var(--club-gold)]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold leading-tight">
                Welcome to In the Forest
              </h2>
              <p className="text-sm text-muted-foreground">
                Carrowmore Archers
              </p>
            </div>
          </div>
        </section>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-border bg-[#dfe9cb] px-4 py-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-[var(--club-red-dark)]" />
              <p className="font-bold">Please enter the gate code</p>
            </div>
          </div>

          <form className="space-y-4 p-4" onSubmit={handleSubmit}>
            <TextField.Root
              aria-label="Gate code"
              type="number"
              placeholder="Gate Code"
              value={code}
              disabled={isPending}
              onChange={(e) => {
                setCode(e.target.value);
                if (errorMessage) {
                  setErrorMessage(null);
                }
              }}
              maxLength={4}
              size="3"
            />
            {errorMessage && (
              <Text color="red" size="2" role="alert">
                {errorMessage}
              </Text>
            )}
            <Button
              size="4"
              className="forest-primary-button"
              style={{ width: "100%" }}
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <ForestLoader label="Checking gate code" size="sm" tone="light" />
              ) : (
                <>
                  <TreePine className="h-5 w-5 mr-1" />
                  Enter
                </>
              )}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

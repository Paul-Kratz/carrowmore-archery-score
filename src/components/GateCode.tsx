"use client";
import { useState } from "react";
import { Button, Card, TextField } from "@radix-ui/themes";
import { Target } from "lucide-react";
import { useVerifyAccessCode } from "@/hooks/queries";

export const GateCode = () => {
  const [code, setCode] = useState("");
  const { mutate: verifyCode } = useVerifyAccessCode();

  const handleSetCode = () => {
    verifyCode(
      { accessCode: code },
      {
        onSuccess: () => {
          // Cookie is set server-side by the API; full reload so middleware sees it
          window.location.href = "/";
        },
        onError: () => {
          alert("Incorrect gate code. Please try again.");
          setCode("");
        },
      },
    );
  };

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-background border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6" />
              <h1 className="text-xl font-semibold">In the Forest</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="container max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to In the Forest</h2>
        <Card className="p-6 w-full space-y-2">
          <p className="font-semibold mb-2.5">Please enter the gate code</p>
          <TextField.Root
            type="number"
            placeholder="Gate Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={4}
          />
          <Button
            className="mt-4"
            style={{ width: "100%" }}
            onClick={handleSetCode}
          >
            Enter
          </Button>
        </Card>
      </main>
    </div>
  );
};

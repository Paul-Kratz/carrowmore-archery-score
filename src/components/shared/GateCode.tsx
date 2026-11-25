"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { Button, TextField, Theme } from "@radix-ui/themes";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useVerifyAccessCode } from "@/hooks/queries";
import { oswald } from "@/fonts/oswald";
import { ForestLoader } from "./ForestLoader";
import { ScorebookHeader } from "./ScorebookHeader";
import { scorebookStyles, scorebookTheme } from "./scorebookTheme";

export const GateCode = () => {
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: verifyCode, isPending } = useVerifyAccessCode();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const canSubmit = Boolean(code.trim()) && !isPending;

  useEffect(() => {
    if (errorMessage && !isPending) inputRef.current?.focus();
  }, [errorMessage, isPending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      setErrorMessage(null);
      await verifyCode({ accessCode: code.trim() });
      // Reload so the proxy sees the gate cookie set by the API.
      window.location.href = "/";
    } catch {
      setErrorMessage("Incorrect gate code. Please try again.");
      setCode("");
    }
  };

  return (
    <Theme
      accentColor="green"
      grayColor="olive"
      radius="small"
      panelBackground="solid"
      style={scorebookTheme}
      className="flex min-h-dvh flex-col bg-background text-foreground"
    >
      <ScorebookHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-start justify-center px-5 pt-[max(2rem,8dvh)] pb-10 sm:px-8">
        <div className="w-full max-w-sm">
          <Image
            src="/icons/icon-512.png"
            alt="In the Forest logo"
            width={128}
            height={128}
            priority
            className="mx-auto mb-4 h-28 w-28 sm:h-32 sm:w-32"
          />
          <h1
            className={`${oswald.className} text-4xl leading-tight font-normal text-center`}
          >
            Come on in
          </h1>
          <p
            id={hintId}
            className="mt-3 text-base leading-relaxed text-muted-foreground text-center"
          >
            Enter the gate code to begin tracking.
          </p>

          <form
            aria-label="Gate access"
            className="mt-6 space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor={inputId}
                className="mb-2 block text-sm font-semibold"
              >
                Gate code
              </label>
              <TextField.Root
                ref={inputRef}
                id={inputId}
                type="text"
                inputMode="numeric"
                enterKeyHint="go"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={code}
                disabled={isPending}
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={
                  errorMessage ? `${hintId} ${errorId}` : hintId
                }
                onChange={(event) => {
                  setCode(event.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                size="3"
                maxLength={4}
                className={`${scorebookStyles.field} h-14! text-left! text-2xl! tracking-widest! tabular-nums [&_input]:text-left`}
              />
              {errorMessage && (
                <p
                  id={errorId}
                  role="alert"
                  className="mt-2 text-sm leading-relaxed text-red-800"
                >
                  {errorMessage}
                </p>
              )}
            </div>
            <Button
              size="4"
              type="submit"
              disabled={!canSubmit}
              className={`${scorebookStyles.primaryButton} min-h-12! w-full!`}
            >
              {isPending ? (
                <>
                  <ForestLoader
                    label="Checking gate code"
                    size="sm"
                    tone="light"
                  />
                  <span aria-hidden="true">Checking…</span>
                </>
              ) : (
                <>
                  Enter <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </Theme>
  );
};

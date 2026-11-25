"use client";

import { useId, useState, type FormEvent } from "react";
import { Button, TextField } from "@radix-ui/themes";
import { ArrowRight } from "lucide-react";
import { scorebookStyles } from "@/components/shared/scorebookTheme";
import { AuthScreen } from "./AuthScreen";
import { GoogleIcon } from "./GoogleIcon";

type LoginResult = { error: string } | void;

export function LoginForm({
  initialError,
  onGoogle,
  onEmail,
}: {
  initialError?: string;
  onGoogle: () => Promise<LoginResult>;
  onEmail: (email: string) => Promise<LoginResult>;
}) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState(initialError);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  async function submit(method: "google" | "email") {
    if (pending) return;
    setError(undefined);
    setPending(method);
    try {
      const result = await (method === "google"
        ? onGoogle()
        : onEmail(email.trim()));
      if (result?.error) {
        setError(result.error);
        setPending(null);
      }
    } catch {
      setError(
        "We couldn’t connect. Please check your connection and try again.",
      );
      setPending(null);
    }
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim() && event.currentTarget.checkValidity())
      void submit("email");
  }

  return (
    <AuthScreen
      title="Sign in"
      description="Open your scorebook with Google or a link sent to your email."
    >
      <div className="mt-8">
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mb-4 text-sm leading-relaxed text-red-800"
          >
            {error}
          </p>
        )}
        <Button
          type="button"
          size="3"
          disabled={Boolean(pending)}
          onClick={() => void submit("google")}
          className={`${scorebookStyles.secondaryButton} min-h-12! w-full!`}
        >
          {pending === "google" ? (
            <span>Opening Google…</span>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </Button>
        <div
          className="my-6 flex items-center gap-4 text-sm text-muted-foreground"
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <form
          aria-label="Email sign-in"
          onSubmit={submitEmail}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor={inputId}
              className="mb-2 block text-sm font-semibold"
            >
              Email address
            </label>
            <TextField.Root
              id={inputId}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={email}
              disabled={Boolean(pending)}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(undefined);
              }}
              size="3"
              placeholder="you@example.com"
              className={`${scorebookStyles.field} min-h-12!`}
            />
          </div>
          <Button
            size="3"
            type="submit"
            disabled={!email.trim() || Boolean(pending)}
            className={`${scorebookStyles.primaryButton} min-h-12! w-full!`}
          >
            {pending === "email" ? (
              <span>Sending link…</span>
            ) : (
              <>
                Email sign-in link{" "}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </>
            )}
          </Button>
          <p className="pt-3 text-sm leading-relaxed text-muted-foreground">
            No password needed. Use the link to sign in.
          </p>
        </form>
      </div>
    </AuthScreen>
  );
}

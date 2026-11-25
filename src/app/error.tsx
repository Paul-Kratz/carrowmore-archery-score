"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Recovery must work when client routing fails. */
import { Button } from "@radix-ui/themes";
import { ScorebookStatus } from "@/components/shared/ScorebookStatus";
import { scorebookStyles } from "@/components/shared/scorebookTheme";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ScorebookStatus title="Something went wrong" description="We couldn’t load this page. Please try again.">
      <Button onClick={reset} className={scorebookStyles.primaryButton}>Try again</Button>
      <a href="/" className="inline-flex min-h-11 items-center rounded-sm px-2 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">Back to setup</a>
    </ScorebookStatus>
  );
}

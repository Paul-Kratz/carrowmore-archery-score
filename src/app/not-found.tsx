/* eslint-disable @next/next/no-html-link-for-pages -- Recovery must work when client routing fails. */
import { ScorebookStatus } from "@/components/shared/ScorebookStatus";

export default function NotFound() {
  return (
    <ScorebookStatus title="Page not found" description="This page may have moved, or the link may be incomplete.">
      <a href="/" className="inline-flex min-h-11 items-center rounded-sm bg-primary px-4 text-sm font-semibold text-white hover:bg-(--deep-forest-green) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">Back to setup</a>
    </ScorebookStatus>
  );
}

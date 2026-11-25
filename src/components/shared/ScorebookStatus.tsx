"use client";

import type { ReactNode } from "react";
import { Theme } from "@radix-ui/themes";
import { oswald } from "@/fonts/oswald";
import { ForestLoader } from "./ForestLoader";
import { ScorebookHeader } from "./ScorebookHeader";
import { scorebookTheme } from "./scorebookTheme";

export function ScorebookStatus({ title, description, loadingLabel, children }: {
  title: string;
  description?: string;
  loadingLabel?: string;
  children?: ReactNode;
}) {
  return (
    <Theme accentColor="green" grayColor="olive" radius="small" panelBackground="solid" style={scorebookTheme} className="min-h-dvh bg-background text-foreground">
      <ScorebookHeader />
      <main className="mx-auto w-full max-w-2xl px-5 pt-10 pb-12 sm:px-8 sm:pt-16">
        {loadingLabel && <ForestLoader label={loadingLabel} size="md" className="mb-5" />}
        <h1 className={`${oswald.className} text-3xl leading-tight font-normal`}>{title}</h1>
        {description && <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}
        {children && <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div>}
      </main>
    </Theme>
  );
}

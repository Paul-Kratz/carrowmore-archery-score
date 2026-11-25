"use client";

import type { ReactNode } from "react";
import { Theme } from "@radix-ui/themes";
import { oswald } from "@/fonts/oswald";
import { ScorebookHeader } from "@/components/shared/ScorebookHeader";
import { scorebookTheme } from "@/components/shared/scorebookTheme";

export function AuthScreen({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Theme accentColor="green" grayColor="olive" radius="small" panelBackground="solid"
      style={scorebookTheme} className="flex min-h-[var(--app-viewport-height,100dvh)] flex-col bg-background text-foreground">
      <ScorebookHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-10 pb-10 sm:px-8 sm:pt-16 keyboard:pt-4">
        <div className="mx-auto w-full max-w-sm">
          <h1 className={`${oswald.className} text-4xl leading-tight font-normal`}>{title}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
          {children}
        </div>
      </main>
    </Theme>
  );
}

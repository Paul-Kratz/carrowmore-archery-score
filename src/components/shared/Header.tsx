"use client";

import { Button } from "@radix-ui/themes";
import { ArrowLeft, TreePine } from "lucide-react";

type HeaderProps = {
  onBack?: () => void;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  exitTrigger?: React.ReactNode;
};

export function Header({
  onBack,
  title,
  subtitle,
  showBackButton = true,
  exitTrigger,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-(--club-gold)/60 bg-[linear-gradient(135deg,var(--club-red-dark),var(--club-red))] text-primary-foreground shadow-lg">
      <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="h-10 w-10 p-0 text-white"
              size="3"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
          )}
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-(--club-gold)/70 bg-[rgba(18,52,38,0.45)]">
            <TreePine className="h-6 w-6 text-(--club-gold)" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-[#dfe9cb]">{subtitle}</p>}
          </div>
        </div>

        {exitTrigger}
      </div>
    </header>
  );
}

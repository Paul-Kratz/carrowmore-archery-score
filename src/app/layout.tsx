import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

import { QueryProvider } from "@/contexts/QueryContext";

export const metadata: Metadata = {
  title: "In The Forest",
  description: "Archery score app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-y-auto">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="antialiased min-h-full">
        <QueryProvider>
          <Theme accentColor="green">
            <SessionProvider>{children}</SessionProvider>
          </Theme>
        </QueryProvider>
      </body>
    </html>
  );
}

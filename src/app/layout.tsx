import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";

import { QueryProvider } from "@/contexts/QueryContext";

export const metadata: Metadata = {
  title: "In The Forest",
  description: "Archery score app",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
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
          <Theme accentColor="green" grayColor="sage" radius="medium">
            <SessionProvider>{children}</SessionProvider>
          </Theme>
        </QueryProvider>
      </body>
    </html>
  );
}

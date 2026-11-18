import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";

import { QueryProvider } from "@/contexts/QueryContext";
import { ShootProvider } from "@/contexts/ShootContext";

export const metadata: Metadata = {
  title: "In The Forest",
  description: "Archery score app",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icons/favicon-16.png?v=2", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png?v=2",
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
            <ShootProvider>
              <SessionProvider>{children}</SessionProvider>
            </ShootProvider>
          </Theme>
        </QueryProvider>
      </body>
    </html>
  );
}

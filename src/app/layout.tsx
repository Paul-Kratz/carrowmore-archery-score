import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { BowArrow } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen`}
      >
        <meta name="viewport" content="viewport-fit=cover"></meta>

        <SessionProvider>
          <div className="navbar bg-base-100 shadow-sm">
            <h3 className="text-default text-2xl font-bold flex flex-row gap-2 items-center">
              <BowArrow />
              In the forest
            </h3>
          </div>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

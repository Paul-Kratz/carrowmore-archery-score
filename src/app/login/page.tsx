import type { Metadata } from "next";
import { LoginPage } from "@/components/pages/login/LoginPage";

export const metadata: Metadata = { title: "Sign in · In the Forest" };

export default async function Page({ searchParams }: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  return <LoginPage callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined}
    error={typeof error === "string" ? error : undefined} />;
}

import type { Metadata } from "next";
import { CheckEmail } from "@/components/pages/login/CheckEmail";

export const metadata: Metadata = { title: "Check your email · In the Forest" };

export default async function Page({ searchParams }: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <CheckEmail callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined} />;
}

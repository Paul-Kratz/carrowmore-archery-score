"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { authErrorMessage, authPages, safeCallbackPath } from "@/lib/authPages";
import { LoginForm } from "./LoginForm";

export function LoginPage({
  callbackUrl,
  error,
}: {
  callbackUrl?: string;
  error?: string;
}) {
  const router = useRouter();
  const destination = () =>
    safeCallbackPath(callbackUrl, window.location.origin);

  const onGoogleLogin = async () => {
    await signIn("google", { redirectTo: destination() });
  };

  const onEmailLogin = async (email: string) => {
    const callbackPath = destination();
    const result = await signIn("resend", {
      email,
      redirect: false,
      redirectTo: callbackPath,
    });
    if (!result?.ok || result.error) {
      return {
        error: "We couldn’t send your sign-in link. Please try again.",
      };
    }
    router.replace(
      `${authPages.verifyRequest}?${new URLSearchParams({ callbackUrl: callbackPath })}`,
    );
  };
  return (
    <LoginForm
      initialError={authErrorMessage(error)}
      onGoogle={onGoogleLogin}
      onEmail={onEmailLogin}
    />
  );
}

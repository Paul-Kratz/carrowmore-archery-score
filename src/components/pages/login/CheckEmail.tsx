import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { loginHref } from "@/lib/authPages";
import { AuthScreen } from "./AuthScreen";

export function CheckEmail({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <AuthScreen title="Check your email" description="We’ve sent you a sign-in link. Open it to continue to your scorebook.">
      <div className="mt-8 border-y border-border py-5">
        <Mail aria-hidden="true" className="mb-3 h-6 w-6 text-primary" />
        <p className="text-sm leading-relaxed text-muted-foreground">Can’t find it? Check your spam folder, or try again with a different email address.</p>
      </div>
      <Link href={loginHref(callbackUrl)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to sign in
      </Link>
    </AuthScreen>
  );
}

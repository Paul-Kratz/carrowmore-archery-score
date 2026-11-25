export const authPages = {
  signIn: "/login",
  verifyRequest: "/login/check-email",
  error: "/login",
};

export function isPublicAuthPath(pathname: string) {
  return pathname === authPages.signIn || pathname === authPages.verifyRequest;
}

export function safeCallbackPath(value: string | undefined, origin: string) {
  if (!value) return "/";
  try {
    const url = new URL(value, origin);
    if (
      url.origin !== origin || url.username || url.password ||
      /^\/(login|gate|api\/auth)(\/|$)/.test(url.pathname)
    ) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function loginHref(callbackUrl?: string) {
  return callbackUrl
    ? `${authPages.signIn}?${new URLSearchParams({ callbackUrl })}`
    : authPages.signIn;
}

export function authErrorMessage(error?: string | null) {
  if (!error) return undefined;
  switch (error) {
    case "OAuthAccountNotLinked":
      return "This email already has an account. Please use the same sign-in method you used before.";
    case "Verification":
      return "That sign-in link has expired or has already been used. Please request a new one.";
    case "AccessDenied":
      return "Sign-in was cancelled or access was denied. Please try again.";
    case "Configuration":
      return "Sign-in is temporarily unavailable. Please try again later.";
    default:
      return "We couldn’t sign you in. Please try again.";
  }
}

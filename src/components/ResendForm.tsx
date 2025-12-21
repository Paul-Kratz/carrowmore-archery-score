"use client";
import { ROUTES } from "@/constants/routes";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function ResendForm() {
  const [emailAddress, setEmailAddress] = useState("");

  return (
    <div>
      <label
        htmlFor="email"
        className="block mb-2.5 text-sm font-medium text-heading"
      >
        Email Address
      </label>
      <input
        type="email"
        id="email"
        onChange={(e) => setEmailAddress(e.target.value)}
        className="border-2 h-[25px]"
      />
      <button
        onClick={() =>
          signIn("resend", { email: emailAddress, redirectTo: ROUTES.HOME })
        }
        className="button login"
      >
        Resend
      </button>
    </div>
  );
}

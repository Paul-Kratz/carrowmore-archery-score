"use client";
import { Button } from "@/components/Button";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import Profile from "@/components/Profile";
import ResendForm from "@/components/ResendForm";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data, status } = useSession();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full p-4 box-border">
      <div className="bg-white p-2.5 rounded-md w-full m-2.5 h-auto drop-shadow-2xl">
        {data ? (
          <div className="logged-in-section">
            <p className="text-black">✅ Successfully logged in!</p>
            <Profile />
            <LogoutButton />
          </div>
        ) : (
          <>
            <p className="text-black">
              Welcome! Please log in to access your protected content.
            </p>
            <ResendForm />
            <LoginButton />
          </>
        )}
      </div>
    </div>
  );
}

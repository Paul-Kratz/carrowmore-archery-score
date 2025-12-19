"use client";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import Profile from "@/components/Profile";
import ResendForm from "@/components/ResendForm";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data, status } = useSession();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full p-4 box-border">
      <div className="main-card-wrapper">
        <h1 className="text-5xl text-orange-500">Next.js</h1>

        <div className="action-card">
          {data ? (
            <div className="logged-in-section">
              <p className="logged-in-message">✅ Successfully logged in!</p>
              <Profile />
              <LogoutButton />
            </div>
          ) : (
            <>
              <p className="action-text">
                Welcome! Please log in to access your protected content.
              </p>
              <ResendForm />
              <LoginButton />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

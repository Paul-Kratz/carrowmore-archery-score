"use client";

import { useSession } from "next-auth/react";

export default function Profile() {
  const { data } = useSession();
  const user = data?.user;
  return (
    <div className="profile-card action-card">
      <h2 className="profile-name">{user?.name}</h2>
      <p className="profile-email">{user?.email}</p>
    </div>
  );
}

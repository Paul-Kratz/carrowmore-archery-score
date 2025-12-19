import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button onClick={() => signOut()} className="button logout">
      Log Out
    </button>
  );
}

"use client";
import { Target, CircleUserIcon, History } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Dock() {
  const pathname = usePathname();
  return (
    <div className="dock dock-lg bg-base-200">
      <Link href="/" className={pathname === "/" ? "dock-active" : ""}>
        <Target />
        <span className="dock-label">New Shoot</span>
      </Link>

      <Link
        href="/history"
        className={pathname === "/history" ? "dock-active" : ""}
      >
        <History />
        <span className="dock-label">History</span>
      </Link>

      <Link
        href="/account"
        className={pathname === "/account" ? "dock-active" : ""}
      >
        <CircleUserIcon />
        <span className="dock-label">Profile</span>
      </Link>
    </div>
  );
}

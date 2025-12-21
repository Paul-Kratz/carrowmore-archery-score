"use client";

import { useState } from "react";
import { ArcherySession } from "../../../generated/prisma/client";

export default function Protected() {
  const [session, setSession] = useState<ArcherySession | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const onClick = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/archerySession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "694515cd2702e65598d6c5f2",
          mode: "red",
          participantIds: ["69452579253047f0c4adcc27"],
        }),
      });

      // const response = await fetch(
      //   `/api/archerySession/${"69454dc18b2d4763f5f50611"}`
      // );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create session");
      }

      const sessionCreated = await response.json();
      setSession(sessionCreated);
      console.log(sessionCreated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onClick} disabled={loading}>
        {loading ? "Creating..." : "Create test session"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <code>{JSON.stringify(session)}</code>
    </div>
  );
}

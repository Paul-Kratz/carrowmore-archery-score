"use client";

import { redirect } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { ACTIVE_SHOOT_COOKIE } from "@/constants";
import { DoorClosed } from "lucide-react";

export const FinishShootButton = ({
  shootId,
  shootNotes,
  iconOnly = false,
}: {
  shootId: string;
  shootNotes: string | null;
  iconOnly?: boolean;
}) => {
  const [notes, setNotes] = useState(shootNotes);
  const [loading, setLoading] = useState(false);

  const finishShoot = async () => {
    setLoading(true);
    const result = await fetch("/api/shoot", {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        shootId,
        notes,
        completed: true,
      }),
    });
    if (result.status === 200) {
      Cookies.remove(ACTIVE_SHOOT_COOKIE);
      redirect("/");
    }
    setLoading(false);
  };
  return (
    <>
      {iconOnly ? (
        <button
          onClick={() =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (document.getElementById("finish_shoot_modal") as any)?.showModal()
          }
        >
          <DoorClosed /> Exit
        </button>
      ) : (
        <button
          className="btn btn-accent w-full"
          onClick={() =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (document.getElementById("finish_shoot_modal") as any)?.showModal()
          }
        >
          Finish Shoot
        </button>
      )}
      <dialog id="finish_shoot_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Finish Shoot</h3>
          <div className="my-4">
            Once completed you will not be able to edit this shoot. <br /> Do
            you want to leave any notes about todays shoot?
          </div>
          <textarea
            id="notes"
            className="textarea"
            placeholder="Notes..."
            value={notes ?? undefined}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>

          <div className="modal-action">
            <button className="btn btn-accent" onClick={finishShoot}>
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Finish"
              )}
            </button>
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

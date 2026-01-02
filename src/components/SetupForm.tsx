"use client";

import { Delete } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { ACTIVE_SHOOT_COOKIE } from "@/constants";
import { User } from "../../generated/prisma/client";
import { Mode } from "../../generated/prisma/enums";

const getUserLabel = (user: User, currentUserId: string) => {
  let label = user.name;

  if (!label) {
    label = user.email;
  }

  if (user.id === currentUserId) {
    label += " (you)";
  }

  return label;
};

export default function SetupForm({
  users,
  currentUser,
}: {
  users: User[] | undefined;
  currentUser: User;
}) {
  const [mode, setMode] = useState<Mode>(Mode.yellow);
  const [currentSelectOption, setCurrentSelectOption] =
    useState<string>("default");
  const [participants, setParticipants] = useState<User[]>([]);

  const addUser = () => {
    const newParticipant = users?.find((u) => u.id === currentSelectOption);
    if (!newParticipant) {
      return;
    }
    setParticipants([...participants, newParticipant]);
    setCurrentSelectOption("default");
  };
  const removeUser = (id: string) => {
    const updatedParticipants = participants.filter((p) => p.id !== id);
    setParticipants(updatedParticipants);
  };
  const createNewShoot = async () => {
    const body = {
      userId: currentUser.id,
      mode,
      participantIds: participants.map((p) => p.id),
    };

    const response = await fetch("/api/shoot", {
      method: "post",
      body: JSON.stringify(body),
    });

    const newShoot = await response.json();

    Cookies.set(ACTIVE_SHOOT_COOKIE, newShoot.id);

    redirect("/shoot/1");
  };
  return (
    <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-sm border p-4">
      <label className="label text-sm">Which pegs are you shooting from?</label>

      <div className="join">
        <input
          className={`join-item btn ${mode === Mode.yellow && "btn-warning"}`}
          type="radio"
          name="yellow"
          checked={mode === Mode.yellow}
          aria-label="Yellow"
          onChange={() => setMode(Mode.yellow)}
        />
        <input
          className={`join-item btn ${mode === Mode.red && "btn-error"}`}
          type="radio"
          name="red"
          checked={mode === Mode.red}
          aria-label="Red"
          onChange={() => setMode(Mode.red)}
        />
      </div>
      <div className="divider my-2"></div>

      <label className="label text-sm">Who is with you today?</label>
      <ul className="list">
        {participants.map((p, i) => (
          <li
            key={p.id}
            className="list-row flex flex-row items-center justify-between px-0 py-2 rounded-sm"
          >
            <div className="flex flex-row items-center gap-2">
              <div className="text-lg font-thin tabular-nums">{i + 1}.</div>
              {getUserLabel(p, currentUser.id)}
            </div>
            <button
              className="btn btn-square btn-ghost"
              onClick={() => removeUser(p.id)}
            >
              <Delete className="text-error" />
            </button>
          </li>
        ))}
      </ul>
      <div className="join">
        <select
          className="select join-item"
          value={currentSelectOption}
          onChange={(e) => setCurrentSelectOption(e.target.value)}
        >
          <option disabled={true} value="default">
            Pick a user
          </option>

          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {getUserLabel(user, currentUser.id)}
            </option>
          ))}
        </select>
        <button className="btn join-item" onClick={addUser}>
          Add
        </button>
      </div>

      <button
        className="btn btn-accent"
        onClick={createNewShoot}
        disabled={participants.length < 1}
      >
        Start Shoot
      </button>
    </fieldset>
  );
}

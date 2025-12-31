import { FinishShootButton } from "@/components/FinishShootButton";
import { Pagination } from "@/components/Pagination";
import { RoundCard } from "@/components/RoundCard";
import { ACTIVE_SHOOT_COOKIE, TARGET_NAMES } from "@/constants";
import { getShoot } from "@/functions/getShoot";
import { auth } from "@/lib/auth";
import { ChartColumn, MenuIcon, UserPlus2 } from "lucide-react";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

export default async function Session({
  params,
}: {
  params: { shootId: string; roundNumber: number };
}) {
  const cookieStore = await cookies();
  const shootId = cookieStore.get(ACTIVE_SHOOT_COOKIE)?.value;

  const { roundNumber } = await params; // Get shoot id from route
  const authData = await auth(); // Check auth data for current user id

  if (!shootId) {
    redirect("/"); // TODO add an error
  }

  const roundNum = Number(roundNumber); // parse roundNumber as number

  if (roundNum < 1 || roundNum > 18) {
    redirect(`shoot/1`); // if invalid route param passed then go back to first round page
  }

  // Get the shoot data
  const shootData = await getShoot({
    shootId,
    roundNumber: roundNum,
  });

  if (shootData?.error) {
    //handle error by sending to home screen with error message.
    redirect("/"); // TODO
  }

  // Return to home screen if shoot not found or current user not part of shoot
  // TODO add an error
  if (
    !shootData ||
    !shootData.participants?.some((p) => p.userId === authData?.user?.id)
  ) {
    redirect("/", RedirectType.push);
  }

  const nextPage = roundNum + 1 <= 18 ? `/shoot/${roundNum + 1}` : null;
  const prevPage = roundNum - 1 > 0 ? `/shoot/${roundNum - 1}` : null;

  return (
    <div className="my-2.5 mx-4 gap-2.5 flex flex-col h-full">
      <div className="pb-18">
        <div className="flex justify-between items-center">
          <span className="text-rotate text-lg">
            <span className="justify-items-center">
              <span>Shoot mode: {shootData?.shoot.mode}</span>
              <span>Target: {TARGET_NAMES[roundNum]}</span>
            </span>
          </span>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost m-1">
              <MenuIcon />
            </div>
            <ul
              tabIndex={-1}
              className="dropdown-content menu bg-base-100 border-base-300 border-2 rounded-box z-1 w-52 p-2 shadow-sm"
            >
              <li>
                <a>
                  <ChartColumn /> Stats
                </a>
              </li>
              <li>
                <a>
                  <UserPlus2 /> Add Participant
                </a>
              </li>
              <li>
                <FinishShootButton
                  shootId={shootId}
                  shootNotes={shootData.shoot?.notes}
                  iconOnly
                />
              </li>
            </ul>
          </div>
        </div>
        {shootData?.participants.map((p) => (
          <RoundCard
            user={p.user}
            roundNumber={Number(roundNumber)}
            shootId={shootId}
            key={p.userId}
            total={p.totalScore}
            round={p.thisRoundScore}
          />
        ))}
      </div>
      <div className="flex items-center z-10 justify-between fixed bottom-0 left-4 right-4 p-4">
        {roundNum === 18 ? (
          <FinishShootButton
            shootId={shootId}
            shootNotes={shootData.shoot?.notes}
          />
        ) : (
          <Pagination
            nextPage={nextPage}
            prevPage={prevPage}
            roundNum={roundNum}
          />
        )}
      </div>
    </div>
  );
}

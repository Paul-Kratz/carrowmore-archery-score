import { useShootContext } from "@/contexts/ShootContext";
import { Checkbox } from "@radix-ui/themes";

export const ShowScoresToggle = () => {
  const { showScores, setShowScores } = useShootContext();
  return (
    <div
      className="flex min-h-10 w-full cursor-pointer items-center gap-3 text-sm font-bold text-(--deep-forest-green)"
      onClick={() => setShowScores(!showScores)}
    >
      <Checkbox checked={showScores} size="3" />
      <span>Show Scores</span>
    </div>
  );
};

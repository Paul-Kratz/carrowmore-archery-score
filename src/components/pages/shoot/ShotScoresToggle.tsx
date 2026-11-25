import { useShootContext } from "@/contexts/ShootContext";
import { Checkbox } from "@radix-ui/themes";

export const ShowScoresToggle = () => {
  const { showScores, setShowScores } = useShootContext();
  return (
    <label className="flex min-h-11 w-full cursor-pointer items-center gap-3 text-sm font-semibold text-(--deep-forest-green)">
      <Checkbox highContrast checked={showScores} onCheckedChange={(checked) => setShowScores(checked === true)} size="3" />
      <span>Show Scores</span>
    </label>
  );
};

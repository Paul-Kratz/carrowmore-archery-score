import { cva } from "class-variance-authority";

const scoringButton = cva(["btn", "btn-square", "join-item"], {
  variants: {
    active: {
      true: "btn-neutral",
      false: null,
    },
  },
});

const scoringTable = [
  [20, 16],
  [14, 10],
  [8, 4],
];

export const ScoringButtonGroup = ({
  roundScore,
  handleSetScore,
}: {
  roundScore: number | null;
  handleSetScore: (value: number) => void;
}) => {
  return (
    <>
      {scoringTable.map((scoreGroup) => (
        <div className="join join-vertical" key={scoreGroup.toString()}>
          <button
            className={scoringButton({
              active: roundScore === scoreGroup[0],
            })}
            onClick={() => handleSetScore(scoreGroup[0])}
          >
            {scoreGroup[0]}
          </button>
          <button
            className={scoringButton({
              active: roundScore === scoreGroup[1],
            })}
            onClick={() => handleSetScore(scoreGroup[1])}
          >
            {scoreGroup[1]}
          </button>
        </div>
      ))}
      <div className="flex items-center flex-col justify-end">
        <span className="label">Miss</span>

        <button
          className={scoringButton({
            active: roundScore === 0,
          })}
          onClick={() => handleSetScore(0)}
        >
          <span className="font-thin tabular-nums">X</span>
        </button>
      </div>
    </>
  );
};

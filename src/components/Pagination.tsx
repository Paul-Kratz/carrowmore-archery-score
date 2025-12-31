import { ArrowLeftSquare, ArrowRightSquare } from "lucide-react";
import Link from "next/link";

export const Pagination = ({
  nextPage,
  prevPage,
  roundNum,
}: {
  nextPage: string | null;
  prevPage: string | null;
  roundNum: number;
}) => {
  return (
    <>
      <Link
        href={prevPage || ""}
        className={`btn btn-ghost ${prevPage === null && "btn-disabled"}`}
        aria-disabled={prevPage === null}
        prefetch
      >
        <ArrowLeftSquare />
      </Link>
      <span>Round {roundNum} of 18</span>
      <Link
        href={nextPage || ""}
        className={`btn btn-ghost ${nextPage === null && "btn-disabled"}`}
        aria-disabled={nextPage === null}
        prefetch
      >
        <ArrowRightSquare />
      </Link>
    </>
  );
};

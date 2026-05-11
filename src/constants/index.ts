import { ClubData } from "@/models";
import { carrowmoreArcheryClub } from "./carrowmore_club";
import { marbleArchersClub } from "./marble_archers_club";

export const ACTIVE_SHOOT_COOKIE = "active_shoot";

export const CLUBS: Record<string, ClubData> = {
  carrowmore: carrowmoreArcheryClub,
  marbleArchers: marbleArchersClub,
};

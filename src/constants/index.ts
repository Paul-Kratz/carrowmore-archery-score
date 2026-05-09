import { ClubData } from "@/models";
import { carrowmoreArcheryClub } from "./carrowmore_club";

export const ACTIVE_SHOOT_COOKIE = "active_shoot";

export const CLUBS: Record<string, ClubData> = {
  carrowmore: carrowmoreArcheryClub,
};

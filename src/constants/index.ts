import { ClubData } from "@/models";
import { carrowmoreArcheryClub } from "./carrowmore_club";
import { marbleArchersClub } from "./marble_archers_club";

export const ACTIVE_SHOOT_COOKIE = "active_shoot";
export const DEFAULT_PEG_COLOR = "yellow";

export const COLOUR_MAPPINGS: Record<string, string> = {
  yellow: "#FFC72C",
  red: "#C6011F",
  blue: "#0000CD",
  black: "#111111",
};

export const getClubPegColors = (clubData?: ClubData) => {
  if (!clubData) {
    return [DEFAULT_PEG_COLOR];
  }

  return clubData.pegColors.length > 0
    ? clubData.pegColors
    : [DEFAULT_PEG_COLOR];
};

export const getPegColorHex = (pegColor?: string | null) =>
  COLOUR_MAPPINGS[pegColor ?? ""] ?? COLOUR_MAPPINGS[DEFAULT_PEG_COLOR];

export const getPegColorLabel = (pegColor?: string | null) => {
  if (!pegColor) {
    return DEFAULT_PEG_COLOR;
  }

  return pegColor.charAt(0).toUpperCase() + pegColor.slice(1);
};

export const CLUBS: Record<string, ClubData> = {
  carrowmore: carrowmoreArcheryClub,
  marbleArchers: marbleArchersClub,
};

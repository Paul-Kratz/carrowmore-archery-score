import { CLUBS } from "@/constants";

// Only accept numbers between 1 and the total number of stations for the club
export const validRoundNumber = (roundNumber: number, clubId: string) => {
  return roundNumber > 0 && roundNumber <= CLUBS?.[clubId]?.totalStations;
};

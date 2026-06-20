export type ClubData = {
  id: string;
  name: string;
  totalStations: number;
  pegColors: string[];
  scoringRows: readonly {
    label: string;
    peg?: string;
    scores: readonly {
      score: number;
      result: string;
    }[];
  }[];
};

export * from "./denormalized";

export interface IUser {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  isGuest?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ShootParticipantInput = {
  userId?: string;
  guestName?: string;
  pegColor?: string;
};

export interface IShootChartData {
  id: string;
  clubId: string;
  createdAt: string;
  completed: boolean;
  totalStations: number;
  participant: {
    id: string;
    user?: string | IUser | null;
    pegColor?: string | null;
    totalScore: number;
    scoredCount: number;
    scores: {
      id: string;
      roundNumber: number;
      score: number | null;
      scoredAt?: string | null;
    }[];
  };
}

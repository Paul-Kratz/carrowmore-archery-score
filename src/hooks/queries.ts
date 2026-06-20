import { queryClient } from "@/lib/queryClient";
import { IShootDenormalized } from "@/models";
import { useMutation, useQuery } from "@tanstack/react-query";

class ScoreUpdateError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

export const useGetShoot = (shootId: string) => {
  return useQuery({
    queryKey: ["shoot", shootId],
    queryFn: async () => {
      const response = await fetch(`/api/shoot/${shootId}`);
      if (!response.ok) {
        throw new Error("Error retrieving shoot data");
      }
      return response.json();
    },
    enabled: !!shootId,
    staleTime: 5000,
  });
};

export const useUpdateShoot = () => {
  return useMutation({
    mutationFn: async ({
      shootId,
      notes,
      completed,
    }: {
      shootId: string;
      notes?: string;
      completed?: boolean;
    }) => {
      const response = await fetch(`/api/shoot`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shootId, notes, completed }),
      });
      if (!response.ok) {
        throw new Error("Error updating shoot data");
      }
      return response;
    },
  });
};

export const useUpdateScore = () => {
  type UpdateScoreInput = {
    shootId: string;
    participantId: string;
    roundNumber: number;
    score: number | null;
  };

  return useMutation({
    mutationKey: ["updateScore"],
    mutationFn: async ({
      shootId,
      participantId,
      roundNumber,
      score,
    }: UpdateScoreInput) => {
      const response = await fetch(`/api/roundScore`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shootId, participantId, roundNumber, score }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body && typeof body === "object" && "error" in body
            ? String(body.error)
            : "Error updating round score";

        throw new ScoreUpdateError(message, response.status);
      }
      return response.json() as Promise<IShootDenormalized>;
    },
    retry: (failureCount, error) => {
      if (failureCount >= 3) {
        return false;
      }

      return (
        !(error instanceof ScoreUpdateError) ||
        !error.status ||
        error.status >= 500
      );
    },
    retryDelay: (failureCount) => Math.min(1000 * 2 ** failureCount, 5000),
    onMutate: async ({ shootId, participantId, roundNumber, score }) => {
      await queryClient.cancelQueries({ queryKey: ["shoot", shootId] });

      const previousShoot = queryClient.getQueryData<IShootDenormalized>([
        "shoot",
        shootId,
      ]);
      const scoredAt = score === null ? null : new Date();

      queryClient.setQueryData<IShootDenormalized>(
        ["shoot", shootId],
        (currentShoot) => {
          if (!currentShoot) {
            return currentShoot;
          }

          return {
            ...currentShoot,
            firstScoredAt:
              currentShoot.firstScoredAt ??
              scoredAt ??
              currentShoot.firstScoredAt,
            participants: currentShoot.participants.map((participant) => {
              if (participant.id !== participantId) {
                return participant;
              }

              const nextScores = participant.scores.map((roundScore) =>
                roundScore.roundNumber === roundNumber
                  ? { ...roundScore, score, scoredAt }
                  : roundScore,
              );
              const nextTotalScore = nextScores.reduce<number>(
                (total, roundScore) => total + (roundScore.score ?? 0),
                0,
              );
              const nextScoredCount = nextScores.filter(
                (roundScore) => roundScore.score !== null,
              ).length;

              return {
                ...participant,
                scores: nextScores,
                totalScore: nextTotalScore,
                scoredCount: nextScoredCount,
              };
            }),
            scoredCount: currentShoot.participants.reduce(
              (total, participant) =>
                total +
                (participant.id === participantId
                  ? participant.scores.filter((roundScore) =>
                      roundScore.roundNumber === roundNumber
                        ? score !== null
                        : roundScore.score !== null,
                    ).length
                  : participant.scoredCount),
              0,
            ),
          };
        },
      );

      return { previousShoot };
    },
    onError: (_error, variables, context) => {
      if (context?.previousShoot) {
        queryClient.setQueryData(
          ["shoot", variables.shootId],
          context.previousShoot,
        );
      }
    },
    onSuccess: (shoot, variables) => {
      queryClient.setQueryData(["shoot", variables.shootId], shoot);
    },
  });
};

export const useUpdateUsername = () => {
  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const response = await fetch(`/api/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Error updating username");
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      return response;
    },
  });
};

export function useDeleteShoot() {
  return useMutation({
    mutationFn: async (shootId: string) => {
      const response = await fetch(`/api/shoot?shootId=${shootId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error deleting shoot");
      }
      await queryClient.invalidateQueries({ queryKey: ["participatedShoots"] });
      return response;
    },
  });
}

export function useGetParticipatedShoots(currentUserId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ["participatedShoots"],
    queryFn: async () => {
      const response = await fetch("/api/shoot/participated");
      if (!response.ok) {
        throw new Error("Error retrieving participated shoots");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return { participatedShoots: [], trackedShoots: [], isLoading: true };
  }

  const shoots = data as IShootDenormalized[];
  const participatedShoots = shoots.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const trackedShoots = participatedShoots.filter(
    (s) => s.createdBy.toString() === currentUserId,
  );

  return { participatedShoots, trackedShoots, isLoading: false };
}

export const useVerifyAccessCode = () => {
  return useMutation({
    mutationFn: async ({ accessCode }: { accessCode: string }) => {
      const response = await fetch(`/api/verifyAccessCode?code=${accessCode}`);
      if (!response.ok) {
        throw new Error("Invalid access code");
      }
      return response.json();
    },
  });
};

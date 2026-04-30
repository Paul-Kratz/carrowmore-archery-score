import { queryClient } from "@/lib/queryClient";
import { IShootWithParticipants } from "@/models";
import { useMutation, useQuery } from "@tanstack/react-query";

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
        throw new Error("Error updating round score");
      }
      return response;
    },
    onMutate: async ({ shootId, participantId, roundNumber, score }) => {
      await queryClient.cancelQueries({ queryKey: ["shoot", shootId] });

      const previousShoot =
        queryClient.getQueryData<IShootWithParticipants>(["shoot", shootId]);

      queryClient.setQueryData<IShootWithParticipants>(
        ["shoot", shootId],
        (currentShoot) => {
          if (!currentShoot) {
            return currentShoot;
          }

          return {
            ...currentShoot,
            participants: currentShoot.participants.map((participant) => {
              if (participant.id !== participantId) {
                return participant;
              }

              const nextRoundScores = [...participant.roundScores];
              nextRoundScores[roundNumber - 1] = score;
              const nextTotalScore = nextRoundScores.reduce<number>(
                (total, roundScore) => total + (roundScore ?? 0),
                0,
              );

              return {
                ...participant,
                roundScores: nextRoundScores,
                totalScore: nextTotalScore,
              };
            }),
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
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shoot", variables.shootId] });
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

  const shoots = data as IShootWithParticipants[];
  const participatedShoots = shoots.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const trackedShoots = participatedShoots.filter(
    (s) => s.createdBy === currentUserId,
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

import { queryClient } from "@/lib/queryClient";
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
  return useMutation({
    mutationFn: async ({
      shootId,
      userId,
      roundNumber,
      score,
    }: {
      shootId: string;
      userId: string;
      roundNumber: number;
      score: number | null;
    }) => {
      const response = await fetch(`/api/roundScore`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shootId, userId, roundNumber, score }),
      });
      if (!response.ok) {
        throw new Error("Error updating round score");
      }
      queryClient.invalidateQueries({ queryKey: ["shoot", shootId] });
      return response;
    },
  });
};

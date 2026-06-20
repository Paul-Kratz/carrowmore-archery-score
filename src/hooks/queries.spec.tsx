import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { queryClient } from "@/lib/queryClient";
import { useGetShoot, useUpdateScore } from "./queries";

const shootId = "shoot-1";
const participantId = "participant-1";

const initialShoot = {
  id: shootId,
  scoredCount: 0,
  totalScoreSlots: 2,
  participants: [
    {
      id: participantId,
      scores: [{ roundNumber: 1, score: null, scoredAt: null }],
      totalScore: 0,
      scoredCount: 0,
    },
  ],
};

const updatedShoot = {
  ...initialShoot,
  scoredCount: 1,
  participants: [
    {
      ...initialShoot.participants[0],
      scores: [{ roundNumber: 1, score: 20, scoredAt: "2026-01-01" }],
      totalScore: 20,
      scoredCount: 1,
    },
  ],
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("shoot queries", () => {
  beforeEach(() => {
    queryClient.clear();
    global.fetch = jest.fn(async (url) => {
      if (url === `/api/shoot/${shootId}`) {
        return new Response(JSON.stringify(initialShoot));
      }

      if (url === "/api/roundScore") {
        return new Response(JSON.stringify(updatedShoot));
      }

      throw new Error(`Unexpected fetch: ${url}`);
    }) as typeof fetch;
  });

  it("uses the score update response instead of refetching the shoot", async () => {
    const { result, unmount } = renderHook(
      () => ({
        shoot: useGetShoot(shootId),
        updateScore: useUpdateScore(),
      }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.shoot.data).toEqual(initialShoot),
    );

    await act(async () => {
      await result.current.updateScore.mutateAsync({
        shootId,
        participantId,
        roundNumber: 1,
        score: 20,
      });
    });

    await waitFor(() =>
      expect(queryClient.getQueryData(["shoot", shootId])).toEqual(
        updatedShoot,
      ),
    );

    unmount();

    const remounted = renderHook(() => useGetShoot(shootId), { wrapper });

    await waitFor(() =>
      expect(remounted.result.current.data).toEqual(updatedShoot),
    );

    const shootFetches = (global.fetch as jest.Mock).mock.calls.filter(
      ([url]) => url === `/api/shoot/${shootId}`,
    );

    expect(shootFetches).toHaveLength(1);
  });
});

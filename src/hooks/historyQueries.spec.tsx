import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useGetParticipatedShoots } from "./queries";
import { createTestShootData } from "@/testFixtures/shoot";

it("returns a recoverable error when no history data was loaded, then retries successfully", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const originalFetch = global.fetch;
  const fetchMock = jest.fn()
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({ ok: true, json: async () => [createTestShootData()] });
  global.fetch = fetchMock;
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  try {
    const { result, unmount } = renderHook(() => useGetParticipatedShoots("user-1"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.participatedShoots).toEqual([]);
    expect(result.current.trackedShoots).toEqual([]);
    await act(async () => { await result.current.refetch(); });
    await waitFor(() => expect(result.current.participatedShoots).toHaveLength(1));
    expect(result.current.isError).toBe(false);
    expect(result.current.trackedShoots).toHaveLength(1);
    unmount();
  } finally {
    global.fetch = originalFetch;
    client.clear();
  }
});

it.each([true, false])("refreshes history only after a successful deletion (success=%s)", async (success) => {
  const { queryClient } = await import("@/lib/queryClient");
  const { useDeleteShoot } = await import("./queries");
  queryClient.clear();
  const originalFetch = global.fetch;
  let shoots = [createTestShootData()];
  const fetchMock = jest.fn(async (url: string, options?: RequestInit) => {
    if (options?.method === "DELETE") {
      expect(url).toBe("/api/shoot?shootId=shoot-1");
      if (success) shoots = [];
      return { ok: success };
    }
    expect(url).toBe("/api/shoot/participated");
    return { ok: true, json: async () => shoots };
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  try {
    const { result, unmount } = renderHook(() => ({
      history: useGetParticipatedShoots("user-1"),
      deletion: useDeleteShoot(),
    }), { wrapper });
    await waitFor(() => expect(result.current.history.trackedShoots).toHaveLength(1));
    await act(async () => {
      if (success) await result.current.deletion.mutateAsync("shoot-1");
      else await expect(result.current.deletion.mutateAsync("shoot-1")).rejects.toThrow("Error deleting shoot");
    });
    await waitFor(() => expect(result.current.history.trackedShoots).toHaveLength(success ? 0 : 1));
    expect(fetchMock).toHaveBeenCalledTimes(success ? 3 : 2);
    unmount();
  } finally {
    global.fetch = originalFetch;
    queryClient.clear();
  }
});

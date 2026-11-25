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

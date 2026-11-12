import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Plant } from "@/lib/inventory";
import { createSupabaseGardenRepo } from "@/lib/repo/supabase";

const basil: Plant = {
  id: "plant-1",
  name: "Basil",
  species: "Ocimum basilicum",
  imageKey: "basil",
  location: "Kitchen",
  lastWatered: "2026-11-12",
  waterEveryDays: 2,
  sunlight: "Full Sun",
  lastFertilized: "2026-11-01",
  fertilizeEveryDays: 21,
  health: "Healthy",
};

function createTestRepo(rows: Record<string, unknown>[]) {
  const requests: { url: URL; init?: RequestInit }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    requests.push(init ? { url, init } : { url });
    if (init?.method === "GET") {
      return new Response(JSON.stringify(rows[0] ?? null), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(null, { status: 204 });
  };
  const client = createClient("https://example.supabase.co", "test-publishable-key", {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { fetch: fetcher },
  });

  return { repo: createSupabaseGardenRepo(client), requests };
}

describe("Supabase garden repository", () => {
  it("loads a user's garden and scopes the query to that user", async () => {
    const plants = [{ id: "plant-1", name: "Basil" }];
    const { repo, requests } = createTestRepo([
      { plants, tasks: [], profile: null, planner_bed: null },
    ]);

    await expect(repo.load("user-1")).resolves.toEqual({ plants, tasks: [], profile: null });
    expect(requests[0]?.url.pathname).toBe("/rest/v1/user_gardens");
    expect(requests[0]?.url.searchParams.get("user_id")).toBe("eq.user-1");
  });

  it("upserts user-owned plants without overwriting other garden fields", async () => {
    const { repo, requests } = createTestRepo([]);
    const plants = [basil];

    await repo.savePlants("user-1", plants);

    expect(requests[0]?.url.searchParams.get("on_conflict")).toBe("user_id");
    expect(JSON.parse(String(requests[0]?.init?.body))).toEqual({
      user_id: "user-1",
      plants,
    });
  });

  it("deletes only the selected plant from that user's saved list", async () => {
    const plants = [
      { ...basil, id: "keep" },
      { ...basil, id: "remove", name: "Mint" },
    ];
    const { repo, requests } = createTestRepo([
      { plants, tasks: [], profile: null, planner_bed: null },
    ]);

    await repo.deletePlant("user-1", "remove");

    expect(requests).toHaveLength(2);
    expect(JSON.parse(String(requests[1]?.init?.body))).toEqual({
      user_id: "user-1",
      plants: [{ ...basil, id: "keep" }],
    });
  });

  it("moves an existing local garden into Supabase on the first load", async () => {
    const userId = `migration-${crypto.randomUUID()}`;
    window.localStorage.setItem(
      `sowistry:garden:${userId}`,
      JSON.stringify({ plants: [basil], tasks: [], profile: null }),
    );
    const { repo, requests } = createTestRepo([]);

    try {
      await expect(repo.load(userId)).resolves.toEqual({
        plants: [basil],
        tasks: [],
        profile: null,
      });
      expect(JSON.parse(String(requests[1]?.init?.body))).toEqual({
        user_id: userId,
        plants: [basil],
        tasks: [],
        profile: null,
      });
    } finally {
      window.localStorage.removeItem(`sowistry:garden:${userId}`);
    }
  });

  it("surfaces database errors instead of claiming writes succeeded", async () => {
    const fetcher: typeof fetch = async () =>
      new Response(JSON.stringify({ message: "table missing" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    const client = createClient("https://example.supabase.co", "test-publishable-key", {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { fetch: fetcher },
    });

    await expect(createSupabaseGardenRepo(client).saveTasks("user-1", [])).rejects.toThrow();
  });
});

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Database } from "@/integrations/supabase/types";
import type { Plant } from "@/lib/inventory";
import { createSupabaseGardenRepo, createSupabaseNewsletterRepo } from "@/lib/repo/supabase";
import type { Task } from "@/lib/tasks";

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

const basilRow = {
  user_id: "user-1",
  id: "plant-1",
  name: "Basil",
  species: "Ocimum basilicum",
  image_key: "basil",
  location: "Kitchen",
  last_watered: "2026-11-12",
  water_every_days: 2,
  sunlight: "Full Sun",
  last_fertilized: "2026-11-01",
  fertilize_every_days: 21,
  health: "Healthy",
};

type Req = { method: string; url: URL; body: unknown };

/** A fake Supabase REST endpoint: GETs return the given rows per table, writes succeed. */
function createTestClient(tables: Record<string, unknown[]> = {}, status = 200) {
  const requests: Req[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    const method = init?.method ?? "GET";
    requests.push({ method, url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (status >= 400) {
      return new Response(JSON.stringify({ message: "failed", code: "XX000" }), {
        status,
        headers: { "content-type": "application/json" },
      });
    }
    if (method === "GET") {
      const rows = tables[url.pathname.replace("/rest/v1/", "")] ?? [];
      const single = (init?.headers as Record<string, string> | undefined)?.["Accept"] === "application/vnd.pgrst.object+json";
      return new Response(JSON.stringify(single ? (rows[0] ?? null) : rows), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(null, { status: 201 });
  };
  const client = createClient<Database>("https://example.supabase.co", "test-publishable-key", {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { fetch: fetcher },
  });
  return { client, requests };
}

describe("Supabase garden repository", () => {
  it("loads only the signed-in user's plants, tasks and profile", async () => {
    const { client, requests } = createTestClient({ plants: [basilRow] });
    const garden = await createSupabaseGardenRepo(client).load("user-1");

    expect(garden.plants).toEqual([basil]);
    const paths = requests.map((r) => `${r.url.pathname}?${r.url.searchParams.get("user_id") ?? r.url.searchParams.get("id")}`);
    expect(paths).toEqual(
      expect.arrayContaining(["/rest/v1/profiles?eq.user-1", "/rest/v1/plants?eq.user-1", "/rest/v1/tasks?eq.user-1"]),
    );
  });

  it("saves one plant as a single-row upsert, leaving the user's other plants alone", async () => {
    const { client, requests } = createTestClient();
    await createSupabaseGardenRepo(client).savePlants("user-1", [basil]);

    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url.searchParams.get("on_conflict")).toBe("user_id,id");
    expect(requests[0]?.body).toEqual([basilRow]);
  });

  it("deletes exactly one plant belonging to that user", async () => {
    const { client, requests } = createTestClient();
    await createSupabaseGardenRepo(client).deletePlant("user-1", "plant-1");

    expect(requests[0]?.method).toBe("DELETE");
    expect(requests[0]?.url.searchParams.get("user_id")).toBe("eq.user-1");
    expect(requests[0]?.url.searchParams.get("id")).toBe("eq.plant-1");
  });

  it("stores optional task fields as empty values rather than dropping the task", async () => {
    const task: Task = { id: "t1", title: "Water basil", type: "water", due: "2026-11-13", done: false };
    const { client, requests } = createTestClient();
    await createSupabaseGardenRepo(client).saveTasks("user-1", [task]);

    expect(requests[0]?.body).toEqual([
      { user_id: "user-1", id: "t1", title: "Water basil", type: "water", due: "2026-11-13", time: null, image_key: null, plant_id: null, done: false },
    ]);
  });

  it("moves a preview-mode garden on this device into the account on first load", async () => {
    const userId = `migration-${crypto.randomUUID()}`;
    window.localStorage.setItem(`sowistry:garden:${userId}`, JSON.stringify({ plants: [basil], tasks: [], profile: null }));
    const { client, requests } = createTestClient();
    try {
      const garden = await createSupabaseGardenRepo(client).load(userId);
      expect(garden.plants).toEqual([basil]);
      const write = requests.find((r) => r.method === "POST");
      expect(write?.url.pathname).toBe("/rest/v1/plants");
      expect(write?.body).toEqual([{ ...basilRow, user_id: userId }]);
    } finally {
      window.localStorage.removeItem(`sowistry:garden:${userId}`);
    }
  });

  it("surfaces database errors instead of claiming writes succeeded", async () => {
    const { client } = createTestClient({}, 500);
    await expect(createSupabaseGardenRepo(client).savePlants("user-1", [basil])).rejects.toThrow();
  });
});

describe("Supabase newsletter sign-ups", () => {
  it("adds the email to the list", async () => {
    const { client, requests } = createTestClient();
    await expect(createSupabaseNewsletterRepo(client).subscribe("grow@example.com")).resolves.toBe("subscribed");
    expect(requests[0]?.url.pathname).toBe("/rest/v1/newsletter_subscribers");
    expect(requests[0]?.body).toEqual({ email: "grow@example.com" });
  });
});

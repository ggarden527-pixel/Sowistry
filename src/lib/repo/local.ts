import type { Plant } from "../inventory";
import type { Task } from "../tasks";
import type { GardenRepository, GardenSnapshot, NewsletterRepository, PlannerBed, Profile } from "./types";

const gardenKey = (userId: string) => `sowistry:garden:${userId}`;
const bedKey = (userId: string) => `sowistry:bed:${userId}`;

function readGarden(userId: string): GardenSnapshot {
  try {
    const raw = window.localStorage.getItem(gardenKey(userId));
    if (raw) {
      const saved = JSON.parse(raw) as Partial<GardenSnapshot>;
      return { plants: saved.plants ?? [], tasks: saved.tasks ?? [], profile: saved.profile ?? null };
    }
  } catch {
    /* corrupt storage: start fresh */
  }
  return { plants: [], tasks: [], profile: null };
}

function writeGarden(userId: string, update: (g: GardenSnapshot) => GardenSnapshot) {
  window.localStorage.setItem(gardenKey(userId), JSON.stringify(update(readGarden(userId))));
}

function upsert<T extends { id: string }>(list: T[], rows: T[]): T[] {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const kept = list.map((item) => byId.get(item.id) ?? item);
  const existing = new Set(list.map((i) => i.id));
  return [...rows.filter((r) => !existing.has(r.id)), ...kept];
}

/** Browser-storage garden, keyed by user id. Used until the Supabase project is connected. */
export const localGardenRepo: GardenRepository = {
  load: async (userId) => readGarden(userId),
  async savePlants(userId, plants: Plant[]) {
    writeGarden(userId, (g) => ({ ...g, plants: upsert(g.plants, plants) }));
  },
  async deletePlant(userId, plantId) {
    writeGarden(userId, (g) => ({ ...g, plants: g.plants.filter((p) => p.id !== plantId) }));
  },
  async saveTasks(userId, tasks: Task[]) {
    writeGarden(userId, (g) => ({ ...g, tasks: upsert(g.tasks, tasks) }));
  },
  async saveProfile(userId, profile: Profile) {
    writeGarden(userId, (g) => ({ ...g, profile }));
  },
  async loadBed(userId) {
    try {
      const raw = window.localStorage.getItem(bedKey(userId));
      return raw ? (JSON.parse(raw) as PlannerBed) : null;
    } catch {
      return null;
    }
  },
  async saveBed(userId, bed) {
    window.localStorage.setItem(bedKey(userId), JSON.stringify(bed));
  },
};

export const localNewsletterRepo: NewsletterRepository = {
  subscribe: async () => "unavailable",
};

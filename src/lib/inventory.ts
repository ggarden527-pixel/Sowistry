import { addDaysISO, daysFrom } from "./dates";

export const HEALTH_LEVELS = ["Thriving", "Healthy", "Needs Attention", "At Risk"] as const;
export type Health = (typeof HEALTH_LEVELS)[number];

export const SUNLIGHT_LEVELS = ["Full Sun", "Partial Sun", "Indirect Light", "Low Light"] as const;
export type Sunlight = (typeof SUNLIGHT_LEVELS)[number];

export const sunStrength: Record<Sunlight, number> = {
  "Full Sun": 3,
  "Partial Sun": 2,
  "Indirect Light": 2,
  "Low Light": 1,
};

export interface Plant {
  id: string;
  name: string;
  species: string;
  imageKey: string;
  location: string;
  lastWatered: string;
  waterEveryDays: number;
  sunlight: Sunlight;
  lastFertilized: string;
  fertilizeEveryDays: number;
  health: Health;
}

export const nextWatering = (p: Plant) => addDaysISO(p.lastWatered, p.waterEveryDays);
export const nextFertilizing = (p: Plant) => addDaysISO(p.lastFertilized, p.fertilizeEveryDays);
export const daysUntilWatering = (p: Plant, today: Date) => daysFrom(nextWatering(p), today);
export const daysUntilFertilizing = (p: Plant, today: Date) => daysFrom(nextFertilizing(p), today);
export const needsWater = (p: Plant, today: Date) => daysUntilWatering(p, today) <= 0;

const healthScore: Record<Health, number> = {
  Thriving: 100,
  Healthy: 85,
  "Needs Attention": 55,
  "At Risk": 25,
};
const healthRank: Record<Health, number> = {
  "At Risk": 0,
  "Needs Attention": 1,
  Healthy: 2,
  Thriving: 3,
};

/** Average health score across the garden, 0–100. Empty garden = 0. */
export function gardenHealthScore(plants: Plant[]): number {
  if (!plants.length) return 0;
  return Math.round(plants.reduce((sum, p) => sum + healthScore[p.health], 0) / plants.length);
}

export type SortKey = "name" | "watering" | "health";
export type SortDir = "asc" | "desc";

export interface InventoryQuery {
  query: string;
  health: Health | "all";
  sunlight: Sunlight | "all";
  sort: SortKey;
  dir: SortDir;
  page: number;
  pageSize: number;
}

export function queryInventory(plants: Plant[], q: InventoryQuery, today: Date) {
  const needle = q.query.trim().toLowerCase();
  const filtered = plants.filter((p) => {
    if (q.health !== "all" && p.health !== q.health) return false;
    if (q.sunlight !== "all" && p.sunlight !== q.sunlight) return false;
    if (!needle) return true;
    return [p.name, p.species, p.location].some((v) => v.toLowerCase().includes(needle));
  });

  const sign = q.dir === "asc" ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (q.sort === "name") diff = a.name.localeCompare(b.name);
    if (q.sort === "watering") diff = daysUntilWatering(a, today) - daysUntilWatering(b, today);
    if (q.sort === "health") diff = healthRank[a.health] - healthRank[b.health];
    return diff * sign || a.name.localeCompare(b.name);
  });

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / q.pageSize));
  const page = Math.min(Math.max(1, q.page), pageCount);
  const start = (page - 1) * q.pageSize;
  return { rows: sorted.slice(start, start + q.pageSize), total, page, pageCount, start };
}

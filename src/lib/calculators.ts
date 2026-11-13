/* Pure gardening calculators — imperial inputs, with metric equivalents in results. */

const CUFT_TO_LITRES = 28.3168;

export interface SoilInput {
  lengthFt: number;
  widthFt: number;
  depthIn: number;
  beds: number;
  bagCuFt: number;
}

export function soilVolume({ lengthFt, widthFt, depthIn, beds, bagCuFt }: SoilInput) {
  const cubicFeet =
    Math.max(0, lengthFt) * Math.max(0, widthFt) * (Math.max(0, depthIn) / 12) * Math.max(0, beds);
  return {
    cubicFeet,
    cubicYards: cubicFeet / 27,
    litres: cubicFeet * CUFT_TO_LITRES,
    bags: bagCuFt > 0 ? Math.ceil(cubicFeet / bagCuFt) : 0,
  };
}

export interface SeedCrop {
  name: string;
  /** Weeks before last frost to sow indoors. */
  sowWeeksBeforeFrost: number;
  /** Weeks relative to last frost to transplant outside (negative = before). */
  transplantWeeksAfterFrost: number;
  germinationDays: string;
}

export const SEED_CROPS: SeedCrop[] = [
  { name: "Tomato", sowWeeksBeforeFrost: 7, transplantWeeksAfterFrost: 1, germinationDays: "5–10" },
  { name: "Pepper", sowWeeksBeforeFrost: 9, transplantWeeksAfterFrost: 2, germinationDays: "7–14" },
  { name: "Basil", sowWeeksBeforeFrost: 6, transplantWeeksAfterFrost: 1, germinationDays: "5–10" },
  {
    name: "Lettuce",
    sowWeeksBeforeFrost: 5,
    transplantWeeksAfterFrost: -2,
    germinationDays: "2–8",
  },
  {
    name: "Broccoli",
    sowWeeksBeforeFrost: 6,
    transplantWeeksAfterFrost: -2,
    germinationDays: "4–7",
  },
  {
    name: "Cucumber",
    sowWeeksBeforeFrost: 3,
    transplantWeeksAfterFrost: 2,
    germinationDays: "3–10",
  },
  {
    name: "Marigold",
    sowWeeksBeforeFrost: 6,
    transplantWeeksAfterFrost: 0,
    germinationDays: "4–14",
  },
  { name: "Kale", sowWeeksBeforeFrost: 5, transplantWeeksAfterFrost: -3, germinationDays: "5–8" },
];

const DAY_MS = 86_400_000;

export function seedSchedule(
  lastFrost: Date,
  crop: SeedCrop,
  plantsWanted: number,
  germinationRatePct: number,
) {
  const sowIndoors = new Date(lastFrost.getTime() - crop.sowWeeksBeforeFrost * 7 * DAY_MS);
  const transplant = new Date(lastFrost.getTime() + crop.transplantWeeksAfterFrost * 7 * DAY_MS);
  const rate = Math.min(100, Math.max(1, germinationRatePct)) / 100;
  const seedsToSow = Math.ceil(Math.max(0, plantsWanted) / rate);
  return { sowIndoors, transplant, seedsToSow };
}

export const WATER_BASE_IN_PER_WEEK = {
  Vegetables: 1,
  Herbs: 0.75,
  Flowers: 1,
  Succulents: 0.25,
  Lawn: 1,
} as const;
export const WEATHER_FACTOR = { Cool: 0.8, Mild: 1, Hot: 1.3 } as const;
export const SOIL_FACTOR = { Sandy: 1.2, Loam: 1, Clay: 0.85 } as const;
export const SESSIONS_PER_WEEK = { Sandy: 3, Loam: 2, Clay: 1 } as const;
/** One inch of water over one square foot ≈ 0.623 US gallons. */
export const GALLONS_PER_SQFT_INCH = 0.623;

export interface WaterInput {
  plantType: keyof typeof WATER_BASE_IN_PER_WEEK;
  weather: keyof typeof WEATHER_FACTOR;
  soil: keyof typeof SOIL_FACTOR;
  areaSqFt: number;
  rainfallIn: number;
}

export function wateringNeed({ plantType, weather, soil, areaSqFt, rainfallIn }: WaterInput) {
  const targetInches =
    WATER_BASE_IN_PER_WEEK[plantType] * WEATHER_FACTOR[weather] * SOIL_FACTOR[soil];
  const inchesToAdd = Math.max(0, targetInches - Math.max(0, rainfallIn));
  const gallonsPerWeek = inchesToAdd * Math.max(0, areaSqFt) * GALLONS_PER_SQFT_INCH;
  const sessions = SESSIONS_PER_WEEK[soil];
  return {
    targetInches,
    inchesToAdd,
    gallonsPerWeek,
    litresPerWeek: gallonsPerWeek * 3.78541,
    sessions,
    gallonsPerSession: gallonsPerWeek / sessions,
  };
}

/** Square-foot gardening: plants that fit in one 1×1 ft square. */
export const PLANNER_CROPS = [
  { key: "tomato", name: "Tomato", perSquare: 1 },
  { key: "pepper", name: "Pepper", perSquare: 1 },
  { key: "basil", name: "Basil", perSquare: 4 },
  { key: "lettuce", name: "Lettuce", perSquare: 4 },
  { key: "strawberry", name: "Strawberry", perSquare: 4 },
  { key: "marigold", name: "Marigold", perSquare: 4 },
  { key: "rosemary", name: "Rosemary", perSquare: 1 },
  { key: "lavender", name: "Lavender", perSquare: 1 },
] as const;

export function plannerTotals(cells: (string | null)[]) {
  const counts: Record<string, { squares: number; plants: number }> = {};
  for (const key of cells) {
    if (!key) continue;
    const crop = PLANNER_CROPS.find((c) => c.key === key);
    if (!crop) continue;
    counts[key] ??= { squares: 0, plants: 0 };
    counts[key].squares += 1;
    counts[key].plants += crop.perSquare;
  }
  return counts;
}

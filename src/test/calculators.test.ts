import { describe, expect, it } from "vitest";

import {
  plannerTotals,
  seedSchedule,
  SEED_CROPS,
  soilVolume,
  wateringNeed,
} from "@/lib/calculators";

describe("soil calculator", () => {
  it("fills one 4×8 ft bed, 12 in deep, with 32 cu ft = 16 bags of 2 cu ft", () => {
    const r = soilVolume({ lengthFt: 4, widthFt: 8, depthIn: 12, beds: 1, bagCuFt: 2 });
    expect(r.cubicFeet).toBe(32);
    expect(r.bags).toBe(16);
    expect(r.cubicYards).toBeCloseTo(1.185, 3);
  });

  it("rounds partial bags up", () => {
    expect(soilVolume({ lengthFt: 4, widthFt: 4, depthIn: 9, beds: 1, bagCuFt: 1.5 }).bags).toBe(8);
  });
});

describe("seed starting calculator", () => {
  it("sows tomatoes 7 weeks before last frost and plants out 1 week after", () => {
    const frost = new Date(2026, 2, 15);
    const tomato = SEED_CROPS.find((c) => c.name === "Tomato")!;
    const r = seedSchedule(frost, tomato, 10, 80);
    expect(Math.round((frost.getTime() - r.sowIndoors.getTime()) / 86_400_000)).toBe(49);
    expect(Math.round((r.transplant.getTime() - frost.getTime()) / 86_400_000)).toBe(7);
  });

  it("sows extra seeds to cover germination losses", () => {
    const r = seedSchedule(new Date(2026, 2, 15), SEED_CROPS[0]!, 10, 80);
    expect(r.seedsToSow).toBe(13);
  });
});

describe("watering calculator", () => {
  it("subtracts rainfall and converts inches to gallons", () => {
    const r = wateringNeed({
      plantType: "Vegetables",
      weather: "Mild",
      soil: "Loam",
      areaSqFt: 100,
      rainfallIn: 0.5,
    });
    expect(r.inchesToAdd).toBeCloseTo(0.5);
    expect(r.gallonsPerWeek).toBeCloseTo(31.15, 2);
    expect(r.sessions).toBe(2);
  });

  it("needs no extra water when rain covers the target", () => {
    expect(
      wateringNeed({
        plantType: "Succulents",
        weather: "Cool",
        soil: "Clay",
        areaSqFt: 50,
        rainfallIn: 1,
      }).gallonsPerWeek,
    ).toBe(0);
  });
});

describe("garden planner", () => {
  it("counts 4 basil per square and 1 tomato per square", () => {
    const t = plannerTotals(["basil", "basil", "tomato", null]);
    expect(t["basil"]).toEqual({ squares: 2, plants: 8 });
    expect(t["tomato"]).toEqual({ squares: 1, plants: 1 });
  });
});

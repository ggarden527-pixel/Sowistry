import { describe, expect, it } from "vitest";

import { gardenHealthScore, needsWater, type Plant } from "@/lib/inventory";
import { groupTasks, type Task } from "@/lib/tasks";

const today = new Date(2026, 10, 12);
const plant = (over: Partial<Plant>): Plant => ({
  id: "p", name: "Basil", species: "", imageKey: "basil", location: "", sunlight: "Full Sun",
  lastWatered: "2026-11-10", waterEveryDays: 2, lastFertilized: "2026-11-01", fertilizeEveryDays: 14, health: "Healthy", ...over,
});
const task = (id: string, due: string, done = false): Task => ({ id, title: id, type: "water", due, done });

describe("watering due", () => {
  it("a plant watered 2 days ago on a 2-day schedule needs water today", () => {
    expect(needsWater(plant({}), today)).toBe(true);
  });
  it("a plant watered yesterday on a 2-day schedule does not", () => {
    expect(needsWater(plant({ lastWatered: "2026-11-11" }), today)).toBe(false);
  });
});

describe("garden health", () => {
  it("averages plant health: Thriving 100 + At Risk 25 = 63%", () => {
    expect(gardenHealthScore([plant({ health: "Thriving" }), plant({ health: "At Risk" })])).toBe(63);
  });
});

describe("task calendar groups", () => {
  it("sorts tasks into overdue, today, tomorrow and coming up (2–14 days)", () => {
    const g = groupTasks(
      [task("late", "2026-11-10"), task("lateDone", "2026-11-10", true), task("now", "2026-11-12"), task("tmr", "2026-11-13"), task("soon", "2026-11-20"), task("far", "2026-12-20")],
      today,
    );
    expect(g.overdue.map((t) => t.id)).toEqual(["late"]);
    expect(g.today.map((t) => t.id)).toEqual(["now"]);
    expect(g.tomorrow.map((t) => t.id)).toEqual(["tmr"]);
    expect(g.upcoming.map((t) => t.id)).toEqual(["soon"]);
  });
});

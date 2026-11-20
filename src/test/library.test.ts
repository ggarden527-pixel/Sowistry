import { describe, expect, it } from "vitest";

import { findLibraryPlant, searchLibraryPlants } from "@/lib/data";

describe("central plant library", () => {
  it("searches common names, scientific names and alternate names", () => {
    expect(searchLibraryPlants("basil").map((plant) => plant.id)).toContain("l4");
    expect(searchLibraryPlants("Ocimum").map((plant) => plant.id)).toContain("l4");
    expect(searchLibraryPlants("devil").map((plant) => plant.id)).toContain("l11");
  });

  it("returns the same library record for library and garden selection", () => {
    const plant = findLibraryPlant("l10");
    expect(plant?.name).toBe("Snake Plant");
    expect(plant?.latin).toBe("Dracaena trifasciata");
    expect(plant?.imageKey).toBe("snake-plant");
  });
});

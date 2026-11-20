import { describe, expect, it } from "vitest";

import { filterLibraryPlants, findLibraryPlant, searchLibraryPlants } from "@/lib/data";

describe("central plant library", () => {
  it("searches common names, scientific names and alternate names", () => {
    expect(searchLibraryPlants("basil").map((plant) => plant.id)).toContain("l4");
    expect(searchLibraryPlants("Ocimum").map((plant) => plant.id)).toContain("l4");
    expect(searchLibraryPlants("devil").map((plant) => plant.id)).toContain("l11");
    expect(searchLibraryPlants("Ficus lyrata").map((plant) => plant.id)).toContain("l9");
  });

  it("returns the same library record for library and garden selection", () => {
    const plant = findLibraryPlant("l10");
    expect(plant?.name).toBe("Snake Plant");
    expect(plant?.latin).toBe("Dracaena trifasciata");
    expect(plant?.imageKey).toBe("snake-plant");
    expect(plant?.sunlight).toBe("Bright Indirect");
    expect(plant?.sunlightSummary).toContain("tolerates lower light");
  });

  it("combines category, environment and care filters", () => {
    const filtered = filterLibraryPlants(
      searchLibraryPlants(""),
      { category: "Houseplants", environment: "Indoor", waterNeed: "Low" },
    );

    expect(filtered.map((plant) => plant.id)).toEqual(["l10", "l11"]);
  });
});

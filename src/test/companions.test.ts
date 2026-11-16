import { describe, expect, it } from "vitest";
import { companionReport, companionStatus } from "@/lib/calculators";

describe("companion planting", () => {
  it("rates tomato with basil as good and with rosemary as bad", () => {
    expect(companionStatus("basil", "tomato")).toBe("good");
    expect(companionStatus("tomato", "rosemary")).toBe("bad");
  });
  it("flags only side-by-side squares, not across row wrap", () => {
    // 2 columns: tomato | empty / rosemary | empty -> vertical neighbours
    const r = companionReport(["tomato", null, "rosemary", null], 2);
    expect(r.bad).toHaveLength(1);
    expect([...r.badCells].sort()).toEqual([0, 2]);
    const wrap = companionReport([null, "tomato", "rosemary", null], 2);
    expect(wrap.bad).toHaveLength(0);
  });
});

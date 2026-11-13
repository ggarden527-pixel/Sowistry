import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ChoiceChips, NumberField, ResultRow, ToolLayout } from "@/components/app/ToolLayout";
import { soilVolume } from "@/lib/calculators";

export const Route = createFileRoute("/_authenticated/tools/soil")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Soil Calculator — Sowistry" },
      {
        name: "description",
        content: "Calculate how much soil, compost and how many bags you need to fill raised beds.",
      },
      { property: "og:title", content: "Soil Calculator — Sowistry" },
      {
        property: "og:description",
        content: "Work out cubic feet, cubic yards and bags of soil for your raised beds.",
      },
    ],
  }),
  component: SoilPage,
});

const BAGS = ["1 cu ft", "1.5 cu ft", "2 cu ft"] as const;
const bagSize = { "1 cu ft": 1, "1.5 cu ft": 1.5, "2 cu ft": 2 } as const;

function SoilPage() {
  const [length, setLength] = useState(8);
  const [width, setWidth] = useState(4);
  const [depth, setDepth] = useState(10);
  const [beds, setBeds] = useState(2);
  const [bag, setBag] = useState<(typeof BAGS)[number]>("1.5 cu ft");
  const r = soilVolume({
    lengthFt: length,
    widthFt: width,
    depthIn: depth,
    beds,
    bagCuFt: bagSize[bag],
  });

  return (
    <ToolLayout
      title="Soil Calculator"
      subtitle="Find out exactly how much soil you need to fill your raised beds."
      form={
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="len"
              label="Bed length"
              value={length}
              onChange={setLength}
              suffix="ft"
              step={0.5}
            />
            <NumberField
              id="wid"
              label="Bed width"
              value={width}
              onChange={setWidth}
              suffix="ft"
              step={0.5}
            />
            <NumberField
              id="dep"
              label="Soil depth"
              value={depth}
              onChange={setDepth}
              suffix="in"
            />
            <NumberField id="beds" label="Number of beds" value={beds} onChange={setBeds} min={1} />
          </div>
          <ChoiceChips label="Bag size" options={BAGS} value={bag} onChange={setBag} />
          <p className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
            Tip: most vegetables thrive in 8–12 inches of soil. A good raised-bed mix is roughly 60%
            topsoil, 30% compost and 10% aeration (perlite or bark).
          </p>
        </div>
      }
      result={
        <div>
          <p className="eyebrow">You'll need</p>
          <p className="mt-2 font-display text-5xl font-semibold text-primary">{r.bags}</p>
          <p className="text-sm text-muted-foreground">bags of {bag} soil</p>
          <div className="mt-5">
            <ResultRow label="Cubic feet" value={r.cubicFeet.toFixed(1)} />
            <ResultRow label="Cubic yards" value={r.cubicYards.toFixed(2)} />
            <ResultRow label="Litres" value={Math.round(r.litres).toLocaleString()} />
            <ResultRow label="Compost (30%)" value={`${(r.cubicFeet * 0.3).toFixed(1)} cu ft`} />
          </div>
        </div>
      }
    />
  );
}

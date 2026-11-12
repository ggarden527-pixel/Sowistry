import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";

import { NumberField, ResultRow, ToolLayout } from "@/components/app/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEED_CROPS, seedSchedule } from "@/lib/calculators";

export const Route = createFileRoute("/_authenticated/tools/seed-starting")({
  head: () => ({
    meta: [
      { title: "Seed Starting Calculator — Sowistry" },
      { name: "description", content: "Find when to sow seeds indoors, when to transplant and how many seeds to plant." },
      { property: "og:title", content: "Seed Starting Calculator — Sowistry" },
      { property: "og:description", content: "Sow-indoors and transplant dates from your last frost date." },
    ],
  }),
  component: SeedPage,
});

function SeedPage() {
  const [frost, setFrost] = useState(() => `${new Date().getFullYear() + 1}-03-15`);
  const [cropName, setCropName] = useState("Tomato");
  const [plants, setPlants] = useState(6);
  const [germ, setGerm] = useState(80);
  const crop = SEED_CROPS.find((c) => c.name === cropName) ?? SEED_CROPS[0]!;
  const frostDate = new Date(`${frost}T00:00:00`);
  const valid = !Number.isNaN(frostDate.getTime());
  const r = valid ? seedSchedule(frostDate, crop, plants, germ) : null;

  return (
    <ToolLayout
      title="Seed Starting Calculator"
      subtitle="Time your indoor sowing perfectly around your last frost date."
      form={
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="frost">Last frost date</Label>
              <Input id="frost" type="date" value={frost} onChange={(e) => setFrost(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Crop</Label>
              <Select value={cropName} onValueChange={setCropName}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEED_CROPS.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <NumberField id="plants" label="Plants you want" value={plants} onChange={setPlants} min={1} />
            <NumberField id="germ" label="Germination rate" value={germ} onChange={setGerm} suffix="%" min={1} />
          </div>
          <p className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
            {crop.name} seeds usually germinate in {crop.germinationDays} days. Keep the mix warm and evenly moist, and give seedlings 14–16 hours of light.
          </p>
        </div>
      }
      result={
        r ? (
          <div>
            <p className="eyebrow">Sow indoors on</p>
            <p className="mt-2 font-display text-4xl font-semibold text-primary">{format(r.sowIndoors, "MMM d")}</p>
            <p className="text-sm text-muted-foreground">{crop.sowWeeksBeforeFrost} weeks before last frost</p>
            <div className="mt-5">
              <ResultRow label="Transplant outside" value={format(r.transplant, "EEE, MMM d")} />
              <ResultRow label="Seeds to sow" value={r.seedsToSow} strong />
              <ResultRow label="Germination" value={`${crop.germinationDays} days`} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Enter a valid frost date.</p>
        )
      }
    />
  );
}

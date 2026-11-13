import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ChoiceChips, NumberField, ResultRow, ToolLayout } from "@/components/app/ToolLayout";
import { SOIL_FACTOR, WATER_BASE_IN_PER_WEEK, WEATHER_FACTOR, wateringNeed, type WaterInput } from "@/lib/calculators";

export const Route = createFileRoute("/_authenticated/tools/watering")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Watering Calculator — Sowistry" },
      { name: "description", content: "Estimate weekly watering in gallons based on plant type, weather, soil and rainfall." },
      { property: "og:title", content: "Watering Calculator — Sowistry" },
      { property: "og:description", content: "Weekly watering needs from plant type, weather, soil and rainfall." },
    ],
  }),
  component: WateringPage,
});

const plantTypes = Object.keys(WATER_BASE_IN_PER_WEEK) as WaterInput["plantType"][];
const weathers = Object.keys(WEATHER_FACTOR) as WaterInput["weather"][];
const soils = Object.keys(SOIL_FACTOR) as WaterInput["soil"][];

function WateringPage() {
  const [plantType, setPlantType] = useState<WaterInput["plantType"]>("Vegetables");
  const [weather, setWeather] = useState<WaterInput["weather"]>("Mild");
  const [soil, setSoil] = useState<WaterInput["soil"]>("Loam");
  const [area, setArea] = useState(32);
  const [rain, setRain] = useState(0.25);
  const r = wateringNeed({ plantType, weather, soil, areaSqFt: area, rainfallIn: rain });

  return (
    <ToolLayout
      title="Watering Calculator"
      subtitle="Give every bed exactly the water it needs — no more, no less."
      form={
        <div className="space-y-5">
          <ChoiceChips label="What are you growing?" options={plantTypes} value={plantType} onChange={setPlantType} />
          <ChoiceChips label="This week's weather" options={weathers} value={weather} onChange={setWeather} />
          <ChoiceChips label="Soil type" options={soils} value={soil} onChange={setSoil} />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="area" label="Bed area" value={area} onChange={setArea} suffix="sq ft" />
            <NumberField id="rain" label="Rain in last 7 days" value={rain} onChange={setRain} suffix="in" step={0.05} />
          </div>
        </div>
      }
      result={
        <div>
          <p className="eyebrow">Water this week</p>
          <p className="mt-2 font-display text-5xl font-semibold text-primary">{r.gallonsPerWeek.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">gallons ({Math.round(r.litresPerWeek)} litres)</p>
          <div className="mt-5">
            <ResultRow label="Target per week" value={`${r.targetInches.toFixed(2)} in`} />
            <ResultRow label="Still needed after rain" value={`${r.inchesToAdd.toFixed(2)} in`} />
            <ResultRow label="Sessions per week" value={r.sessions} />
            <ResultRow label="Per session" value={`${r.gallonsPerSession.toFixed(1)} gal`} strong />
          </div>
          {r.inchesToAdd === 0 && (
            <p className="mt-4 rounded-lg bg-card p-3 text-sm font-medium text-leaf">Rainfall has you covered this week.</p>
          )}
        </div>
      }
    />
  );
}

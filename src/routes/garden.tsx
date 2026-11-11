import { createFileRoute } from "@tanstack/react-router";
import { MapPin, PlusCircle } from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/app/bits";
import { PlantTable } from "@/components/app/PlantTable";
import { Button } from "@/components/ui/button";
import { getToday } from "@/lib/dates";
import { useGarden } from "@/lib/garden-store";
import { needsWater } from "@/lib/inventory";
import { plantImage } from "@/lib/plant-images";

export const Route = createFileRoute("/garden")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    const q = search["q"];
    return typeof q === "string" && q ? { q } : {};
  },
  head: () => ({
    meta: [
      { title: "My Garden — Sowistry" },
      { name: "description", content: "Your full plant inventory with watering, sunlight, fertilizer schedules and health status." },
      { property: "og:title", content: "My Garden — Sowistry" },
      { property: "og:description", content: "Your full plant inventory with watering and feeding schedules." },
    ],
  }),
  component: GardenPage,
});

function GardenPage() {
  const { q } = Route.useSearch();
  const { plants, setAddPlantOpen } = useGarden();
  const today = getToday();
  const spaces = Array.from(new Set(plants.map((p) => p.location))).map((loc) => {
    const list = plants.filter((p) => p.location === loc);
    return { loc, list, thirsty: list.filter((p) => needsWater(p, today)).length };
  });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="My Garden"
        subtitle={`${plants.length} plants growing across ${spaces.length} spaces.`}
        actions={
          <Button variant="leaf" size="lg" onClick={() => setAddPlantOpen(true)}>
            <PlusCircle /> Add New Plant
          </Button>
        }
      />

      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {spaces.map((s) => (
          <div key={s.loc} className="surface flex items-center gap-3 p-4">
            <div className="flex -space-x-3">
              {s.list.slice(0, 3).map((p) => (
                <img key={p.id} src={plantImage(p.imageKey)} alt="" loading="lazy" className="h-10 w-10 rounded-full border-2 border-card object-cover" />
              ))}
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate text-sm font-semibold text-primary">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-leaf" /> {s.loc}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.list.length} plant{s.list.length > 1 ? "s" : ""}
                {s.thirsty > 0 && <> · <span className="font-semibold text-water">{s.thirsty} thirsty</span></>}
              </p>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle title="Plant inventory" />
      <PlantTable pageSize={8} initialQuery={q ?? ""} showLocation allowDelete />
    </div>
  );
}

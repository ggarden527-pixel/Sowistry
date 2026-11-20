import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Plus, Search, Sun, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/bits";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LIBRARY, getLibraryPlantCare, searchLibraryPlants, type LibraryCategory, type LibraryPlant } from "@/lib/data";
import { getToday, toISO } from "@/lib/dates";
import { useGarden } from "@/lib/garden-store";
import { plantImage } from "@/lib/plant-images";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/library")({
  head: () => ({
    meta: [
      { title: "Plant Library — Sowistry" },
      { name: "description", content: "Browse vegetables, herbs, fruits, houseplants and flowers with care needs for each." },
      { property: "og:title", content: "Plant Library — Sowistry" },
      { property: "og:description", content: "Browse plants with sunlight, watering and seasonal care needs." },
    ],
  }),
  component: LibraryPage,
});

const CATEGORIES: ("All" | LibraryCategory)[] = ["All", "Vegetables", "Herbs", "Fruits", "Houseplants", "Flowers"];

const difficultyStyle = {
  Easy: "bg-leaf-soft text-primary",
  Moderate: "bg-warning-soft text-warning",
  Expert: "bg-destructive-soft text-destructive",
};

function LibraryPage() {
  const { addPlant } = useGarden();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [q, setQ] = useState("");
  const [environment, setEnvironment] = useState<"All" | "Indoor" | "Outdoor">("All");
  const [difficulty, setDifficulty] = useState<"All" | "Easy" | "Moderate" | "Expert">("All");
  const [sort, setSort] = useState<"name" | "easy" | "low-water" | "high-water" | "indoor" | "outdoor">("name");
  const [selected, setSelected] = useState<LibraryPlant | null>(null);

  const suggestions = useMemo(() => searchLibraryPlants(q).slice(0, 6), [q]);

  const list = useMemo(() => {
    const matches = searchLibraryPlants(q).filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        (difficulty === "All" || p.difficulty === difficulty) &&
        (environment === "All" ||
          p.environment === "Indoor & Outdoor" ||
          p.environment?.includes(environment)),
    );
    const difficultyRank = { Easy: 0, Moderate: 1, Expert: 2 };
    return [...matches].sort((a, b) => {
      if (sort === "easy") return difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
      if (sort === "low-water") return a.waterEveryDays - b.waterEveryDays;
      if (sort === "high-water") return b.waterEveryDays - a.waterEveryDays;
      if (sort === "indoor") return Number(b.environment?.includes("Indoor")) - Number(a.environment?.includes("Indoor"));
      if (sort === "outdoor") return Number(b.environment?.includes("Outdoor")) - Number(a.environment?.includes("Outdoor"));
      return a.name.localeCompare(b.name);
    });
  }, [cat, q, difficulty, environment, sort]);

  const addFromLibrary = (p: LibraryPlant) => {
    const today = toISO(getToday());
    addPlant({
      libraryPlantId: p.id,
      name: p.name,
      species: p.latin,
      imageKey: p.imageKey,
      location: p.category === "Houseplants" ? "Living Room" : "Raised Bed A",
      sunlight: p.sunlight,
      waterEveryDays: p.waterEveryDays,
      fertilizeEveryDays: p.fertilizeEveryDays,
      health: "Healthy",
      lastWatered: today,
      lastFertilized: today,
    });
    toast.success(`${p.name} added to My Garden`);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Plant Library" subtitle="Find the right plants for your space — and add them to your garden in one tap." />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                cat === c ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-primary",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2 lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or scientific name…"
              aria-label="Search the library"
              className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-leaf"
            />
            {q.trim() && suggestions.length > 0 && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lift">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setSelected(p); setQ(p.name); }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-secondary"
                  >
                    <img src={plantImage(p.imageKey)} alt="" className="h-9 w-9 rounded-md object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{p.name}</span>
                      <span className="block truncate text-xs italic text-muted-foreground">{p.latin}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="mr-1 h-4 w-4 text-muted-foreground" />
        <select aria-label="Growing environment" value={environment} onChange={(e) => setEnvironment(e.target.value as typeof environment)} className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-semibold">
          <option>All</option><option>Indoor</option><option>Outdoor</option>
        </select>
        <select aria-label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-semibold">
          <option>All</option><option>Easy</option><option>Moderate</option><option>Expert</option>
        </select>
        <select aria-label="Sort plants" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-semibold">
          <option value="name">Alphabetical</option>
          <option value="easy">Easiest to grow</option>
          <option value="low-water">Lowest watering needs</option>
          <option value="high-water">Highest watering needs</option>
          <option value="indoor">Best indoors</option>
          <option value="outdoor">Best outdoors</option>
        </select>
      </div>

      {list.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">No plants match that search.</p>}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {list.map((p) => (
          <article key={p.id} className="surface group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <button type="button" onClick={() => setSelected(p)} className="h-full w-full" aria-label={`View ${p.name} profile`}>
                <img src={plantImage(p.imageKey)} alt={p.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </button>
              <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold", difficultyStyle[p.difficulty])}>{p.difficulty}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="eyebrow">{p.category}</p>
              <button type="button" onClick={() => setSelected(p)} className="mt-1 text-left font-display text-lg font-semibold hover:text-primary">{p.name}</button>
              <p className="text-xs italic text-muted-foreground">{p.latin}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 font-medium text-foreground"><Sun className="h-3.5 w-3.5 text-sun" /> {p.sunlight}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 font-medium text-foreground"><Droplets className="h-3.5 w-3.5 text-water" /> Every {p.waterEveryDays}d</span>
                <span className="rounded-md bg-background px-2 py-1 font-medium text-foreground">{p.season}</span>
              </div>
              <button
                type="button"
                onClick={() => addFromLibrary(p)}
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Add to my garden
              </button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-3xl">
          {selected && (() => {
            const care = getLibraryPlantCare(selected);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-3xl text-primary">{selected.name}</DialogTitle>
                  <DialogDescription className="italic">{selected.latin}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                  <img src={plantImage(selected.imageKey)} alt={selected.name} className="aspect-square w-full rounded-xl object-cover" />
                  <div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{care.introduction}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <span className="rounded-lg bg-secondary px-3 py-2"><strong>Family:</strong> {selected.family ?? "Not specified"}</span>
                      <span className="rounded-lg bg-secondary px-3 py-2"><strong>Difficulty:</strong> {selected.difficulty}</span>
                      <span className="rounded-lg bg-secondary px-3 py-2"><strong>Mature size:</strong> {selected.matureSize ?? "Not specified"}</span>
                      <span className="rounded-lg bg-secondary px-3 py-2"><strong>Environment:</strong> {selected.environment ?? "Not specified"}</span>
                      <span className="rounded-lg bg-secondary px-3 py-2"><strong>Native region:</strong> {selected.nativeRegion ?? "Not specified"}</span>
                    </div>
                    {selected.alternateNames && selected.alternateNames.length > 0 && (
                      <p className="mt-3 text-xs text-muted-foreground">Also known as: {selected.alternateNames.join(", ")}</p>
                    )}
                  </div>
                </div>

                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {[
                    ["Watering guide", care.watering],
                    ["Sunlight guide", care.sunlight],
                    ["Soil and growing medium", care.soil],
                    ["Fertilizing guide", care.fertilizing],
                    ["Temperature and humidity", `${care.temperature} ${care.humidity}`],
                    ["Growth and maintenance", care.maintenance],
                  ].map(([title, text]) => (
                    <section key={title} className="rounded-xl border border-border p-4">
                      <h3 className="font-display font-semibold text-primary">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                    </section>
                  ))}
                </div>

                <section className="rounded-xl border border-border p-4">
                  <h3 className="font-display font-semibold text-primary">Common problems</h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {care.problems.map((problem) => (
                      <div key={problem.symptom} className="rounded-lg bg-background p-3">
                        <p className="text-sm font-semibold">{problem.symptom}</p>
                        <p className="mt-1 text-xs text-muted-foreground"><strong>Likely cause:</strong> {problem.likelyCause}</p>
                        <p className="mt-1 text-xs text-muted-foreground"><strong>Solution:</strong> {problem.solution}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex justify-end">
                  <button type="button" onClick={() => { addFromLibrary(selected); setSelected(null); }} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">
                    <Plus className="h-4 w-4" /> Add to my garden
                  </button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

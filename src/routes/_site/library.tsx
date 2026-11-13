import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Droplets, Plus, Search, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/bits";
import { LIBRARY, type LibraryCategory } from "@/lib/data";
import { getToday, toISO } from "@/lib/dates";
import { useAuth } from "@/lib/auth/context";
import { useGarden } from "@/lib/garden-store";
import { plantImage } from "@/lib/plant-images";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/library")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Plant Library — Sowistry" },
      {
        name: "description",
        content:
          "Browse vegetables, herbs, fruits, houseplants and flowers with care needs for each.",
      },
      { property: "og:title", content: "Plant Library — Sowistry" },
      {
        property: "og:description",
        content: "Browse plants with sunlight, watering and seasonal care needs.",
      },
    ],
  }),
  component: LibraryPage,
});

const CATEGORIES: ("All" | LibraryCategory)[] = [
  "All",
  "Vegetables",
  "Herbs",
  "Fruits",
  "Houseplants",
  "Flowers",
];

const difficultyStyle = {
  Easy: "bg-leaf-soft text-primary",
  Moderate: "bg-warning-soft text-warning",
  Expert: "bg-destructive-soft text-destructive",
};

function LibraryPage() {
  const { addPlant, ready } = useGarden();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      LIBRARY.filter(
        (p) =>
          (cat === "All" || p.category === cat) &&
          (p.name + p.latin).toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [cat, q],
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Plant Library"
        subtitle="Find the right plants for your space — and add them to your garden in one tap."
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                cat === c
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-primary",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the library…"
            aria-label="Search the library"
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-leaf"
          />
        </div>
      </div>

      {list.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No plants match that search.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {list.map((p) => (
          <article
            key={p.id}
            className="surface group flex flex-col overflow-hidden transition-shadow hover:shadow-lift"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={plantImage(p.imageKey)}
                alt={p.name}
                loading="lazy"
                width={816}
                height={816}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className={cn(
                  "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold",
                  difficultyStyle[p.difficulty],
                )}
              >
                {p.difficulty}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="eyebrow">{p.category}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{p.name}</h3>
              <p className="text-xs italic text-muted-foreground">{p.latin}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 font-medium text-foreground">
                  <Sun className="h-3.5 w-3.5 text-sun" /> {p.sunlight}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 font-medium text-foreground">
                  <Droplets className="h-3.5 w-3.5 text-water" /> Every {p.waterEveryDays}d
                </span>
                <span className="rounded-md bg-background px-2 py-1 font-medium text-foreground">
                  {p.season}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    toast("Sign in to start your garden", {
                      description: `Create a free account to add ${p.name} and get watering reminders.`,
                    });
                    void navigate({
                      to: "/auth",
                      search: { mode: "signup", redirect: "/library" },
                    });
                    return;
                  }
                  if (!ready) return;
                  const today = toISO(getToday());
                  addPlant({
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
                }}
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Add to my garden
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

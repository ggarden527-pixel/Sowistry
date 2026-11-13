import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/app/bits";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { GUIDES, type Guide } from "@/lib/data";
import { plantImage } from "@/lib/plant-images";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/guides/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Plant Guides — Sowistry" },
      {
        name: "description",
        content:
          "Practical, step-by-step guides on watering, soil, seed starting, companion planting and seasonal care.",
      },
      { property: "og:title", content: "Plant Guides — Sowistry" },
      {
        property: "og:description",
        content: "Step-by-step guides on watering, soil, seeds and seasonal care.",
      },
    ],
  }),
  component: GuidesPage,
});

const CATS = ["All", ...Array.from(new Set(GUIDES.map((g) => g.category)))] as const;

function GuidesPage() {
  const [cat, setCat] = useState<string>("All");
  const [open, setOpen] = useState<Guide | null>(null);
  const list = GUIDES.filter((g) => cat === "All" || g.category === cat);
  const [featured, ...rest] = list;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Plant Guides"
        subtitle="Short, practical reads to help you grow with confidence."
      />

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {CATS.map((c) => (
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

      {featured && (
        <button
          type="button"
          onClick={() => setOpen(featured)}
          className="surface group mb-6 grid w-full overflow-hidden text-left transition-shadow hover:shadow-lift md:grid-cols-[1.1fr_1fr]"
        >
          <div className="aspect-[16/10] overflow-hidden bg-muted md:aspect-auto">
            <img
              src={plantImage(featured.imageKey)}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10">
            <p className="eyebrow text-leaf">Featured · {featured.category}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight">
              {featured.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{featured.summary}</p>
            <span className="mt-6 inline-flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" /> {featured.readMins} min read
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-primary">
                Read guide <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </div>
        </button>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {rest.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setOpen(g)}
            className="surface group flex flex-col overflow-hidden text-left transition-shadow hover:shadow-lift"
          >
            <div className="aspect-[16/10] overflow-hidden bg-muted">
              <img
                src={plantImage(g.imageKey)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="eyebrow">{g.category}</p>
              <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug">{g.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{g.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {g.readMins} min read
              </span>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-0 sm:max-w-2xl">
          {open && (
            <>
              <img
                src={plantImage(open.imageKey)}
                alt=""
                className="aspect-[16/7] w-full object-cover"
              />
              <div className="p-6 sm:p-8">
                <p className="eyebrow text-leaf">
                  {open.category} · {open.readMins} min read
                </p>
                <DialogTitle className="mt-2 font-display text-3xl font-semibold text-primary">
                  {open.title}
                </DialogTitle>
                <DialogDescription className="mt-2 text-base">{open.summary}</DialogDescription>
                <ol className="mt-6 space-y-3">
                  {open.steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-sm leading-relaxed text-foreground">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

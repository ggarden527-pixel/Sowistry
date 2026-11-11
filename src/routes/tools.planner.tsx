import { createFileRoute } from "@tanstack/react-router";
import { Eraser, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/app/bits";
import { NumberField } from "@/components/app/ToolLayout";
import { Button } from "@/components/ui/button";
import { PLANNER_CROPS, plannerTotals } from "@/lib/calculators";
import { plantImage } from "@/lib/plant-images";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools/planner")({
  head: () => ({
    meta: [
      { title: "Garden Planner — Sowistry" },
      { name: "description", content: "Design raised beds square by square and see how many plants fit." },
      { property: "og:title", content: "Garden Planner — Sowistry" },
      { property: "og:description", content: "Design raised beds square by square with square-foot spacing." },
    ],
  }),
  component: PlannerPage,
});

const KEY = "sowistry:planner";

function PlannerPage() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(8);
  const [cells, setCells] = useState<(string | null)[]>(() => Array(32).fill(null));
  const [brush, setBrush] = useState<string | null>("tomato");
  const [painting, setPainting] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as { rows: number; cols: number; cells: (string | null)[] } | null;
      if (saved) {
        setRows(saved.rows);
        setCols(saved.cols);
        setCells(saved.cells);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify({ rows, cols, cells }));
  }, [rows, cols, cells]);

  const resize = (r: number, c: number) => {
    const nr = Math.min(12, Math.max(1, r));
    const nc = Math.min(16, Math.max(1, c));
    setCells((prev) => {
      const next: (string | null)[] = Array(nr * nc).fill(null);
      for (let y = 0; y < Math.min(nr, rows); y++) for (let x = 0; x < Math.min(nc, cols); x++) next[y * nc + x] = prev[y * cols + x] ?? null;
      return next;
    });
    setRows(nr);
    setCols(nc);
  };

  const paint = (i: number) => setCells((prev) => prev.map((v, j) => (j === i ? brush : v)));
  const totals = plannerTotals(cells);
  const planted = cells.filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl" onMouseUp={() => setPainting(false)} onMouseLeave={() => setPainting(false)}>
      <PageHeader
        title="Garden Planner"
        subtitle="Pick a plant, then tap or drag across squares. Each square is 1 × 1 ft."
        actions={
          <Button variant="outline" onClick={() => setCells(Array(rows * cols).fill(null))}>
            <RotateCcw /> Clear bed
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_280px]">
        <div className="surface space-y-4 self-start p-5">
          <p className="eyebrow">Plants</p>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {PLANNER_CROPS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setBrush(c.key)}
                aria-pressed={brush === c.key}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-2 text-left transition-colors",
                  brush === c.key ? "border-leaf bg-secondary" : "border-border hover:bg-background",
                )}
              >
                <img src={plantImage(c.key)} alt="" className="h-9 w-9 rounded-lg object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-primary">{c.name}</span>
                  <span className="block text-[0.6875rem] text-muted-foreground">{c.perSquare} per square</span>
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setBrush(null)}
              aria-pressed={brush === null}
              className={cn("flex items-center gap-2.5 rounded-xl border p-2 text-left", brush === null ? "border-leaf bg-secondary" : "border-border hover:bg-background")}
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-background text-muted-foreground"><Eraser className="h-4 w-4" /></span>
              <span className="text-sm font-semibold text-primary">Eraser</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
            <NumberField id="rows" label="Length (ft)" value={rows} onChange={(n) => resize(n, cols)} min={1} />
            <NumberField id="cols" label="Width (ft)" value={cols} onChange={(n) => resize(rows, n)} min={1} />
          </div>
        </div>

        <div className="surface overflow-x-auto p-5">
          <div className="mx-auto w-fit rounded-2xl bg-primary p-3">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(2.75rem, 3.5rem))` }}>
              {cells.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Square ${Math.floor(i / cols) + 1}-${(i % cols) + 1}${v ? `: ${v}` : ""}`}
                  onMouseDown={() => {
                    setPainting(true);
                    paint(i);
                  }}
                  onMouseEnter={() => painting && paint(i)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-md transition-transform hover:scale-[1.04]",
                    v ? "bg-card" : "bg-primary-foreground/10 hover:bg-primary-foreground/20",
                  )}
                >
                  {v && <img src={plantImage(v)} alt="" draggable={false} className="h-full w-full object-cover" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="surface self-start p-5">
          <p className="eyebrow">Bed summary</p>
          <p className="mt-2 font-display text-4xl font-semibold text-primary">{Object.values(totals).reduce((s, t) => s + t.plants, 0)}</p>
          <p className="text-sm text-muted-foreground">plants · {planted} of {rows * cols} sq ft used</p>
          <div className="mt-4 space-y-2">
            {Object.entries(totals).map(([key, t]) => {
              const crop = PLANNER_CROPS.find((c) => c.key === key);
              return (
                <div key={key} className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
                  <span className="font-semibold text-primary">{crop?.name}</span>
                  <span className="text-muted-foreground">{t.plants} plants · {t.squares} sq</span>
                </div>
              );
            })}
            {planted === 0 && <p className="text-sm text-muted-foreground">Your bed is empty. Start planting!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

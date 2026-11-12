import { createFileRoute } from "@tanstack/react-router";
import { Eraser, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/bits";
import { NumberField } from "@/components/app/ToolLayout";
import { Button } from "@/components/ui/button";
import { PLANNER_CROPS, plannerTotals } from "@/lib/calculators";
import { useAuth } from "@/lib/auth/context";
import { plantImage } from "@/lib/plant-images";
import { gardenRepo } from "@/lib/repo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tools/planner")({
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

function PlannerPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(8);
  const [cells, setCells] = useState<(string | null)[]>(() => Array(32).fill(null));
  const [brush, setBrush] = useState<string | null>("tomato");
  const [painting, setPainting] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    setLoadedFor(null);
    setRows(4);
    setCols(8);
    setCells(Array(32).fill(null));
    if (!user?.id) return;
    let active = true;
    void gardenRepo
      .loadBed(user.id)
      .then((saved) => {
        if (!active) return;
        if (saved) {
          setRows(saved.rows);
          setCols(saved.cols);
          setCells(saved.cells);
        }
        setLoadedFor(user.id);
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast.error("We couldn't load your garden plan.", {
          description:
            error instanceof Error
              ? error.message
              : "Check your database connection and try again.",
        });
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || loadedFor !== user.id) return;
    const timer = window.setTimeout(() => {
      void gardenRepo
        .saveBed(user.id, { rows, cols, cells })
        .catch((error: unknown) => {
          toast.error("Your garden plan didn't save.", {
            description:
              error instanceof Error
                ? error.message
                : "Check your database connection and try again.",
          });
        });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [user?.id, loadedFor, rows, cols, cells]);

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
  const totalPlants = Object.values(totals).reduce((sum, t) => sum + t.plants, 0);

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

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] 2xl:grid-cols-[240px_minmax(0,1fr)_260px]">
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

        <div className="surface min-w-0 self-start p-4 sm:p-5">
          <div className="mx-auto rounded-2xl bg-primary p-2 sm:p-3" style={{ maxWidth: `${cols * 3.75 + 1.5}rem` }}>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
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

        <div className="surface self-start p-5 lg:col-span-2 2xl:col-span-1">
          <p className="eyebrow">Bed summary</p>
          <p className="mt-2 font-display text-4xl font-semibold text-primary">{totalPlants}</p>
          <p className="text-sm text-muted-foreground">{totalPlants === 1 ? "plant" : "plants"} · {planted} of {rows * cols} sq ft used</p>
          <div className="mt-4 space-y-2">
            {Object.entries(totals).map(([key, t]) => {
              const crop = PLANNER_CROPS.find((c) => c.key === key);
              return (
                <div key={key} className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
                  <span className="font-semibold text-primary">{crop?.name}</span>
                  <span className="text-muted-foreground">{t.plants} {t.plants === 1 ? "plant" : "plants"} · {t.squares} sq</span>
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

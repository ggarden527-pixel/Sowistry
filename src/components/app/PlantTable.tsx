import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Droplets, Search, SlidersHorizontal, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { agoLabel, daysFrom, getToday, relativeDayLabel } from "@/lib/dates";
import { useGarden } from "@/lib/garden-store";
import {
  HEALTH_LEVELS,
  SUNLIGHT_LEVELS,
  daysUntilFertilizing,
  daysUntilWatering,
  queryInventory,
  type Health,
  type SortKey,
  type Sunlight,
} from "@/lib/inventory";
import { cn } from "@/lib/utils";

import { HealthBadge, PlantThumb, SunMeter } from "./bits";

export function PlantTable({ pageSize = 5, initialQuery = "", showLocation = false, allowDelete = false }: { pageSize?: number; initialQuery?: string; showLocation?: boolean; allowDelete?: boolean }) {
  const { plants, waterPlant, removePlant } = useGarden();
  const [query, setQuery] = useState(initialQuery);
  const [health, setHealth] = useState<Health | "all">("all");
  const [sunlight, setSunlight] = useState<Sunlight | "all">("all");
  const [sort, setSort] = useState<SortKey>("watering");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => setQuery(initialQuery), [initialQuery]);
  useEffect(() => setPage(1), [query, health, sunlight, sort, dir]);

  const today = getToday();
  const result = useMemo(
    () => queryInventory(plants, { query, health, sunlight, sort, dir, page, pageSize }, today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plants, query, health, sunlight, sort, dir, page, pageSize],
  );

  const toggleSort = (key: SortKey) => {
    if (sort === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setDir("asc");
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort !== k ? <ArrowUpDown className="h-3.5 w-3.5 opacity-50" /> : dir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;

  const th = "eyebrow px-3 py-3.5 text-left font-bold @lg:px-5";
  const sortBtn = "inline-flex items-center gap-1.5 whitespace-nowrap uppercase hover:text-primary";
  // Columns drop away as the table's own width shrinks, so it never needs sideways scrolling.
  const colHealth = "hidden @[44rem]:table-cell";
  const colFeed = "hidden @[54rem]:table-cell";
  const colSun = "hidden @[62rem]:table-cell";

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your plants…"
            aria-label="Search your plants"
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-leaf"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-primary hover:bg-secondary",
            (showFilters || health !== "all" || sunlight !== "all") && "border-leaf bg-secondary",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {(health !== "all" || sunlight !== "all") && <span className="h-1.5 w-1.5 rounded-full bg-leaf" />}
        </button>
      </div>

      {showFilters && (
        <div className="mb-4 grid gap-3 rounded-xl border border-border bg-secondary/60 p-3 sm:grid-cols-[1fr_1fr_auto]">
          <Select value={health} onValueChange={(v) => setHealth(v as Health | "all")}>
            <SelectTrigger className="bg-card"><SelectValue placeholder="Health" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All health states</SelectItem>
              {HEALTH_LEVELS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sunlight} onValueChange={(v) => setSunlight(v as Sunlight | "all")}>
            <SelectTrigger className="bg-card"><SelectValue placeholder="Sunlight" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All light levels</SelectItem>
              {SUNLIGHT_LEVELS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => {
              setHealth("all");
              setSunlight("all");
            }}
            className="h-9 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Reset
          </button>
        </div>
      )}

      <div className="surface @container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-background/60">
              <tr>
                <th className={th}>
                  <button type="button" className={sortBtn} onClick={() => toggleSort("name")}>Plant <SortIcon k="name" /></button>
                </th>
                <th className={th}>
                  <button type="button" className={sortBtn} onClick={() => toggleSort("watering")}>Next watering <SortIcon k="watering" /></button>
                </th>
                <th className={cn(th, colSun)}>Sunlight</th>
                <th className={cn(th, colFeed)}>Fertilizer</th>
                <th className={cn(th, colHealth)}>
                  <button type="button" className={sortBtn} onClick={() => toggleSort("health")}>Health <SortIcon k="health" /></button>
                </th>
                <th className={cn(th, "text-right")}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-sm text-muted-foreground">
                    No plants match your search.
                  </td>
                </tr>
              )}
              {result.rows.map((p) => {
                const w = daysUntilWatering(p, today);
                const f = daysUntilFertilizing(p, today);
                const lastAgo = daysFrom(p.lastWatered, today);
                return (
                  <tr key={p.id} className="transition-colors hover:bg-background/70">
                    <td className="w-full min-w-[7rem] px-3 py-4 @lg:px-5">
                      <div className="flex items-center gap-3.5">
                        <PlantThumb imageKey={p.imageKey} className="hidden @md:block" />
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold text-primary">{p.name}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {p.species}
                            {showLocation && <> · {p.location}</>}
                          </p>
                          <HealthBadge health={p.health} className="mt-1.5 @[44rem]:hidden" />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 @md:whitespace-nowrap @lg:px-5">
                      <p className={cn("text-sm font-semibold", w < 0 ? "text-destructive" : w === 0 ? "text-warning" : "text-primary")}>
                        {relativeDayLabel(w)}
                      </p>
                      <p className="text-xs text-muted-foreground">Last: {agoLabel(lastAgo)}</p>
                    </td>
                    <td className={cn("whitespace-nowrap px-5 py-4", colSun)}>
                      <SunMeter sunlight={p.sunlight} />
                    </td>
                    <td className={cn("whitespace-nowrap px-5 py-4", colFeed)}>
                      {f <= 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-warning">
                          <TriangleAlert className="h-4 w-4" /> Due now
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm text-foreground">
                          <span className="h-2 w-2 rounded-full bg-leaf" /> {relativeDayLabel(f)}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground">Every {p.fertilizeEveryDays} days</p>
                    </td>
                    <td className={cn("whitespace-nowrap px-5 py-4", colHealth)}>
                      <HealthBadge health={p.health} />
                    </td>
                    <td className="px-3 py-4 @lg:px-4">
                      <div className="flex flex-col items-end gap-1.5 @md:flex-row @md:justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            waterPlant(p.id);
                            toast.success(`${p.name} watered`, { description: "Next reminder rescheduled." });
                          }}
                          disabled={lastAgo === 0}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-water-soft px-3 text-xs font-semibold text-water transition hover:brightness-95 disabled:opacity-40"
                          aria-label={`Mark ${p.name} as watered`}
                        >
                          <Droplets className="h-3.5 w-3.5" /> <span className="hidden @md:inline">{lastAgo === 0 ? "Watered" : "Water"}</span>
                        </button>
                        {allowDelete && (
                          <button
                            type="button"
                            onClick={() => {
                              removePlant(p.id);
                              toast(`${p.name} removed`);
                            }}
                            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-destructive-soft hover:text-destructive"
                            aria-label={`Remove ${p.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border bg-background/60 px-5 py-3.5">
          <p className="text-sm text-muted-foreground">
            {result.total === 0
              ? "No plants"
              : `Showing ${result.start + 1}–${result.start + result.rows.length} of ${result.total} plants`}
          </p>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Page {result.page} of {result.pageCount}
            </span>
            <button
              type="button"
              aria-label="Previous page"
              disabled={result.page <= 1}
              onClick={() => setPage(result.page - 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-primary hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={result.page >= result.pageCount}
              onClick={() => setPage(result.page + 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-primary hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

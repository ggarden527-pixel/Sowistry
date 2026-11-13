import { createFileRoute } from "@tanstack/react-router";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, SectionTitle } from "@/components/app/bits";
import { TaskItem, taskIcon } from "@/components/app/TaskPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLANTING_WINDOWS } from "@/lib/data";
import { getToday, toISO } from "@/lib/dates";
import { useGarden } from "@/lib/garden-store";
import { taskTypeLabel, type TaskType } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/calendar")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Planting Calendar — Sowistry" },
      { name: "description", content: "Plan sowing, watering, feeding and harvest tasks on a monthly garden calendar." },
      { property: "og:title", content: "Planting Calendar — Sowistry" },
      { property: "og:description", content: "Plan sowing, watering, feeding and harvest tasks month by month." },
    ],
  }),
  component: CalendarPage,
});

const typeDot: Record<TaskType, string> = {
  water: "bg-water",
  fertilize: "bg-sun",
  plant: "bg-leaf",
  prune: "bg-primary",
  harvest: "bg-destructive",
};

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function CalendarPage() {
  const { tasks, addTask } = useGarden();
  const today = getToday();
  const [month, setMonth] = useState(startOfMonth(today));
  const [selected, setSelected] = useState(today);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("plant");

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const dayTasks = tasks.filter((t) => isSameDay(parseISO(t.due), selected)).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Planting Calendar" subtitle="Every sowing, feeding and harvest — planned month by month." />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="surface p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">{format(month, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-2">
              <Button variant="soft" size="sm" onClick={() => { setMonth(startOfMonth(today)); setSelected(today); }}>Today</Button>
              <button type="button" aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))} className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-primary hover:bg-secondary">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))} className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-primary hover:bg-secondary">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="eyebrow pb-2">{d}</div>
            ))}
            {days.map((d) => {
              const list = tasks.filter((t) => isSameDay(parseISO(t.due), d));
              const isSel = isSameDay(d, selected);
              const isToday = isSameDay(d, today);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => setSelected(d)}
                  className={cn(
                    "flex min-h-16 flex-col items-start rounded-xl border p-2 text-left transition-colors sm:min-h-24",
                    isSel ? "border-leaf bg-secondary" : "border-transparent hover:bg-background",
                    !isSameMonth(d, month) && "opacity-40",
                  )}
                >
                  <span className={cn("grid h-7 w-7 place-items-center rounded-full text-sm font-semibold", isToday ? "bg-primary text-primary-foreground" : "text-primary")}>
                    {format(d, "d")}
                  </span>
                  <div className="mt-auto hidden w-full space-y-1 sm:block">
                    {list.slice(0, 2).map((t) => (
                      <span key={t.id} className={cn("flex items-center gap-1 truncate text-[0.6875rem] font-medium text-foreground", t.done && "line-through opacity-60")}>
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", typeDot[t.type])} />
                        <span className="truncate">{t.title}</span>
                      </span>
                    ))}
                    {list.length > 2 && <span className="text-[0.6875rem] text-muted-foreground">+{list.length - 2} more</span>}
                  </div>
                  <div className="mt-auto flex gap-0.5 sm:hidden">
                    {list.slice(0, 3).map((t) => <span key={t.id} className={cn("h-1.5 w-1.5 rounded-full", typeDot[t.type])} />)}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4">
            {(Object.keys(typeDot) as TaskType[]).map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className={cn("h-2 w-2 rounded-full", typeDot[t])} /> {taskTypeLabel[t]}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface p-5">
            <p className="eyebrow">Selected day</p>
            <h3 className="mt-1 font-display text-xl font-semibold">{format(selected, "EEEE, MMMM d")}</h3>
            <div className="mt-4 space-y-2">
              {dayTasks.length ? dayTasks.map((t) => <TaskItem key={t.id} task={t} />) : <p className="text-sm text-muted-foreground">No tasks — enjoy a slow garden day.</p>}
            </div>
          </div>

          <form
            className="surface space-y-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              addTask({ title: title.trim(), type, due: toISO(selected) });
              toast.success("Task added", { description: `${title.trim()} on ${format(selected, "MMM d")}` });
              setTitle("");
            }}
          >
            <h3 className="font-display text-lg font-semibold">Add a task for {format(selected, "MMM d")}</h3>
            <div className="space-y-1.5">
              <Label htmlFor="ttitle">Task</Label>
              <Input id="ttitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sow carrot seeds" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(taskTypeLabel) as TaskType[]).map((t) => {
                    const Icon = taskIcon[t];
                    return (
                      <SelectItem key={t} value={t}>
                        <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4" /> {taskTypeLabel[t]}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="leaf" className="w-full"><Plus /> Add task</Button>
          </form>
        </div>
      </div>

      <section className="mt-10">
        <SectionTitle title="Seasonal planting windows" />
        <div className="surface overflow-x-auto p-5">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[120px_repeat(12,1fr)] gap-1 pb-2">
              <span />
              {MONTHS.map((m, i) => (
                <span key={i} className={cn("eyebrow text-center", i === today.getMonth() && "text-leaf")}>{m}</span>
              ))}
            </div>
            {PLANTING_WINDOWS.map((w) => (
              <div key={w.crop} className="grid grid-cols-[120px_repeat(12,1fr)] items-center gap-1 py-1.5">
                <span className="text-sm font-semibold text-primary">{w.crop}</span>
                {MONTHS.map((_, i) => {
                  const kind = w.harvest.includes(i) ? "harvest" : w.plant.includes(i) ? "plant" : w.sow.includes(i) ? "sow" : null;
                  return (
                    <span
                      key={i}
                      className={cn(
                        "h-6 rounded-md",
                        kind === "sow" && "bg-lime",
                        kind === "plant" && "bg-leaf",
                        kind === "harvest" && "bg-primary",
                        !kind && "bg-background",
                        i === today.getMonth() && "ring-2 ring-leaf/40",
                      )}
                    />
                  );
                })}
              </div>
            ))}
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-lime" /> Sow indoors</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-leaf" /> Plant out</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-primary" /> Harvest</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

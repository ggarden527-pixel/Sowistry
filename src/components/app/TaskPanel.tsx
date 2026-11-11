import { addDays, format, isSameDay, parseISO } from "date-fns";
import { Check, Droplets, Flower2, Scissors, ShoppingBasket, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { daysFrom, getToday, relativeDayLabel } from "@/lib/dates";
import { useGarden } from "@/lib/garden-store";
import { groupTasks, type Task, type TaskType } from "@/lib/tasks";
import { cn } from "@/lib/utils";

import { PlantThumb } from "./bits";

export const taskIcon: Record<TaskType, LucideIcon> = {
  water: Droplets,
  fertilize: Flower2,
  plant: Sprout,
  prune: Scissors,
  harvest: ShoppingBasket,
};

export function TaskItem({ task, tone = "default" }: { task: Task; tone?: "default" | "overdue" | undefined }) {
  const { toggleTask } = useGarden();
  const today = getToday();
  const d = daysFrom(task.due, today);
  const Icon = taskIcon[task.type];
  const sub =
    tone === "overdue"
      ? relativeDayLabel(d)
      : d >= 2
        ? `${format(parseISO(task.due), "EEE, MMM d")}${task.time ? ` · ${task.time}` : ""}`
        : task.time
          ? `Scheduled ${task.time}`
          : "Any time";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 transition-colors",
        tone === "overdue" && !task.done ? "border-destructive/20 bg-destructive-soft/60" : "border-border bg-card",
        task.done && "opacity-60",
      )}
    >
      {task.imageKey ? (
        <PlantThumb imageKey={task.imageKey} />
      ) : (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-primary">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-semibold text-primary", task.done && "line-through")}>{task.title}</p>
        <p className={cn("flex items-center gap-1 truncate text-xs", tone === "overdue" ? "font-semibold text-destructive" : "text-muted-foreground")}>
          <Icon className="h-3 w-3 shrink-0" /> {sub}
        </p>
      </div>
      <button
        type="button"
        onClick={() => toggleTask(task.id)}
        aria-label={task.done ? `Mark ${task.title} as not done` : `Complete ${task.title}`}
        aria-pressed={task.done}
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition",
          task.done ? "border-leaf bg-leaf text-leaf-foreground" : "border-border text-transparent hover:border-leaf hover:text-leaf",
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
    </div>
  );
}

function Group({ label, tasks, tone, empty }: { label: string; tasks: Task[]; tone?: "overdue" | undefined; empty?: string }) {
  if (!tasks.length && !empty) return null;
  return (
    <section>
      <div className="mb-2.5 flex items-center gap-3">
        <p className={cn("eyebrow", tone === "overdue" && "text-destructive")}>{label}</p>
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="space-y-2">
        {tasks.length ? tasks.map((t) => <TaskItem key={t.id} task={t} tone={tone} />) : <p className="text-sm text-muted-foreground">{empty}</p>}
      </div>
    </section>
  );
}

export function TaskPanel() {
  const { tasks } = useGarden();
  const today = getToday();
  const groups = groupTasks(tasks, today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const todayDone = groups.today.filter((t) => t.done).length;

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Task Calendar</h2>
        <Link to="/calendar" className="text-xs font-semibold text-leaf hover:underline">Open calendar</Link>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {todayDone} of {groups.today.length} done today
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {week.map((d) => {
          const count = tasks.filter((t) => !t.done && isSameDay(parseISO(t.due), d)).length;
          const isToday = isSameDay(d, today);
          return (
            <div key={d.toISOString()} className={cn("flex flex-col items-center rounded-xl py-2", isToday ? "bg-primary text-primary-foreground" : "bg-background")}>
              <span className={cn("text-[0.625rem] font-semibold uppercase", isToday ? "opacity-80" : "text-muted-foreground")}>{format(d, "EEE")}</span>
              <span className={cn("text-sm font-bold", !isToday && "text-primary")}>{format(d, "d")}</span>
              <span className={cn("mt-1 h-1 w-1 rounded-full", count ? (isToday ? "bg-lime" : "bg-leaf") : "bg-transparent")} />
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-6">
        <Group label="Overdue" tasks={groups.overdue} tone="overdue" />
        <Group label="Today" tasks={groups.today} empty="Nothing scheduled today." />
        <Group label="Tomorrow" tasks={groups.tomorrow} empty="A quiet day ahead." />
        <Group label="Coming up" tasks={groups.upcoming.slice(0, 5)} />
      </div>
    </div>
  );
}

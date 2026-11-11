import { daysFrom } from "./dates";

export type TaskType = "water" | "fertilize" | "plant" | "prune" | "harvest";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  due: string;
  time?: string | undefined;
  imageKey?: string | undefined;
  plantId?: string | undefined;
  done: boolean;
}

export const taskTypeLabel: Record<TaskType, string> = {
  water: "Watering",
  fertilize: "Fertilizing",
  plant: "Planting",
  prune: "Pruning",
  harvest: "Harvest",
};

const byTime = (a: Task, b: Task) =>
  a.due.localeCompare(b.due) || (a.time ?? "99").localeCompare(b.time ?? "99");

/**
 * Overdue = unfinished and due before today. Today/Tomorrow keep finished tasks
 * (shown checked). Upcoming = unfinished, due 2–14 days out.
 */
export function groupTasks(tasks: Task[], today: Date) {
  const overdue: Task[] = [];
  const todays: Task[] = [];
  const tomorrow: Task[] = [];
  const upcoming: Task[] = [];
  for (const t of [...tasks].sort(byTime)) {
    const d = daysFrom(t.due, today);
    if (d < 0 && !t.done) overdue.push(t);
    else if (d === 0) todays.push(t);
    else if (d === 1) tomorrow.push(t);
    else if (d >= 2 && d <= 14 && !t.done) upcoming.push(t);
  }
  return { overdue, today: todays, tomorrow, upcoming };
}

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

import type { Health, Plant, Sunlight } from "../inventory";
import type { Task, TaskType } from "../tasks";
import { localGardenRepo } from "./local";
import type {
  GardenRepository,
  GardenSnapshot,
  NewsletterRepository,
  PlannerBed,
  Profile,
} from "./types";

type Db = SupabaseClient<Database>;
type Row<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
type Insert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

// --- Row <-> app shape mapping ----------------------------------------------

export const plantToRow = (userId: string, p: Plant): Insert<"plants"> => ({
  user_id: userId,
  id: p.id,
  name: p.name,
  species: p.species,
  image_key: p.imageKey,
  location: p.location,
  last_watered: p.lastWatered,
  water_every_days: p.waterEveryDays,
  sunlight: p.sunlight,
  last_fertilized: p.lastFertilized,
  fertilize_every_days: p.fertilizeEveryDays,
  health: p.health,
});

const rowToPlant = (r: Row<"plants">): Plant => ({
  id: r.id,
  name: r.name,
  species: r.species,
  imageKey: r.image_key,
  location: r.location,
  lastWatered: r.last_watered,
  waterEveryDays: r.water_every_days,
  sunlight: r.sunlight as Sunlight,
  lastFertilized: r.last_fertilized,
  fertilizeEveryDays: r.fertilize_every_days,
  health: r.health as Health,
});

export const taskToRow = (userId: string, t: Task): Insert<"tasks"> => ({
  user_id: userId,
  id: t.id,
  title: t.title,
  type: t.type,
  due: t.due,
  time: t.time ?? null,
  image_key: t.imageKey ?? null,
  plant_id: t.plantId ?? null,
  done: t.done,
});

const rowToTask = (r: Row<"tasks">): Task => ({
  id: r.id,
  title: r.title,
  type: r.type as TaskType,
  due: r.due,
  done: r.done,
  ...(r.time ? { time: r.time } : {}),
  ...(r.image_key ? { imageKey: r.image_key } : {}),
  ...(r.plant_id ? { plantId: r.plant_id } : {}),
});

const profileToRow = (userId: string, p: Profile): Insert<"profiles"> => ({
  id: userId,
  display_name: p.displayName.slice(0, 120),
  avatar_url: p.avatarUrl,
  location: p.location.slice(0, 120),
  zone: p.zone.slice(0, 20),
  units: p.units,
  notify_watering: p.notifyWatering,
  notify_planting: p.notifyPlanting,
  weekly_digest: p.weeklyDigest,
});

const rowToProfile = (r: Row<"profiles">): Profile => ({
  displayName: r.display_name,
  avatarUrl: r.avatar_url,
  location: r.location,
  zone: r.zone,
  units: r.units === "metric" ? "metric" : "imperial",
  notifyWatering: r.notify_watering,
  notifyPlanting: r.notify_planting,
  weeklyDigest: r.weekly_digest,
});

// --- Repository ---------------------------------------------------------------

/**
 * Garden storage in the gardener's own Supabase tables (profiles, plants, tasks, planner_beds).
 * Writes are row-level upserts, so saving one plant never touches the others. Row-level security
 * limits every query to the signed-in user; the explicit user_id filters are defence in depth.
 */
export function createSupabaseGardenRepo(client: Db): GardenRepository {
  const upsertPlants = async (userId: string, plants: Plant[]) => {
    if (!plants.length) return;
    const { error } = await client
      .from("plants")
      .upsert(plants.map((p) => plantToRow(userId, p)), { onConflict: "user_id,id" });
    if (error) throw error;
  };
  const upsertTasks = async (userId: string, tasks: Task[]) => {
    if (!tasks.length) return;
    const { error } = await client
      .from("tasks")
      .upsert(tasks.map((t) => taskToRow(userId, t)), { onConflict: "user_id,id" });
    if (error) throw error;
  };
  const upsertProfile = async (userId: string, profile: Profile) => {
    const { error } = await client
      .from("profiles")
      .upsert(profileToRow(userId, profile), { onConflict: "id" });
    if (error) throw error;
  };
  const upsertBed = async (userId: string, bed: PlannerBed) => {
    const { error } = await client
      .from("planner_beds")
      .upsert({ user_id: userId, rows: bed.rows, cols: bed.cols, cells: bed.cells }, { onConflict: "user_id" });
    if (error) throw error;
  };

  return {
    async load(userId): Promise<GardenSnapshot> {
      const [profileRes, plantsRes, tasksRes] = await Promise.all([
        client.from("profiles").select("*").eq("id", userId).maybeSingle(),
        client.from("plants").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        client.from("tasks").select("*").eq("user_id", userId).order("due"),
      ]);
      if (profileRes.error) throw profileRes.error;
      if (plantsRes.error) throw plantsRes.error;
      if (tasksRes.error) throw tasksRes.error;

      const snapshot: GardenSnapshot = {
        plants: (plantsRes.data ?? []).map(rowToPlant),
        tasks: (tasksRes.data ?? []).map(rowToTask),
        profile: profileRes.data ? rowToProfile(profileRes.data) : null,
      };
      if (snapshot.plants.length || snapshot.tasks.length) return snapshot;

      // First sign-in on a device that was used in preview mode: move that garden into the account.
      const local = await localGardenRepo.load(userId);
      if (!local.plants.length && !local.tasks.length) return snapshot;
      await Promise.all([upsertPlants(userId, local.plants), upsertTasks(userId, local.tasks)]);
      return { ...snapshot, plants: local.plants, tasks: local.tasks };
    },
    savePlants: upsertPlants,
    async deletePlant(userId, plantId) {
      const { error } = await client.from("plants").delete().eq("user_id", userId).eq("id", plantId);
      if (error) throw error;
    },
    saveTasks: upsertTasks,
    saveProfile: upsertProfile,
    async loadBed(userId) {
      const { data, error } = await client
        .from("planner_beds")
        .select("rows,cols,cells")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { rows: data.rows, cols: data.cols, cells: data.cells as (string | null)[] };
    },
    saveBed: upsertBed,
  };
}

/** Newsletter sign-ups go into a write-only table: visitors can add an email but never read the list. */
export function createSupabaseNewsletterRepo(client: Db): NewsletterRepository {
  return {
    async subscribe(email) {
      const { error } = await client.from("newsletter_subscribers").insert({ email });
      // Already on the list counts as subscribed, without revealing that the address exists.
      if (error && error.code !== "23505") throw error;
      return "subscribed";
    },
  };
}

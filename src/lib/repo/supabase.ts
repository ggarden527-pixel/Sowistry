import type { SupabaseClient } from "@supabase/supabase-js";

import type { Plant } from "../inventory";
import type { Task } from "../tasks";
import { localGardenRepo } from "./local";
import type { GardenRepository, GardenSnapshot, PlannerBed, Profile } from "./types";

interface GardenRow {
  plants: Plant[] | null;
  tasks: Task[] | null;
  profile: Profile | null;
  planner_bed: PlannerBed | null;
}

async function loadRow(client: SupabaseClient, userId: string): Promise<GardenRow | null> {
  const { data, error } = await client
    .from("user_gardens")
    .select("plants,tasks,profile,planner_bed")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as GardenRow | null;
}

async function saveFields(
  client: SupabaseClient,
  userId: string,
  fields: Partial<GardenRow>,
): Promise<void> {
  const { error } = await client
    .from("user_gardens")
    .upsert({ user_id: userId, ...fields }, { onConflict: "user_id" });

  if (error) throw error;
}

export function createSupabaseGardenRepo(client: SupabaseClient): GardenRepository {
  return {
    async load(userId): Promise<GardenSnapshot> {
      const row = await loadRow(client, userId);
      if (row) {
        return {
          plants: row.plants ?? [],
          tasks: row.tasks ?? [],
          profile: row.profile ?? null,
        };
      }

      const [local, plannerBed] = await Promise.all([
        localGardenRepo.load(userId),
        localGardenRepo.loadBed(userId),
      ]);
      if (local.plants.length || local.tasks.length || local.profile || plannerBed) {
        await saveFields(client, userId, {
          ...local,
          ...(plannerBed ? { planner_bed: plannerBed } : {}),
        });
      }
      return local;
    },
    savePlants(userId, plants: Plant[]) {
      return saveFields(client, userId, { plants });
    },
    async deletePlant(userId, plantId) {
      const row = await loadRow(client, userId);
      await saveFields(client, userId, {
        plants: (row?.plants ?? []).filter((plant) => plant.id !== plantId),
      });
    },
    saveTasks(userId, tasks: Task[]) {
      return saveFields(client, userId, { tasks });
    },
    saveProfile(userId, profile: Profile) {
      return saveFields(client, userId, { profile });
    },
    async loadBed(userId) {
      const row = await loadRow(client, userId);
      return row?.planner_bed ?? (await localGardenRepo.loadBed(userId));
    },
    saveBed(userId, bed: PlannerBed) {
      return saveFields(client, userId, { planner_bed: bed });
    },
  };
}

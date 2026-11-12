import type { Plant } from "../inventory";
import type { Task } from "../tasks";

export interface Profile {
  displayName: string;
  avatarUrl: string | null;
  location: string;
  zone: string;
  units: "imperial" | "metric";
  notifyWatering: boolean;
  notifyPlanting: boolean;
  weeklyDigest: boolean;
}

export interface PlannerBed {
  rows: number;
  cols: number;
  cells: (string | null)[];
}

export interface GardenSnapshot {
  plants: Plant[];
  tasks: Task[];
  profile: Profile | null;
}

/**
 * Per-user garden storage. Every call is scoped to one user id; implementations must never return
 * another user's rows. Shapes mirror the planned tables: profiles, plants, tasks, planner_beds.
 */
export interface GardenRepository {
  load(userId: string): Promise<GardenSnapshot>;
  savePlants(userId: string, plants: Plant[]): Promise<void>;
  deletePlant(userId: string, plantId: string): Promise<void>;
  saveTasks(userId: string, tasks: Task[]): Promise<void>;
  saveProfile(userId: string, profile: Profile): Promise<void>;
  loadBed(userId: string): Promise<PlannerBed | null>;
  saveBed(userId: string, bed: PlannerBed): Promise<void>;
}

export interface NewsletterRepository {
  /** "unavailable" means sign-ups can't be stored yet (no database connected). */
  subscribe(email: string): Promise<"subscribed" | "unavailable">;
}

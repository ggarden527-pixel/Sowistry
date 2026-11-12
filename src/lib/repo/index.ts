import { supabaseClient } from "../auth/supabase";
import { localGardenRepo, localNewsletterRepo } from "./local";
import { createSupabaseGardenRepo } from "./supabase";
import type { GardenRepository, NewsletterRepository } from "./types";

export * from "./types";

/** The single switch between storage backends; becomes the Supabase repository once connected. */
export const gardenRepo: GardenRepository = supabaseClient
  ? createSupabaseGardenRepo(supabaseClient)
  : localGardenRepo;
export const newsletterRepo: NewsletterRepository = localNewsletterRepo;

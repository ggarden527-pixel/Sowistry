import { supabaseClient } from "../auth/supabase";
import { localGardenRepo, localNewsletterRepo } from "./local";
import { createSupabaseGardenRepo, createSupabaseNewsletterRepo } from "./supabase";
import type { GardenRepository, NewsletterRepository } from "./types";

export * from "./types";

/** The single switch between storage backends: Supabase when connected, this device otherwise. */
export const gardenRepo: GardenRepository = supabaseClient
  ? createSupabaseGardenRepo(supabaseClient)
  : localGardenRepo;
export const newsletterRepo: NewsletterRepository = supabaseClient
  ? createSupabaseNewsletterRepo(supabaseClient)
  : localNewsletterRepo;

import { localGardenRepo, localNewsletterRepo } from "./local";
import type { GardenRepository, NewsletterRepository } from "./types";

export * from "./types";

/** The single switch between storage backends; becomes the Supabase repository once connected. */
export const gardenRepo: GardenRepository = localGardenRepo;
export const newsletterRepo: NewsletterRepository = localNewsletterRepo;

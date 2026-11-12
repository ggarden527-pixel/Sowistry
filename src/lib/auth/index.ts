import { previewAuth } from "./preview";
import { supabaseAuth } from "./supabase";
import type { AuthBackend } from "./types";

export * from "./types";

/**
 * The single switch between identity backends. Until the Supabase project is connected this is the
 * device-only preview backend; afterwards it becomes the Supabase backend.
 */
export const auth: AuthBackend = supabaseAuth ?? previewAuth;

/** Only allow same-site paths as post-sign-in destinations (blocks "//evil.com" and full URLs). */
export function safeRedirect(target: unknown, fallback = "/dashboard"): string {
  if (typeof target !== "string") return fallback;
  if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return fallback;
  }
  if (target.startsWith("/auth") || target.startsWith("/reset-password")) return fallback;
  return target;
}

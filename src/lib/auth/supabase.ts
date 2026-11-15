import type { SupabaseClient, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

import type { AuthBackend, AuthUser, OAuthProvider } from "./types";

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;

  const metadata = user.user_metadata;
  const email = user.email ?? "";
  const name = metadata["full_name"] ?? metadata["name"] ?? email.split("@")[0] ?? "Gardener";

  return {
    id: user.id,
    email,
    name: typeof name === "string" && name.trim() ? name : "Gardener",
    avatarUrl:
      typeof metadata["avatar_url"] === "string"
        ? metadata["avatar_url"]
        : typeof metadata["picture"] === "string"
          ? metadata["picture"]
          : null,
  };
}

const PROVIDER_NAMES: Record<OAuthProvider, string> = { google: "Google", apple: "Apple" };

/** Asks Supabase which sign-in providers are switched on, so a disabled one never opens a raw error page. */
export function createProviderCheck(url: string, key: string) {
  return async (provider: OAuthProvider): Promise<boolean> => {
    try {
      const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
      if (!res.ok) return true; // can't tell — let Supabase decide
      const settings = (await res.json()) as { external?: Record<string, boolean> };
      return settings.external?.[provider] === true;
    } catch {
      return true;
    }
  };
}

export function createSupabaseAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: SupabaseClient<any>,
  isProviderEnabled?: (provider: OAuthProvider) => Promise<boolean>,
): AuthBackend {
  return {
    kind: "supabase",
    async getUser() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return mapUser(data.session?.user ?? null);
    },
    onChange(cb) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        cb(mapUser(session?.user ?? null));
      });
      return () => data.subscription.unsubscribe();
    },
    async signInWithPassword(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signUp({ email, password, name }) {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
      return { needsEmailConfirmation: !data.session };
    },
    async signInWithOAuth(provider: OAuthProvider, returnTo: string) {
      if (isProviderEnabled && !(await isProviderEnabled(provider))) {
        throw new Error(
          `Signing in with ${PROVIDER_NAMES[provider]} isn't available yet. Please use your email and password for now.`,
        );
      }
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo: returnTo },
      });
      if (error) throw error;
    },
    async sendPasswordReset(email) {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
    async updatePassword(password) {
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
  };
}

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"]?.trim();
const supabaseKey =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]?.trim() ||
  import.meta.env["VITE_SUPABASE_ANON_KEY"]?.trim();

/** The project's one Supabase client (shared with storage), or null when no project is connected. */
export const supabaseClient: SupabaseClient<Database> | null =
  supabaseUrl && supabaseKey ? supabase : null;

export const supabaseAuth: AuthBackend | null = supabaseClient
  ? createSupabaseAuth(supabaseClient, createProviderCheck(supabaseUrl!, supabaseKey!))
  : null;

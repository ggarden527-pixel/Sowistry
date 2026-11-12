import { createClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSupabaseAuth } from "@/lib/auth/supabase";

const client = createClient("https://example.supabase.co", "test-publishable-key", {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});
const auth = createSupabaseAuth(client);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Supabase authentication", () => {
  it("sends email/password credentials to Supabase", async () => {
    const signIn = vi
      .spyOn(client.auth, "signInWithPassword")
      .mockRejectedValue(new Error("Expected test error"));

    await expect(auth.signInWithPassword("gardener@example.com", "garden-pass")).rejects.toThrow(
      "Expected test error",
    );
    expect(signIn).toHaveBeenCalledWith({
      email: "gardener@example.com",
      password: "garden-pass",
    });
  });

  it.each(["google", "apple"] as const)("requests OAuth with %s", async (provider) => {
    const signIn = vi
      .spyOn(client.auth, "signInWithOAuth")
      .mockRejectedValue(new Error("Expected test error"));
    const returnTo = "https://sowistry.example/auth?redirect=%2Fdashboard";

    await expect(auth.signInWithOAuth(provider, returnTo)).rejects.toThrow("Expected test error");
    expect(signIn).toHaveBeenCalledWith({
      provider,
      options: { redirectTo: returnTo },
    });
  });

  it("creates email accounts with a confirmation redirect and name metadata", async () => {
    const signUp = vi
      .spyOn(client.auth, "signUp")
      .mockRejectedValue(new Error("Expected test error"));

    await expect(
      auth.signUp({
        email: "gardener@example.com",
        password: "garden-pass",
        name: "Gardener",
      }),
    ).rejects.toThrow("Expected test error");
    expect(signUp).toHaveBeenCalledWith({
      email: "gardener@example.com",
      password: "garden-pass",
      options: {
        data: { full_name: "Gardener" },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
  });
});

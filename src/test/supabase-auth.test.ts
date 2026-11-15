import { createClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createProviderCheck, createSupabaseAuth } from "@/lib/auth/supabase";

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

  it("shows a friendly message instead of leaving the site when a provider is switched off", async () => {
    const signIn = vi.spyOn(client.auth, "signInWithOAuth");
    const guarded = createSupabaseAuth(client, async () => false);

    await expect(guarded.signInWithOAuth("google", "https://sowistry.example/auth")).rejects.toThrow(
      "Signing in with Google isn't available yet",
    );
    expect(signIn).not.toHaveBeenCalled();
  });

  it("reads which providers are switched on from Supabase settings", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ external: { email: true, google: false, apple: true } })),
    );
    const check = createProviderCheck("https://example.supabase.co", "key");
    expect(await check("google")).toBe(false);
    expect(await check("apple")).toBe(true);
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

  it("sends password-reset links to the reset-password page", async () => {
    const reset = vi
      .spyOn(client.auth, "resetPasswordForEmail")
      .mockResolvedValue({ data: {}, error: null });

    await auth.sendPasswordReset("gardener@example.com");
    expect(reset).toHaveBeenCalledWith("gardener@example.com", {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  });
});

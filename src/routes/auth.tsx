import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Logo } from "@/components/app/Logo";
import { AppleIcon, GoogleIcon } from "@/components/auth/ProviderIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, safeRedirect, type OAuthProvider } from "@/lib/auth";
import { useAuth } from "@/lib/auth/context";

type Search = { mode?: "signin" | "signup"; redirect?: string };

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...(s["mode"] === "signup" || s["mode"] === "signin" ? { mode: s["mode"] } : {}),
    ...(typeof s["redirect"] === "string" ? { redirect: s["redirect"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Sowistry" },
      {
        name: "description",
        content: "Sign in or create your Sowistry account to manage your garden.",
      },
      { property: "og:title", content: "Sign in — Sowistry" },
      { property: "og:description", content: "Sign in or create your Sowistry account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; tone: "error" | "info" } | null>(null);
  const [busy, setBusy] = useState(false);
  const dest = safeRedirect(search.redirect);

  useEffect(() => {
    if (user) void router.navigate({ href: dest, replace: true });
  }, [user, dest, router]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
    } catch (e) {
      setMessage({
        text: e instanceof Error ? e.message : "Something went wrong. Please try again.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      if (mode === "signin") return auth.signInWithPassword(email.trim(), password);
      const r = await auth.signUp({ email: email.trim(), password, name: name.trim() });
      if (r.needsEmailConfirmation)
        setMessage({
          text: "Check your email to confirm your account, then sign in.",
          tone: "info",
        });
    });
  };
  const forgot = () => {
    const value = email.trim();
    if (!value) {
      setMessage({
        text: "Enter your email above, then tap “Forgot password?” again.",
        tone: "error",
      });
      return;
    }
    void run(async () => {
      await auth.sendPasswordReset(value);
      setMessage({ text: `If ${value} has an account, a reset link is on its way.`, tone: "info" });
    });
  };
  const oauth = (p: OAuthProvider) => {
    const returnTo = new URL("/auth", window.location.origin);
    returnTo.searchParams.set("redirect", dest);
    void run(() => auth.signInWithOAuth(p, returnTo.toString()));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="surface w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-8 font-display text-3xl font-semibold">
          {mode === "signin" ? "Welcome back" : "Create your garden"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to see your plants and tasks."
            : "Start tracking your plants in minutes."}
        </p>

        {auth.kind === "preview" && (
          <div className="mt-6 rounded-xl border border-border bg-secondary p-4 text-sm">
            <p className="font-semibold text-primary">Accounts aren't switched on yet</p>
            <p className="mt-1 text-muted-foreground">
              Until the database is connected you can explore in preview mode. Your garden stays on
              this device.
            </p>
            <div className="mt-3 flex gap-2">
              <Input
                aria-label="Your name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                type="button"
                variant="leaf"
                onClick={() =>
                  void run(() => auth.startPreviewSession?.(name) ?? Promise.resolve())
                }
              >
                Explore
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={busy}
            onClick={() => oauth("google")}
          >
            <GoogleIcon className="h-5 w-5" /> Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={busy}
            onClick={() => oauth("apple")}
          >
            <AppleIcon className="h-5 w-5" /> Continue with Apple
          </Button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === "signin" && auth.kind === "supabase" && (
                <button
                  type="button"
                  className="text-xs font-semibold text-leaf hover:underline"
                  onClick={forgot}
                  disabled={busy}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {message && (
            <p
              role="status"
              className={
                message.tone === "error" ? "text-sm text-destructive" : "text-sm text-primary"
              }
            >
              {message.text}
            </p>
          )}
          <Button type="submit" variant="leaf" size="lg" className="w-full" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-leaf hover:underline"
          onClick={() => {
            setMessage(null);
            setMode(mode === "signin" ? "signup" : "signin");
          }}
        >
          {mode === "signin"
            ? "New to Sowistry? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

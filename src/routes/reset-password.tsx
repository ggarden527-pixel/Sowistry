import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { Logo } from "@/components/app/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth";
import { useAuth } from "@/lib/auth/context";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Choose a new password — Sowistry" },
      { name: "description", content: "Set a new password for your Sowistry account." },
      { property: "og:title", content: "Choose a new password — Sowistry" },
      { property: "og:description", content: "Set a new password for your Sowistry account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  // The emailed link signs the gardener in for this one purpose; no session means the link expired.
  const { user, ready } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    setError(null);
    try {
      await auth.updatePassword(password);
      await router.navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="surface w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-8 font-display text-3xl font-semibold">Choose a new password</h1>
        {!ready ? (
          <p className="mt-2 text-sm text-muted-foreground">Checking your reset link…</p>
        ) : !user ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              This reset link has expired or was already used. Request a new one from the sign-in page.
            </p>
            <Button asChild variant="leaf" size="lg" className="mt-6 w-full">
              <Link to="/auth" search={{ mode: "signin" }}>Back to sign in</Link>
            </Button>
          </>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">For {user.email}</p>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="leaf" size="lg" className="w-full" disabled={busy}>
              Save new password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

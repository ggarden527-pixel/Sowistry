import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { newsletterRepo } from "@/lib/repo";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value) || value.length > 254) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const result = await newsletterRepo.subscribe(value);
      if (result === "subscribed") {
        setDone(true);
        setEmail("");
      } else {
        toast("Newsletter sign-ups open very soon", {
          description: "We're not collecting emails just yet — please check back.",
        });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <p className="rounded-xl bg-primary-foreground/10 px-4 py-3 text-sm font-semibold">
        You're on the list — look out for your first seasonal letter.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-2 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="newsletter-email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-12 w-full rounded-xl border border-transparent bg-card pl-10 pr-3 text-sm text-foreground outline-none focus:border-leaf"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={busy}
        className="h-12 bg-lime text-primary hover:bg-lime/90"
      >
        {busy ? "Joining…" : "Join the newsletter"}
      </Button>
    </form>
  );
}

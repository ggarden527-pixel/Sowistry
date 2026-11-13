import { Link } from "@tanstack/react-router";
import { BookOpen, Calculator, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGarden } from "@/lib/garden-store";

/** First-run screen for a gardener whose account has no plants or tasks yet. */
export function WelcomeGarden() {
  const { settings, setAddPlantOpen, loadSampleGarden } = useGarden();
  const firstName = settings.name.trim().split(/\s+/)[0];

  const steps = [
    {
      icon: Plus,
      title: "Add your first plant",
      body: "Name it, pick a spot and set how often it needs water. We'll keep track from there.",
      action: (
        <Button variant="leaf" onClick={() => setAddPlantOpen(true)}>
          <Plus className="h-4 w-4" /> Add a plant
        </Button>
      ),
    },
    {
      icon: BookOpen,
      title: "Find plants in the library",
      body: "Browse care details for popular herbs, vegetables and houseplants, then add them in one tap.",
      action: (
        <Button asChild variant="outline">
          <Link to="/library">Open the library</Link>
        </Button>
      ),
    },
    {
      icon: Calculator,
      title: "Try a gardening tool",
      body: "Work out soil for a raised bed, seed-starting dates or how much to water.",
      action: (
        <Button asChild variant="outline">
          <Link to="/tools">See the tools</Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <section className="surface leaf-pattern p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-leaf">Welcome to Sowistry</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-[2.5rem] sm:leading-[1.1]">
          {firstName ? `Let's plant your garden, ${firstName}` : "Let's plant your garden"}
        </h1>
        <p className="mt-3 max-w-2xl text-[0.95rem] text-muted-foreground">
          Your garden is empty for now. Add the plants you're growing and Sowistry will remind you when
          they need water, food and care — all in one place.
        </p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.title} className="surface flex flex-col p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-leaf">
              <s.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-bold text-primary">{s.title}</h2>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            <div className="mt-5">{s.action}</div>
          </div>
        ))}
      </div>

      <div className="surface mt-4 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lime text-primary">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-primary">Just looking around?</p>
          <p className="text-sm text-muted-foreground">
            Load a sample garden of 12 plants with a week of tasks. You can remove any of them later.
          </p>
        </div>
        <Button variant="soft" onClick={loadSampleGarden}>Load a sample garden</Button>
      </div>
    </div>
  );
}

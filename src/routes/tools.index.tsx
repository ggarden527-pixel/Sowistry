import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { TOOLS } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/bits";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "Gardening Tools — Sowistry" },
      { name: "description", content: "Soil, seed starting and watering calculators plus a square-foot garden planner." },
      { property: "og:title", content: "Gardening Tools — Sowistry" },
      { property: "og:description", content: "Soil, seed starting and watering calculators plus a garden planner." },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Gardening Tools" subtitle="Quick, reliable calculators to take the guesswork out of growing." />
      <div className="grid gap-5 sm:grid-cols-2">
        {TOOLS.map((t, i) => (
          <Link
            key={t.to}
            to={t.to}
            className="surface leaf-pattern group flex flex-col p-6 transition-shadow hover:shadow-lift"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
              <t.icon className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold">{t.title}</h2>
            <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{t.blurb}</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf">
              Open tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

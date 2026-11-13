import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck2,
  Droplets,
  HeartPulse,
  Leaf,
  Sprout,
  Sun,
  TrendingUp,
  Wind,
} from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/app/bits";
import { PlantTable } from "@/components/app/PlantTable";
import { StatCard } from "@/components/app/StatCard";
import { TaskPanel } from "@/components/app/TaskPanel";
import { WelcomeGarden } from "@/components/app/WelcomeGarden";
import { Progress } from "@/components/ui/progress";
import { daysFrom, getToday } from "@/lib/dates";
import { useGarden } from "@/lib/garden-store";
import { gardenHealthScore, needsWater } from "@/lib/inventory";

export const Route = createFileRoute("/_authenticated/dashboard")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Garden Dashboard — Sowistry" },
      {
        name: "description",
        content:
          "Your garden at a glance: plants needing water, upcoming planting tasks and overall garden health.",
      },
      { property: "og:title", content: "Garden Dashboard — Sowistry" },
      {
        property: "og:description",
        content:
          "Plants needing water, upcoming planting tasks and overall garden health at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

const seasonalTips = [
  "Mulch beds now to protect roots before the first frost.",
  "Sow broad beans and garlic for an early spring harvest.",
  "Plan next year's beds while this season's lessons are fresh.",
  "Start tomatoes and peppers indoors under bright light.",
  "Feed perennials as new growth appears.",
  "Succession-sow lettuce every two weeks.",
  "Water deeply in the early morning during hot spells.",
  "Harvest herbs often to keep them bushy.",
  "Save seeds from your best-performing plants.",
  "Sow cool-season greens for an autumn harvest.",
  "Plant garlic cloves pointy side up, 2 inches deep.",
  "Mulch beds before the first frost and clean your tools.",
];

function Dashboard() {
  const { ready, plants, tasks } = useGarden();
  if (!ready)
    return <p className="py-20 text-center text-sm text-muted-foreground">Loading your garden…</p>;
  if (!plants.length && !tasks.length) return <WelcomeGarden />;
  return <GardenOverview />;
}

function GardenOverview() {
  const { plants, tasks } = useGarden();
  const today = getToday();
  const thirsty = plants.filter((p) => needsWater(p, today));
  const planting = tasks.filter(
    (t) =>
      t.type === "plant" && !t.done && daysFrom(t.due, today) >= 0 && daysFrom(t.due, today) <= 30,
  );
  const nextPlanting = [...planting].sort((a, b) => a.due.localeCompare(b.due))[0];
  const health = gardenHealthScore(plants);
  const attention = plants.filter((p) => p.health === "Needs Attention" || p.health === "At Risk");
  const waterPct = plants.length ? Math.round((thirsty.length / plants.length) * 100) : 0;

  const insights = [
    {
      icon: Droplets,
      title: thirsty.length ? `${thirsty.length} plants are thirsty` : "Everyone's hydrated",
      body: thirsty.length
        ? `${thirsty
            .slice(0, 3)
            .map((p) => p.name.split(" '")[0])
            .join(
              ", ",
            )}${thirsty.length > 3 ? " and more" : ""} need water today. Early morning is best.`
        : "No plants need water today. Check back tomorrow morning.",
      to: "/garden" as const,
      cta: "Water now",
    },
    {
      icon: Leaf,
      title: attention.length
        ? `${attention.length} plants need extra care`
        : "Garden looking strong",
      body: attention[0]
        ? `${attention[0].name} is marked “${attention[0].health}”. Check for dry soil, pests or too little light.`
        : "Every plant is healthy or thriving. Keep up the routine.",
      to: "/guides" as const,
      cta: "Read care guides",
    },
    {
      icon: Wind,
      title: "This month in the garden",
      body: seasonalTips[today.getMonth()],
      to: "/calendar" as const,
      cta: "See planting calendar",
    },
  ];

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <PageHeader
          title="Your Garden Dashboard"
          subtitle="Everything your garden needs to grow beautifully."
        />

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            label="Total plants"
            value={plants.length}
            icon={Sprout}
            footer={
              <span className="text-muted-foreground">
                Across {new Set(plants.map((p) => p.location)).size} garden spaces
              </span>
            }
          />
          <StatCard
            label="Needing water"
            value={thirsty.length}
            icon={Droplets}
            footer={
              <div className="flex items-center gap-3">
                <Progress value={waterPct} className="h-1.5 bg-secondary [&>div]:bg-leaf" />
                <span className="shrink-0 font-semibold text-primary">{waterPct}%</span>
              </div>
            }
          />
          <StatCard
            label="Planting tasks"
            value={planting.length}
            icon={CalendarCheck2}
            footer={
              nextPlanting ? (
                <span className="inline-flex rounded-md bg-accent px-2 py-1 font-semibold text-primary">
                  Next: {nextPlanting.title}
                </span>
              ) : (
                <span className="text-muted-foreground">Nothing in the next 30 days</span>
              )
            }
          />
          <StatCard
            label="Garden health"
            value={`${health}%`}
            icon={HeartPulse}
            footer={
              <span className="inline-flex items-center gap-1 font-semibold text-leaf">
                <TrendingUp className="h-3.5 w-3.5" /> {plants.length - attention.length} of{" "}
                {plants.length} plants healthy
              </span>
            }
          />
        </div>

        <section className="mt-10">
          <SectionTitle title="My Garden">
            <Link
              to="/garden"
              search={{}}
              className="inline-flex items-center gap-1 text-sm font-semibold text-leaf hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </SectionTitle>
          <PlantTable pageSize={5} />
        </section>

        <section className="mt-10">
          <SectionTitle title="Gardening Insights" />
          <div className="grid gap-4 md:grid-cols-3">
            {insights.map((i) => (
              <div key={i.title} className="surface leaf-pattern flex flex-col p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-card text-leaf shadow-card">
                  <i.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[0.95rem] font-bold">{i.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {i.body}
                </p>
                <Link
                  to={i.to}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-leaf"
                >
                  {i.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          <div className="surface mt-4 flex flex-col gap-4 bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime text-primary">
              <Sun className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold text-primary-foreground">
                Not sure how much to water?
              </p>
              <p className="text-sm opacity-80">
                Our watering calculator factors in your soil, weather and recent rainfall.
              </p>
            </div>
            <Link
              to="/tools/watering"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-lime px-4 text-sm font-semibold text-primary hover:brightness-95"
            >
              Try the calculator <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>

      <aside className="xl:sticky xl:top-[6.5rem] xl:self-start">
        <TaskPanel />
      </aside>
    </div>
  );
}

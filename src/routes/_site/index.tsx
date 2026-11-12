import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  Clock,
  Droplets,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  Leaf,
  Sprout,
  Sun,
  type LucideIcon,
} from "lucide-react";

import heroImage from "@/assets/home/hero-garden.jpg";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { Button } from "@/components/ui/button";
import { GUIDES, LIBRARY } from "@/lib/data";
import { plantImage } from "@/lib/plant-images";
import { cropsForMonth, SEASONAL_ADVICE } from "@/lib/seasonal";

const SITE = "https://sowistry.lovable.app";
const TITLE = "Sowistry — Gardening Tools, Plant Guides & Garden Planner";
const DESCRIPTION =
  "Grow with confidence: free plant guides, a plant library, soil, seed and watering calculators, and a personal garden dashboard with care reminders.";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", name: "Sowistry", url: `${SITE}/`, description: DESCRIPTION },
            { "@type": "Organization", name: "Sowistry", url: `${SITE}/`, slogan: "Grow naturally. Grow confidently." },
          ],
        }),
      },
    ],
  }),
  component: HomePage,
});

type Tool = { title: string; blurb: string; icon: LucideIcon; to: "/garden" | "/calendar" | "/tools/soil" | "/tools/seed-starting" | "/tools/watering" | "/tools/planner" };

const TOOLS: Tool[] = [
  { title: "Plant tracker", blurb: "Every plant, its spot, light and health — with watering and feeding worked out for you.", icon: Sprout, to: "/garden" },
  { title: "Planting calendar", blurb: "A month-by-month view of sowing, feeding, pruning and harvest tasks.", icon: CalendarDays, to: "/calendar" },
  { title: "Soil calculator", blurb: "Exactly how much soil and compost your raised beds and containers need.", icon: FlaskConical, to: "/tools/soil" },
  { title: "Seed starting", blurb: "When to sow indoors, when to plant out, and how many seeds to start.", icon: Leaf, to: "/tools/seed-starting" },
  { title: "Watering calculator", blurb: "Weekly water needs from your plants, soil, weather and recent rain.", icon: Droplets, to: "/tools/watering" },
  { title: "Garden planner", blurb: "Lay out beds square by square and see how many plants will fit.", icon: LayoutGrid, to: "/tools/planner" },
];

const STEPS = [
  { icon: Sprout, title: "Add your plants", body: "Pick from the Plant Library or add your own — indoors, on the balcony or in raised beds." },
  { icon: BellRing, title: "Get gentle reminders", body: "Sowistry schedules watering, feeding and planting tasks so nothing slips." },
  { icon: HeartPulse, title: "Grow with confidence", body: "Track plant health, follow practical guides and watch your garden thrive." },
];

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="eyebrow text-leaf">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-[2.6rem]">{title}</h2>
      {body && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{body}</p>}
    </div>
  );
}

function HomePage() {
  const month = new Date().getMonth();
  const season = SEASONAL_ADVICE[month]!;
  const crops = cropsForMonth(month);
  const featured = GUIDES.slice(0, 3);
  const popular = LIBRARY.filter((p) => ["tomato", "basil", "monstera", "strawberry"].includes(p.imageKey));

  return (
    <>
      {/* Hero */}
      <section className="leaf-pattern relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:pb-28 lg:pt-20">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-primary shadow-card">
              <Leaf className="h-3.5 w-3.5 text-leaf" /> Your gardening companion, every season
            </span>
            <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl lg:text-[4.25rem]">
              Grow a garden you're proud of.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Sowistry brings your plants, watering, planting dates and care guides together — so you always know what your garden needs next.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="leaf" size="lg" className="h-12 px-7 text-[0.95rem]">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 bg-card px-7 text-[0.95rem]">
                <Link to="/auth" search={{}}>Sign in</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Watering reminders", "Planting calendar", "Smart calculators"].map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-leaf" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="overflow-hidden rounded-[2rem] border border-border shadow-lift">
              <img src={heroImage} alt="Raised wooden beds full of tomatoes, basil, lettuce and lavender in morning light" width={1600} height={1200} className="aspect-[4/3] h-full w-full object-cover" fetchPriority="high" />
            </div>
            <div aria-hidden className="surface absolute -bottom-6 left-4 flex items-center gap-3 p-3 pr-5 sm:-left-8">
              <img src={plantImage("basil")} alt="" className="h-11 w-11 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-semibold text-primary">Water Sweet Basil</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><Droplets className="h-3 w-3 text-water" /> Today · 08:00</p>
              </div>
            </div>
            <div aria-hidden className="surface absolute -top-5 right-4 hidden items-center gap-3 p-3 pr-5 sm:flex lg:-right-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary"><Sun className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold text-primary">Full sun · every 2 days</p>
                <p className="text-xs text-muted-foreground">Cherry tomato care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="scroll-mt-24 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Gardening tools"
            title="Everything your garden needs, in one place"
            body="Calculators and planners that take the guesswork out of growing. Create an account to save your garden and use every tool."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <Link key={t.title} to={t.to} className="surface group flex flex-col p-6 transition-shadow hover:shadow-lift">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary transition-colors group-hover:bg-leaf group-hover:text-leaf-foreground">
                  <t.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{t.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t.blurb}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-leaf">
                  Open tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-primary py-20 text-primary-foreground lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <p className="eyebrow text-lime">How it works</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-primary-foreground sm:text-[2.6rem]">
                A calm dashboard for a busy garden.
              </h2>
              <p className="mt-4 max-w-md leading-relaxed opacity-80">
                Your personal dashboard shows which plants are thirsty, what's due today and how your garden is doing overall.
              </p>
              <Button asChild size="lg" className="mt-8 h-12 bg-lime px-7 text-primary hover:bg-lime/90">
                <Link to="/auth" search={{ mode: "signup" }}>Create your garden <ArrowRight /></Link>
              </Button>
            </div>
            <ol className="grid gap-4 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime text-primary"><s.icon className="h-5 w-5" /></span>
                    <span className="font-display text-3xl font-semibold opacity-30">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-primary-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-75">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Featured guides */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow text-leaf">Plant guides</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-[2.6rem]">Practical reads for real gardens</h2>
            </div>
            <Link to="/guides" className="inline-flex items-center gap-1 text-sm font-semibold text-leaf hover:underline">
              All plant guides <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featured.map((g) => (
              <Link key={g.id} to="/guides/$slug" params={{ slug: g.slug }} className="surface group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img src={plantImage(g.imageKey)} alt="" loading="lazy" width={816} height={816} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="eyebrow">{g.category}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-snug">{g.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{g.summary}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {g.readMins} min read</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal advice */}
      <section id="seasonal" className="scroll-mt-24 pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="surface leaf-pattern grid gap-10 overflow-hidden p-8 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-14">
            <div>
              <p className="eyebrow text-leaf">Seasonal advice · {season.month}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-[2.4rem]">{season.headline}</h2>
              <ul className="mt-7 space-y-4">
                {season.tips.map((tip) => (
                  <li key={tip} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-leaf-foreground"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
                    <span className="leading-relaxed text-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-muted-foreground">Timings suit temperate climates — adjust a few weeks earlier in warm regions.</p>
            </div>
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <p className="eyebrow">In the garden this month</p>
              {crops.length ? (
                <ul className="mt-4 divide-y divide-border">
                  {crops.map((c) => (
                    <li key={c.crop} className="flex items-center justify-between py-3">
                      <span className="font-semibold text-primary">{c.crop}</span>
                      <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">{c.action}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">A quiet month for sowing — a good time to plan, mulch and tidy.</p>
              )}
              <Link to="/guides" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-leaf hover:underline">
                Seasonal care guides <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Plant library teaser */}
      <section className="pb-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro eyebrow="Plant library" title="Find the right plant for every spot" body="Sunlight, watering and seasons for vegetables, herbs, fruit, flowers and houseplants." />
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {popular.map((p) => (
              <Link key={p.id} to="/library" className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lift">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img src={plantImage(p.imageKey)} alt={p.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <p className="font-display text-lg font-semibold text-primary">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sunlight} · water every {p.waterEveryDays} days</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="bg-card">
              <Link to="/library">Browse the Plant Library <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2rem] bg-primary p-8 text-primary-foreground sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:p-14">
          <div>
            <p className="eyebrow text-lime">The Sowistry letter</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-primary-foreground sm:text-4xl">Seasonal tips, once a month.</h2>
            <p className="mt-3 max-w-md opacity-80">What to sow, plant and harvest — plus one practical guide. No spam, unsubscribe any time.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";

import { GUIDES } from "@/lib/data";
import { plantImage } from "@/lib/plant-images";

const SITE = "https://sowistry.lovable.app";

export const Route = createFileRoute("/_site/guides/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const guide = GUIDES.find((g) => g.slug === params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE}/guides/${params.slug}`;
    if (!loaderData)
      return {
        meta: [{ title: "Guide unavailable — Sowistry" }, { name: "robots", content: "noindex" }],
      };
    const title = `${loaderData.title} — Sowistry Plant Guides`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            description: loaderData.summary,
            url,
          }),
        },
      ],
    };
  },
  component: GuidePage,
});

function GuidePage() {
  const g = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-3xl">
      <Link
        to="/guides"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> All plant guides
      </Link>
      <img
        src={plantImage(g.imageKey)}
        alt=""
        width={816}
        height={816}
        className="mt-6 aspect-[16/8] w-full rounded-2xl object-cover"
      />
      <p className="eyebrow mt-8 text-leaf">{g.category}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-tight">{g.title}</h1>
      <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" /> {g.readMins} min read
      </p>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{g.summary}</p>
      <ol className="mt-8 space-y-4">
        {g.steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-primary">
              {i + 1}
            </span>
            <span className="pt-1 leading-relaxed">{s}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}

import { Link } from "@tanstack/react-router";

import emblem from "@/assets/sowistry-emblem.png.asset.json";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img src={emblem.url} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl border border-border bg-card p-0.5" />
      <span className="min-w-0 leading-tight">
        <span className="block font-display text-[1.375rem] font-bold text-primary">Sowistry</span>
        <span className="block text-[0.6875rem] font-semibold text-leaf">Grow naturally. Grow confidently.</span>
      </span>
    </Link>
  );
}

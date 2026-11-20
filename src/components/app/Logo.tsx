import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: "/" | "/dashboard" }) {
  return (
    <Link to={to} className="flex items-center gap-3">
      <img src="/favicon.png" alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl border border-border bg-card p-0.5" />
      <span className="min-w-0 leading-tight">
        <span className="block font-display text-[1.375rem] font-bold text-primary">Sowistry</span>
        <span className="block text-[0.6875rem] font-semibold text-leaf">Grow naturally. Grow confidently.</span>
      </span>
    </Link>
  );
}

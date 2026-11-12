import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/app/Logo";

const col = "space-y-3";
const head = "eyebrow text-primary";
const item = "block text-sm text-muted-foreground transition-colors hover:text-primary";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div className="max-w-xs space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Practical tools and friendly guides for home gardeners — from your first pot of basil to a full kitchen garden.
          </p>
        </div>
        <div className={col}>
          <p className={head}>Tools</p>
          <Link to="/tools/soil" className={item}>Soil Calculator</Link>
          <Link to="/tools/seed-starting" className={item}>Seed Starting</Link>
          <Link to="/tools/watering" className={item}>Watering Calculator</Link>
          <Link to="/tools/planner" className={item}>Garden Planner</Link>
        </div>
        <div className={col}>
          <p className={head}>Learn</p>
          <Link to="/library" className={item}>Plant Library</Link>
          <Link to="/guides" className={item}>Plant Guides</Link>
          <Link to="/" hash="seasonal" className={item}>Seasonal advice</Link>
        </div>
        <div className={col}>
          <p className={head}>Account</p>
          <Link to="/auth" search={{}} className={item}>Sign in</Link>
          <Link to="/auth" search={{ mode: "signup" }} className={item}>Create a free account</Link>
          <Link to="/dashboard" className={item}>My dashboard</Link>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Sowistry. Grow naturally. Grow confidently.</p>
          <p>Made for gardeners, by gardeners.</p>
        </div>
      </div>
    </footer>
  );
}

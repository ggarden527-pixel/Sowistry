import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Droplets,
  FlaskConical,
  LayoutGrid,
  Library,
  Menu,
  PlusCircle,
  Search,
  Settings,
  Sprout,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { GUIDES, LIBRARY } from "@/lib/data";
import { getToday, relativeDayLabel, daysFrom } from "@/lib/dates";
import { useGarden } from "@/lib/garden-store";
import { groupTasks } from "@/lib/tasks";
import { cn } from "@/lib/utils";

import { AddPlantDialog } from "./AddPlantDialog";
import { Logo } from "./Logo";
import { PlantThumb } from "./bits";

type NavItem = { title: string; to: string; icon: LucideIcon; exact?: boolean };

const NAV: NavItem[] = [
  { title: "Dashboard", to: "/", icon: LayoutGrid, exact: true },
  { title: "My Garden", to: "/garden", icon: Sprout },
  { title: "Plant Library", to: "/library", icon: Library },
  { title: "Planting Calendar", to: "/calendar", icon: CalendarDays },
];

export const TOOLS = [
  { title: "Soil Calculator", to: "/tools/soil", icon: FlaskConical, blurb: "How much soil and compost to fill your beds." },
  { title: "Seed Starting", to: "/tools/seed-starting", icon: Sprout, blurb: "When to sow indoors and how many seeds you need." },
  { title: "Watering Calculator", to: "/tools/watering", icon: Droplets, blurb: "Weekly water needs based on weather and soil." },
  { title: "Garden Planner", to: "/tools/planner", icon: LayoutGrid, blurb: "Lay out your beds square by square." },
] as const;

const NAV_BOTTOM: NavItem[] = [
  { title: "Plant Guides", to: "/guides", icon: BookOpen },
  { title: "Settings", to: "/settings", icon: Settings },
];

const linkBase =
  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.9rem] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary";
const linkActive = "bg-secondary text-primary font-semibold shadow-[inset_3px_0_0_var(--color-leaf)]";

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: (() => void) | undefined }) {
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      activeOptions={{ exact: item.exact ?? false }}
      className={linkBase}
      activeProps={{ className: linkActive }}
    >
      <item.icon className="h-[1.15rem] w-[1.15rem] shrink-0" strokeWidth={2} />
      <span className="truncate">{item.title}</span>
    </Link>
  );
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SidebarContent({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const { settings, setAddPlantOpen } = useGarden();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inTools = pathname.startsWith("/tools");
  const [toolsOpen, setToolsOpen] = useState(inTools);
  const open = toolsOpen || inTools;

  return (
    <div className="flex h-full w-full flex-col px-5 py-6">
      <div className="px-1">
        <Logo />
      </div>

      <nav className="mt-9 flex-1 space-y-1 overflow-y-auto">
        <p className="eyebrow mb-2 px-3.5">Menu</p>
        {NAV.map((item) => (
          <NavLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}

        <div>
          <button
            type="button"
            onClick={() => setToolsOpen((o) => !o)}
            aria-expanded={open}
            className={cn(linkBase, "w-full", inTools && "text-primary font-semibold")}
          >
            <Wrench className="h-[1.15rem] w-[1.15rem] shrink-0" strokeWidth={2} />
            <span className="flex-1 truncate text-left">Gardening Tools</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <div className="ml-[1.4rem] mt-1 space-y-0.5 border-l border-border pl-3">
              <Link
                to="/tools"
                onClick={onNavigate}
                activeOptions={{ exact: true }}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-primary"
                activeProps={{ className: "bg-secondary text-primary font-semibold" }}
              >
                All tools
              </Link>
              {TOOLS.map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  onClick={onNavigate}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-primary"
                  activeProps={{ className: "bg-secondary text-primary font-semibold" }}
                >
                  {t.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        {NAV_BOTTOM.map((item) => (
          <NavLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-6 space-y-4">
        <Link
          to="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-secondary"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {initials(settings.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-primary">{settings.name}</span>
            <span className="block truncate text-xs text-muted-foreground">Zone {settings.zone} · {settings.location}</span>
          </span>
        </Link>
        <Button
          variant="leaf"
          size="lg"
          className="w-full"
          onClick={() => {
            onNavigate?.();
            setAddPlantOpen(true);
          }}
        >
          <PlusCircle /> Add New Plant
        </Button>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const { plants } = useGarden();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const out: { label: string; sub: string; go: () => void }[] = [];
    plants
      .filter((p) => p.name.toLowerCase().includes(needle) || p.species.toLowerCase().includes(needle))
      .slice(0, 3)
      .forEach((p) => out.push({ label: p.name, sub: "My Garden", go: () => navigate({ to: "/garden", search: { q: p.name } }) }));
    LIBRARY.filter((l) => l.name.toLowerCase().includes(needle))
      .slice(0, 2)
      .forEach((l) => out.push({ label: l.name, sub: "Plant Library", go: () => navigate({ to: "/library" }) }));
    GUIDES.filter((g) => g.title.toLowerCase().includes(needle))
      .slice(0, 2)
      .forEach((g) => out.push({ label: g.title, sub: "Plant Guide", go: () => navigate({ to: "/guides" }) }));
    TOOLS.filter((t) => t.title.toLowerCase().includes(needle)).forEach((t) =>
      out.push({ label: t.title, sub: "Gardening Tool", go: () => navigate({ to: t.to }) }),
    );
    return out.slice(0, 7);
  }, [q, plants, navigate]);

  return (
    <form
      className="relative w-full max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/garden", search: q.trim() ? { q: q.trim() } : {} });
        setFocused(false);
      }}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-leaf" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search plants, guides and tools..."
        aria-label="Search plants, guides and tools"
        className="h-11 w-full rounded-xl border border-transparent bg-secondary pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-leaf focus:bg-card"
      />
      {focused && results.length > 0 && (
        <div className="surface absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden p-1.5">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                r.go();
                setFocused(false);
                setQ("");
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
            >
              <span className="truncate font-medium text-primary">{r.label}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{r.sub}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

function Notifications() {
  const { tasks, toggleTask } = useGarden();
  const today = getToday();
  const groups = groupTasks(tasks, today);
  const pending = [...groups.overdue, ...groups.today.filter((t) => !t.done)];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications (${pending.length})`}
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card text-primary transition-colors hover:bg-secondary"
        >
          <Bell className="h-[1.15rem] w-[1.15rem]" />
          {pending.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-leaf px-1 text-[0.625rem] font-bold text-leaf-foreground">
              {pending.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-xl p-2">
        <p className="eyebrow px-2 pb-2 pt-1">Needs your attention</p>
        {pending.length === 0 && <p className="px-2 py-4 text-sm text-muted-foreground">All caught up — your garden is happy.</p>}
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {pending.map((t) => {
            const d = daysFrom(t.due, today);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTask(t.id)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-secondary"
              >
                <PlantThumb imageKey={t.imageKey ?? "basil"} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-primary">{t.title}</span>
                  <span className={cn("block text-xs", d < 0 ? "text-destructive" : "text-muted-foreground")}>
                    {relativeDayLabel(d)} · tap to complete
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function UserMenu() {
  const { settings } = useGarden();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-1 transition-colors hover:bg-secondary sm:pr-4"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials(settings.name)}
          </span>
          <span className="hidden text-sm font-semibold text-primary sm:block">{settings.name.split(" ")[0]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel>
          <span className="block text-sm text-primary">{settings.name}</span>
          <span className="block text-xs font-normal text-muted-foreground">{settings.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/garden" search={{}}>My Garden</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TopBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-[4.5rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-card text-primary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <GlobalSearch />
        </div>
        <Notifications />
        <span className="hidden h-8 w-px bg-border sm:block" />
        <UserMenu />
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[290px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-border bg-sidebar lg:flex">
        <SidebarContent />
      </aside>
      <div className="lg:pl-[272px]">
        <TopBar />
        <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">{children}</main>
      </div>
      <AddPlantDialog />
    </div>
  );
}

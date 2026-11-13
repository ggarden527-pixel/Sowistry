import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/app/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth/context";

const navLink =
  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary";
const navActive = "text-primary font-semibold";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link to="/" hash="tools" onClick={onNavigate} className={navLink}>
        Tools
      </Link>
      <Link
        to="/library"
        onClick={onNavigate}
        className={navLink}
        activeProps={{ className: navActive }}
      >
        Plant Library
      </Link>
      <Link
        to="/guides"
        onClick={onNavigate}
        className={navLink}
        activeProps={{ className: navActive }}
      >
        Plant Guides
      </Link>
      <Link to="/" hash="seasonal" onClick={onNavigate} className={navLink}>
        Seasonal advice
      </Link>
    </>
  );
}

function AccountButtons({
  onNavigate,
  stacked = false,
}: {
  onNavigate?: () => void;
  stacked?: boolean;
}) {
  const { user } = useAuth();
  if (user) {
    return (
      <Button
        asChild
        variant="leaf"
        size={stacked ? "lg" : "default"}
        className={stacked ? "w-full" : ""}
      >
        <Link to="/dashboard" onClick={onNavigate}>
          Open dashboard <ArrowRight />
        </Link>
      </Button>
    );
  }
  return (
    <div className={stacked ? "grid gap-2" : "flex items-center gap-2"}>
      <Button asChild variant="ghost" size={stacked ? "lg" : "default"}>
        <Link to="/auth" search={{}} onClick={onNavigate}>
          Sign in
        </Link>
      </Button>
      <Button asChild variant="leaf" size={stacked ? "lg" : "default"}>
        <Link to="/auth" search={{ mode: "signup" }} onClick={onNavigate}>
          Get started
        </Link>
      </Button>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main" className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
          <NavLinks />
        </nav>
        <div className="ml-auto hidden lg:block">
          <AccountButtons />
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="ml-auto grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-primary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-[300px] flex-col gap-6 p-6">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo />
          <nav aria-label="Mobile" className="grid gap-1">
            <NavLinks onNavigate={() => setOpen(false)} />
          </nav>
          <div className="mt-auto">
            <AccountButtons stacked onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

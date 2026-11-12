import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { useAuth } from "@/lib/auth/context";

// Public, indexable pages. Signed-in gardeners browsing the Library or Guides keep their dashboard
// sidebar; everyone else (and every crawler, since SSR has no session) gets the website header/footer.
export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  if (user && !isHome) {
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {isHome ? (
          <Outlet />
        ) : (
          <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <Outlet />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

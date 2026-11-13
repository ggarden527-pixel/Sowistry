import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { auth } from "@/lib/auth";

// Private area: the session lives in the browser, so this subtree renders client-side only and the
// guard runs before any page or garden data loads. Private pages are also kept out of search results.
export const Route = createFileRoute("/_authenticated")({
  staticData: { sitemap: "exclude-subtree" },
  ssr: false,
  beforeLoad: async ({ location }) => {
    const user = await auth.getUser();
    if (!user) throw redirect({ to: "/auth", search: { redirect: location.href } });
    return { user };
  },
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: PrivateLayout,
});

function PrivateLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

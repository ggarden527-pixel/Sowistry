import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";

import { GUIDES } from "@/lib/data";
import {
  sitemapPathForLocation,
  sitemapStaticPaths,
  sitemapXML,
  isSitemapRouteIncluded,
  type SitemapEntry,
} from "@/lib/sitemap";

const BASE_URL = "https://sowistry.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

        const guideRouteId = "/_site/guides/$slug";
        if (isSitemapRouteIncluded(router.routesById[guideRouteId])) {
          for (const guide of GUIDES) {
            const location = router.buildLocation({
              to: "/guides/$slug",
              params: { slug: guide.slug },
              search: () => ({}),
              hash: "",
            });
            const path = sitemapPathForLocation(router, location, guideRouteId);
            if (path) entries.push({ path });
          }
        }

        if (entries.length === 0) {
          return new Response(
            'No pages are included in this sitemap. Check route decisions and ancestor exclusions. Setting "exclude-subtree" on the root excludes the entire site.',
            { status: 404, headers: { "Cache-Control": "no-store" } },
          );
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});

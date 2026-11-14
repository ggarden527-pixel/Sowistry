<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Pages talk only to `src/lib/auth` (identity) and `src/lib/repo` (storage); each has one switch file choosing Supabase or the device-only preview backend. Why: the backend can change without touching pages.
- Garden data is stored as one row per plant/task (upsert by `user_id,id`), never as a whole-list JSON blob. Why: saving one item must not overwrite or race with the user's other items.
- Use the generated Supabase client from `src/integrations/supabase/client` for both auth and storage. Why: a second client causes duplicate sessions on the same storage key.
- Every route sets `staticData.sitemap`; the private `_authenticated` layout uses `"exclude-subtree"`. Why: the sitemap is derived from routes and must never list private pages.

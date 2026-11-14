# Sowistry

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sowistry.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/11b194d1-3e12-46e7-948c-e18731b3d07c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Authentication

Set `VITE_SUPABASE_URL` and either `VITE_SUPABASE_PUBLISHABLE_KEY` or
`VITE_SUPABASE_ANON_KEY` in the deployment environment (or local `.env.local`) to enable
Supabase email/password, Google, and Apple sign-in. Without these values, the app stays in
device-only preview mode. Configure Google and Apple as OAuth providers in Supabase and allow
your app's `/auth` URL as a redirect destination. Use the provider callback URL shown in the
Supabase dashboard when configuring Google and Apple. Never put a Supabase service-role key in
browser code.

Signed-in garden data lives in the connected Supabase project in `profiles`, `plants`, `tasks`
and `planner_beds`, each protected by row-level security so a gardener can only read and change
their own rows. A profile is created automatically at sign-up. Homepage newsletter sign-ups go to
`newsletter_subscribers`, which visitors can add to but never read. Password-reset emails link to
`/reset-password`; add that URL (for the published site and the preview) to the Supabase
redirect allow-list alongside `/auth`.

# Sowistry roadmap

## Public site + private dashboard
- [x] Public homepage at / (hero, tools, featured guides, seasonal advice, newsletter, footer)
- [x] Public, indexable Plant Library and Plant Guides (guide detail pages, sitemap, robots, canonical tags)
- [x] Dashboard moved to /dashboard; garden, calendar, tools, planner, settings behind sign-in
- [x] Sign-in page (email & password, Google, Apple) + password reset page
- [x] Per-user garden, inventory, tasks, planner and profile; real user name/email instead of sample profile
- [x] Empty state for new users (with optional sample garden)
- [x] Connect the user's own Supabase project
- [x] Create tables + security rules, switch sign-in and data to Supabase, store newsletter sign-ups
- [ ] Turn on Google and Apple sign-in — BLOCKED: user must add provider keys in their Supabase dashboard
- [ ] Add /auth and /reset-password to Supabase redirect URLs — BLOCKED: user's Supabase dashboard

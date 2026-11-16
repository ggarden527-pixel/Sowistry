drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;

-- Visitors may only supply the email; id and created_at always come from the database defaults.
revoke insert on public.newsletter_subscribers from anon, authenticated;
grant insert (email) on public.newsletter_subscribers to anon, authenticated;

create policy "Anyone can subscribe with a valid email"
on public.newsletter_subscribers
for insert
to anon, authenticated
with check (
  char_length(email) between 3 and 254
  and email = btrim(email)
  and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
);
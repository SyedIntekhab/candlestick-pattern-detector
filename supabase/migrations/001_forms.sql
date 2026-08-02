-- EdCircles form storage: demo requests, CPD registrations, CPD feedback.
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste
-- -> Run. It is safe to re-run; every statement guards against existing
-- objects.
--
-- The security model in one line: anonymous visitors may INSERT (that is how
-- the public forms work) but may never SELECT. Only a signed-in admin can
-- read anything back.
--
-- That split matters. The publishable key in js/supabase-config.js is public
-- by design, so anyone can find it in the page source and query this project
-- directly. Without the policies below, "admin only" would be a curtain
-- rather than a lock: the page would hide the data while the database handed
-- it to anybody who asked. Row Level Security is what makes the restriction
-- real, and it is enforced by Postgres rather than by any page.

-- Who counts as an admin. Reads the role out of the signed-in user's JWT,
-- which comes from user_metadata.role on the auth user. Kept as a function so
-- the rule lives in one place instead of being repeated in every policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;


-- ---------------------------------------------------------------------------
-- Demo requests: the short form behind the "See EdCircles in Action" banner.
-- ---------------------------------------------------------------------------
create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text not null,
  -- Which of the three circles they want a demo of.
  interest text not null check (interest in ('staffroom', 'classroom', 'library'))
);

alter table public.demo_requests enable row level security;

drop policy if exists "anyone can request a demo" on public.demo_requests;
create policy "anyone can request a demo"
  on public.demo_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "only admins read demo requests" on public.demo_requests;
create policy "only admins read demo requests"
  on public.demo_requests for select
  to authenticated
  using (public.is_admin());


-- ---------------------------------------------------------------------------
-- CPD registrations. Deliberately not accounts: no password, no auth user,
-- no sign-in. Just the contact details needed to reach an attendee later.
-- ---------------------------------------------------------------------------
create table if not exists public.cpd_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  whatsapp text not null
);

alter table public.cpd_registrations enable row level security;

drop policy if exists "anyone can register for cpd" on public.cpd_registrations;
create policy "anyone can register for cpd"
  on public.cpd_registrations for insert
  to anon, authenticated
  with check (true);

drop policy if exists "only admins read cpd registrations" on public.cpd_registrations;
create policy "only admins read cpd registrations"
  on public.cpd_registrations for select
  to authenticated
  using (public.is_admin());


-- ---------------------------------------------------------------------------
-- CPD feedback. Four 1-to-5 ratings plus the two reflection questions.
-- Anonymous on purpose: no name column, so attendees can be candid.
-- ---------------------------------------------------------------------------
create table if not exists public.cpd_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rating_overall smallint not null check (rating_overall between 1 and 5),
  rating_relevance smallint not null check (rating_relevance between 1 and 5),
  rating_recommend smallint not null check (rating_recommend between 1 and 5),
  rating_pace smallint not null check (rating_pace between 1 and 5),
  went_well text,
  even_better_if text
);

alter table public.cpd_feedback enable row level security;

drop policy if exists "anyone can leave cpd feedback" on public.cpd_feedback;
create policy "anyone can leave cpd feedback"
  on public.cpd_feedback for insert
  to anon, authenticated
  with check (true);

drop policy if exists "only admins read cpd feedback" on public.cpd_feedback;
create policy "only admins read cpd feedback"
  on public.cpd_feedback for select
  to authenticated
  using (public.is_admin());

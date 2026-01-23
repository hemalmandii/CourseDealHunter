-- Create deals table
create table deals (
  id uuid primary key default gen_random_uuid(),
  source text default 'coursesity',
  coursesity_list_url text not null,
  coursesity_detail_url text unique not null,
  title text not null,
  description_snippet text,
  thumbnail_url text,
  rating_value numeric,
  review_count int,
  duration_text text,
  udemy_url text,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  last_crawled_at timestamptz,
  is_active boolean default true
);

-- Create deal_votes table
create table deal_votes (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  device_id text not null,
  vote text check (vote in ('free', 'expired')) not null,
  created_at timestamptz default now()
);

-- Indexes
create unique index deals_coursesity_detail_url_idx on deals(coursesity_detail_url);
create index deal_votes_deal_id_created_at_idx on deal_votes(deal_id, created_at desc);
-- Enforce 1 vote per deal per device per 24h via unique index (optional but good for data integrity)
-- We will also enforce this in logic, but a partial unique index could work:
-- create unique index one_vote_per_day_idx on deal_votes(deal_id, device_id, (created_at::date)); 
-- Actually, let's just rely on the API logic as requested, but an index on device_id helps lookup
create index deal_votes_device_id_idx on deal_votes(device_id);

-- Create VIEW deal_stats_24h
create or replace view deal_stats_24h as
select
  deal_id,
  count(*) filter (where vote = 'free') as free_votes_24h,
  count(*) filter (where vote = 'expired') as expired_votes_24h,
  max(created_at) filter (where vote = 'free') as last_free_at,
  max(created_at) filter (where vote = 'expired') as last_expired_at
from deal_votes
where created_at > now() - interval '24 hours'
group by deal_id;

-- Enable RLS
alter table deals enable row level security;
alter table deal_votes enable row level security;

-- Policies for deals
-- Everyone can view deals
create policy "Public deals are viewable by everyone"
on deals for select
to anon, authenticated
using (true);

-- Only service role can modify deals
create policy "Service role can modify deals"
on deals for all
to service_role
using (true)
with check (true);

-- Policies for deal_votes
-- Public can view specific votes if needed (or maybe we lock this down?)
-- Let's allow view for now so we can debug or show user history if we want
create policy "Public votes are viewable by everyone"
on deal_votes for select
to anon, authenticated
using (true);

-- Only service role can insert votes (via Edge Function)
create policy "Service role can insert votes"
on deal_votes for insert
to service_role
with check (true);

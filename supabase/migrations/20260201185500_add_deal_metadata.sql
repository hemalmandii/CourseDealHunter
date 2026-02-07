-- Add metadata columns to the deals table to support the new scraper logic
alter table public.deals 
add column if not exists rating text,
add column if not exists review_count text,
add column if not exists duration text;

-- Force schema cache reload just in case
notify pgrst, 'reload config';

-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Verify extensions are enabled
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise exeception 'pg_cron extension is not enabled';
  end if;
  if not exists (select 1 from pg_extension where extname = 'pg_net') then
    raise exeception 'pg_net extension is not enabled';
  end if;
end $$;

-- Schedule the scraper to run every hour
-- Replace KEY with your actual Anon Key or Service Key
-- Schedule the scraper to run every 6 hours
-- IMPORTANT: This must be run manually in the Supabase Dashboard SQL Editor
-- because it requires your SERVICE_ROLE_KEY which cannot be committed to git.

/*
select cron.schedule(
  'scrape-every-6-hours',
  '0 *\/6 * * *',
  $$
  select net.http_post(
      url:='https://edzquzoglijjxlslbyll.supabase.co/functions/v1/scrape-coursesity',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) as request_id;
  $$
);
*/

-- Note: To unschedule, run: select cron.unschedule('scrape-every-hour');

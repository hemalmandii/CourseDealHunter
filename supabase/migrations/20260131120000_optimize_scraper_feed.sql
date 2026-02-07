-- 1. Unschedule the old hourly scraper
select cron.unschedule('scrape-every-hour');

-- 2. Schedule the scraper to run every 6 hours
-- "At minute 0 past every 6th hour" -> 0 */6 * * *
select cron.schedule(
  'scrape-every-6-hours',
  '0 */6 * * *',
  $$
  select net.http_post(
      url:='https://edzquzoglijjxlslbyll.supabase.co/functions/v1/scrape-coursesity',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkenF1em9nbGlqanhsc2xieWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDgxMDQsImV4cCI6MjA4NDQ4NDEwNH0.ACuQ0C_KSpB7tACF4gsBzE7a6M6RoE6Dw2I823qdZ-s"}'::jsonb
  ) as request_id;
  $$
);

-- 3. VALIDITY JANITOR: Daily job to auto-expire old deals
-- Runs every day at midnight (UTC)
select cron.schedule(
  'expire-old-deals-daily',
  '0 0 * * *', 
  $$
  update public.deals 
  set is_active = false 
  where is_active = true 
    and created_at < (now() - interval '3 days');
  $$
);

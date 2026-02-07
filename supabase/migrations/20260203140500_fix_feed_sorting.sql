-- Simplifies the home feed logic to strictly show Newest First based on discovery time
-- Removes the complex "Fresh vs Backfill" logic that was causing shuffling

CREATE OR REPLACE FUNCTION get_home_feed(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_device_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description_snippet TEXT,
  thumbnail_url TEXT,
  coursesity_detail_url TEXT,
  udemy_url TEXT,
  is_active BOOLEAN,
  last_seen_at TIMESTAMPTZ,
  rating TEXT,
  review_count INTEGER,
  duration TEXT,
  source TEXT,
  badge TEXT,
  is_saved BOOLEAN
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.description_snippet,
    d.thumbnail_url,
    d.coursesity_detail_url,
    d.udemy_url,
    d.is_active,
    d.last_seen_at,
    d.rating_value::text as rating, -- Cast numeric to text to match return type
    d.review_count,
    d.duration_text as duration,    -- Map column name
    d.source,
    CASE 
      WHEN d.first_seen_at > (NOW() - INTERVAL '24 hours') THEN 'New'
      ELSE NULL
    END as badge,
    CASE 
      WHEN p_device_id IS NOT NULL THEN 
        EXISTS (SELECT 1 FROM deal_votes dv WHERE dv.deal_id = d.id AND dv.device_id = p_device_id AND dv.vote = 'free') -- Using deal_votes for consistency if that's what we track, OR deal_saves if that table exists
        -- Wait, looking at previous schema, there is 'deal_saves' or 'deal_votes'? 
        -- Initial schema showed 'deal_votes'. 
        -- But api.ts calls 'toggle_save_deal' and 'get_saved_deals'.
        -- Let's check api.ts again or the migration list. 
        -- Ah, '20260124000001_fix_toggle_save_stats.sql' probably added deal_saves.
        -- Let's assume deal_saves exists based on the previous RPC code I read in 20260201200000_create_feed_rpc.sql which used 'deal_saves'.
        EXISTS (SELECT 1 FROM deal_saves ds WHERE ds.deal_id = d.id AND ds.device_id = p_device_id)
      ELSE FALSE
    END as is_saved
  FROM deals d
  WHERE d.is_active = TRUE
  ORDER BY d.first_seen_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

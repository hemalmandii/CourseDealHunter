-- Drop valid function if exists
DROP FUNCTION IF EXISTS get_home_feed(integer, integer, text);

-- Create a function to get the home feed with adaptive freshness logic
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
  rating TEXT, -- Changed from DECIMAL to TEXT to match table
  review_count INTEGER,
  duration TEXT,
  source TEXT,
  badge TEXT,
  is_saved BOOLEAN
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_fresh_count INTEGER;
  v_needed INTEGER;
  v_min_content_size INTEGER := 10;
BEGIN
  -- 1. Create a temporary table to hold our candidate deals
  CREATE TEMP TABLE temp_feed_candidates (
      id UUID,
      title TEXT,
      description_snippet TEXT,
      thumbnail_url TEXT,
      coursesity_detail_url TEXT,
      udemy_url TEXT,
      is_active BOOLEAN,
      last_seen_at TIMESTAMPTZ,
      rating TEXT, -- Matched type
      review_count INTEGER,
      duration TEXT,
      source TEXT,
      badge TEXT
  ) ON COMMIT DROP;

  -- 2. Stage 1: The "Gold Standard" (Fresh < 24h)
  INSERT INTO temp_feed_candidates 
  SELECT 
      d.id, d.title, d.description_snippet, d.thumbnail_url, d.coursesity_detail_url, d.udemy_url, 
      d.is_active, d.last_seen_at, d.rating, d.review_count, d.duration, d.source,
      'New' as badge
  FROM deals d
  WHERE d.is_active = TRUE
    AND d.last_seen_at > (NOW() - INTERVAL '24 hours')
  ORDER BY d.last_seen_at DESC
  LIMIT 20;

  -- Check how many we got
  SELECT count(*) INTO v_fresh_count FROM temp_feed_candidates;

  -- 3. Stage 2: The "Backfill" (If < 10 items)
  IF v_fresh_count < v_min_content_size THEN
    v_needed := v_min_content_size - v_fresh_count;
    
    INSERT INTO temp_feed_candidates 
    SELECT 
        d.id, d.title, d.description_snippet, d.thumbnail_url, d.coursesity_detail_url, d.udemy_url, 
        d.is_active, d.last_seen_at, d.rating, d.review_count, d.duration, d.source,
        'Backfill' as badge
    FROM deals d
    WHERE d.is_active = TRUE
      AND d.id NOT IN (SELECT id FROM temp_feed_candidates) -- Exclude already selected
    ORDER BY d.last_seen_at DESC
    LIMIT v_needed * 2; -- Fetch a bit more to be safe
  END IF;

  -- 4. Return results with is_saved flag
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description_snippet,
    t.thumbnail_url,
    t.coursesity_detail_url,
    t.udemy_url,
    t.is_active,
    t.last_seen_at,
    t.rating,
    t.review_count,
    t.duration,
    t.source,
    t.badge,
    CASE 
      WHEN p_device_id IS NOT NULL THEN 
        EXISTS (SELECT 1 FROM deal_saves ds WHERE ds.deal_id = t.id AND ds.device_id = p_device_id)
      ELSE FALSE
    END as is_saved
  FROM temp_feed_candidates t
  ORDER BY 
    CASE WHEN t.badge = 'New' THEN 0 ELSE 1 END, 
    t.last_seen_at DESC
  LIMIT p_limit OFFSET p_offset;

END;
$$;

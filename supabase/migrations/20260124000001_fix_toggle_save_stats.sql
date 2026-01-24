-- Fix toggle_save_deal to update user_stats.total_saved
CREATE OR REPLACE FUNCTION public.toggle_save_deal(p_deal_id uuid, p_device_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
declare
  v_exists boolean;
begin
  -- Check if save exists
  select exists(select 1 from deal_saves where deal_id = p_deal_id and device_id = p_device_id) into v_exists;
  
  -- Ensure user_stats row exists
  INSERT INTO user_stats (device_id, total_votes, total_saved, xp, level)
  VALUES (p_device_id, 0, 0, 0, 1)
  ON CONFLICT (device_id) DO NOTHING;
  
  if v_exists then
    -- Remove save
    delete from deal_saves where deal_id = p_deal_id and device_id = p_device_id;
    
    -- Decrement total_saved (don't go below 0)
    UPDATE user_stats 
    SET total_saved = GREATEST(0, total_saved - 1),
        last_active_at = now()
    WHERE device_id = p_device_id;
    
    return false; -- Removed
  else
    -- Add save
    insert into deal_saves (deal_id, device_id) values (p_deal_id, p_device_id);
    
    -- Increment total_saved and add XP
    UPDATE user_stats 
    SET total_saved = total_saved + 1,
        xp = xp + 5,
        last_active_at = now()
    WHERE device_id = p_device_id;
    
    return true; -- Added
  end if;
end;
$function$;

-- Sync current data: Update user_stats to match actual deal_saves count
UPDATE user_stats us
SET total_saved = (
  SELECT COUNT(*) FROM deal_saves ds WHERE ds.device_id = us.device_id
);

-- Migration: Fix XP Leveling Logic
-- 1. Create function to calculate level from XP
create or replace function public.calculate_level(p_xp int)
returns int
language plpgsql
immutable
as $$
declare
  v_level int := 1;
  v_start_xp int;
begin
  -- Simple iterative check according to formula: StartXP = 20 * (L-1) * L
  -- We want the highest Level where StartXP <= p_xp
  loop
    v_start_xp := 20 * (v_level) * (v_level + 1); -- Start XP for the *next* level (Level+1)
    if p_xp < v_start_xp then
      return v_level;
    end if;
    v_level := v_level + 1;
    -- Safety break (e.g. max level 100)
    if v_level > 1000 then 
      return 1000; 
    end if;
  end loop;
end;
$$;

-- 2. Create trigger function
create or replace function public.handle_xp_change()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Calculate new level based on new XP
  NEW.level := public.calculate_level(NEW.xp);
  return NEW;
end;
$$;

-- 3. Create Trigger on user_stats
drop trigger if exists on_xp_change on public.user_stats;

create trigger on_xp_change
before insert or update of xp on public.user_stats
for each row
execute function public.handle_xp_change();

-- 4. Backfill: Trigger the update for everyone
-- This simply updates XP to itself, firing the trigger
update public.user_stats set xp = xp;

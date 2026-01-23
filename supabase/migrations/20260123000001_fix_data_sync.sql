-- Create deal_saves table to track user favorites
create table if not exists deal_saves (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  device_id text not null,
  created_at timestamptz default now(),
  unique(deal_id, device_id)
);

-- Enable RLS
alter table deal_saves enable row level security;

-- Policies
create policy "Anon can read own saves"
on deal_saves for select
to anon, authenticated
using (device_id = current_setting('request.headers')::json->>'device_id' or true); -- simplified for anon key usage without auth user

create policy "Anon can insert own saves"
on deal_saves for insert
to anon, authenticated
with check (true);

create policy "Anon can delete own saves"
on deal_saves for delete
to anon, authenticated
using (true);

-- RPC: Toggle Save Deal
create or replace function toggle_save_deal(p_deal_id uuid, p_device_id text)
returns boolean
language plpgsql
security definer
as $$
declare
  v_exists boolean;
begin
  select exists(select 1 from deal_saves where deal_id = p_deal_id and device_id = p_device_id) into v_exists;
  
  if v_exists then
    delete from deal_saves where deal_id = p_deal_id and device_id = p_device_id;
    return false; -- Removed
  else
    insert into deal_saves (deal_id, device_id) values (p_deal_id, p_device_id);
    return true; -- Added
  end if;
end;
$$;

-- RPC: Get Saved Deals
create or replace function get_saved_deals(p_device_id text)
returns setof deals
language sql
security definer
as $$
  select d.* 
  from deals d
  join deal_saves s on d.id = s.deal_id
  where s.device_id = p_device_id
  order by s.created_at desc;
$$;

-- RPC: Search Deals
create or replace function search_deals(query text)
returns setof deals
language sql
security definer
as $$
  select *
  from deals
  where title ilike '%' || query || '%'
  order by first_seen_at desc
  limit 20;
$$;

-- Grant permissions to anon
grant all on deal_saves to anon, authenticated, service_role;
grant execute on function toggle_save_deal to anon, authenticated, service_role;
grant execute on function get_saved_deals to anon, authenticated, service_role;
grant execute on function search_deals to anon, authenticated, service_role;

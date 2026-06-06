-- Post likes for Jekyll blog. Run once in Supabase SQL Editor.
-- To re-apply from scratch, run the RESET block below first, then this file again.

-- RESET (optional)
drop function if exists public.increment_like(text, text);
drop function if exists public.get_like_count(text);
drop function if exists likes_private.increment_like_impl(text, text);
drop schema if exists likes_private cascade;
drop table if exists public.post_like_voters;
drop table if exists public.post_like_counts;

create table public.post_like_counts (
  post_id text primary key,
  count integer not null default 0 check (count >= 0)
);

create table public.post_like_voters (
  post_id text not null,
  voter_key text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, voter_key)
);

alter table public.post_like_counts enable row level security;
alter table public.post_like_voters enable row level security;

-- post_like_counts: publishable clients may read; writes only via likes_private.increment_like_impl.
create policy "publishable_read_like_counts"
  on public.post_like_counts
  for select
  to anon
  using (true);

create policy "no_direct_client_write_like_counts"
  on public.post_like_counts
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- post_like_voters: no direct client access (writes only via definer RPC impl).
create policy "no_direct_client_access_voters"
  on public.post_like_voters
  for all
  to anon, authenticated
  using (false)
  with check (false);

grant select on table public.post_like_counts to anon;

create or replace function public.get_like_count(p_post_id text)
returns integer
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_post_id is null or p_post_id !~ '^/[0-9]{4}/' then
    raise exception 'invalid post_id';
  end if;

  return coalesce(
    (select count from public.post_like_counts where post_id = p_post_id),
    0
  );
end;
$$;

create schema if not exists likes_private;

-- Invoker wrapper must resolve likes_private.increment_like_impl; not exposed on Data API.
revoke all on schema likes_private from public;
grant usage on schema likes_private to anon;

create or replace function likes_private.increment_like_impl(p_post_id text, p_voter_key text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_inserted boolean;
begin
  if p_post_id is null or p_post_id !~ '^/[0-9]{4}/' then
    raise exception 'invalid post_id';
  end if;

  if p_voter_key is null
    or p_voter_key !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    raise exception 'invalid voter_key';
  end if;

  insert into public.post_like_voters (post_id, voter_key)
  values (p_post_id, p_voter_key)
  on conflict do nothing;

  v_inserted := found;

  if not v_inserted then
    select coalesce(count, 0) into v_count
    from public.post_like_counts
    where post_id = p_post_id;
    return json_build_object('count', v_count, 'accepted', false);
  end if;

  insert into public.post_like_counts (post_id, count)
  values (p_post_id, 1)
  on conflict (post_id) do update
    set count = public.post_like_counts.count + 1
  returning count into v_count;

  return json_build_object('count', v_count, 'accepted', true);
end;
$$;

create or replace function public.increment_like(p_post_id text, p_voter_key text)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return likes_private.increment_like_impl(p_post_id, p_voter_key);
end;
$$;

revoke all on function public.get_like_count(text) from public;
revoke all on function public.increment_like(text, text) from public;
revoke all on function likes_private.increment_like_impl(text, text) from public;

grant execute on function public.get_like_count(text) to anon;
grant execute on function public.increment_like(text, text) to anon;
grant execute on function likes_private.increment_like_impl(text, text) to anon;

revoke execute on function public.get_like_count(text) from authenticated;
revoke execute on function public.increment_like(text, text) from authenticated;
revoke execute on function likes_private.increment_like_impl(text, text) from authenticated;

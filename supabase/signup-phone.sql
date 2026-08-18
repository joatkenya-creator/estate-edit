-- =============================================================================
-- Carry the sign-up phone number into user_profiles
-- =============================================================================
-- The sign-up form now collects a phone number and passes it in the auth user's
-- raw_user_meta_data. handle_new_user only copied full_name, so the phone was
-- dropped on the floor and every new profile started blank.
--
-- The `set search_path = public` and schema-qualified insert are load-bearing:
-- this SECURITY DEFINER trigger runs as supabase_auth_admin (search_path =
-- `auth`), so an unqualified table name breaks signup entirely. Keep both.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Backfill anyone who already signed up with a phone in their auth metadata
-- but a blank profile (no-op if there are none).
update public.user_profiles p
   set phone = nullif(u.raw_user_meta_data->>'phone', '')
  from auth.users u
 where u.id = p.id
   and p.phone is null
   and nullif(u.raw_user_meta_data->>'phone', '') is not null;

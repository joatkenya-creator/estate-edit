-- =============================================================================
-- Marketplace listing auto-moderation
-- =============================================================================
-- Standardised checklist: a listing is "clean" if its title/description contain
-- none of the prohibited (illegal / restricted) terms below. A scheduled job
-- (pg_cron, every minute) then:
--   * REJECTS any pending_review listing that fails the checklist, and
--   * APPROVES (status = active) clean listings that have waited >= 5 minutes.
-- So approval effectively "takes 5 minutes" and needs no manual action, while
-- obviously illegal items are pulled within a minute.
-- =============================================================================

create or replace function public.ee_listing_is_clean(p_title text, p_description text)
returns boolean
language sql
immutable
as $$
  select (coalesce(p_title, '') || ' ' || coalesce(p_description, '')) !~*
    ('\m(' ||
      'gun|guns|handgun|shotgun|firearm|firearms|rifle|pistol|revolver|glock|weapon|weapons|ak-?47|ammo|ammunition|bullet|silencer|' ||
      'explosive|explosives|grenade|dynamite|' ||
      'cocaine|heroin|meth|methamphetamine|cannabis|marijuana|weed|mdma|ecstasy|lsd|opioid|fentanyl|' ||
      'ivory|rhino horn|pangolin|endangered|' ||
      'counterfeit|replica designer|fake id|forged|' ||
      'stolen|passport|national id|ssn|social security|credit card dump|cvv dump|' ||
      'human organ|kidney for sale' ||
    ')\M');
$$;

-- Callable from the app (server action) for instant submit-time feedback.
grant execute on function public.ee_listing_is_clean(text, text) to anon, authenticated;

create or replace function public.ee_moderate_listings()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Reject anything that fails the checklist.
  update public.user_listings
     set status = 'rejected', updated_at = now()
   where status = 'pending_review'
     and not public.ee_listing_is_clean(title, description);

  -- Approve clean listings that have been pending for at least 5 minutes.
  update public.user_listings
     set status = 'active', updated_at = now()
   where status = 'pending_review'
     and public.ee_listing_is_clean(title, description)
     and created_at <= now() - interval '5 minutes';
end;
$$;

-- Schedule it to run every minute.
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('ee-moderate-listings');
exception when others then
  null; -- job didn't exist yet
end $$;

select cron.schedule('ee-moderate-listings', '* * * * *', $cron$select public.ee_moderate_listings();$cron$);

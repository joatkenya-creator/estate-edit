-- =============================================================================
-- Storage: public bucket for full-length property video tours
-- =============================================================================
-- Full tours are too large for Cloudflare static assets (25 MiB per file), so
-- they live here. 50 MB cap = the Supabase free-plan per-file limit. Uploads
-- are server-side with the service-role key (bypasses RLS); public read below.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/mp4'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

do $$ begin
  create policy "Public read for videos"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'videos');
exception when duplicate_object then null; end $$;

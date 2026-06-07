-- =============================================================================
-- Storage: public bucket for asset / estate imagery
-- =============================================================================
-- A public bucket so listing photos can be served via CDN URLs. Uploads are
-- performed server-side with the service-role key (which bypasses RLS); public
-- read is granted via a storage.objects policy below.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'asset-images',
  'asset-images',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read access to objects in the asset-images bucket.
do $$ begin
  create policy "Public read for asset-images"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'asset-images');
exception when duplicate_object then null; end $$;

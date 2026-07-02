-- Storage bucket for marketplace listing images (seller uploads from the site).
-- Public bucket so listing photos render without signed URLs; only authenticated
-- users can upload, and only owners can modify/delete their own objects.
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "listing_images_public_read" on storage.objects;
create policy "listing_images_public_read"
  on storage.objects for select to public
  using (bucket_id = 'listing-images');

drop policy if exists "listing_images_auth_upload" on storage.objects;
create policy "listing_images_auth_upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-images');

drop policy if exists "listing_images_owner_update" on storage.objects;
create policy "listing_images_owner_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'listing-images' and owner = auth.uid());

drop policy if exists "listing_images_owner_delete" on storage.objects;
create policy "listing_images_owner_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'listing-images' and owner = auth.uid());

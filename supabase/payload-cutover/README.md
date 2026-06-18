# Payload cutover — run order

These SQL scripts are **not** auto-applied by `supabase db push`. They bracket the
Payload migration step and must run in this exact order, once, against the shared
Supabase database. Take a backup first.

```
# 0. Back up the database (Supabase Dashboard > Database > Backups, or pg_dump).

# 1. Rename the existing tables out of the way.
#    Run in the Supabase SQL editor:
estate-edit/supabase/payload-cutover/01_rename_legacy.sql

# 2. Let Payload create its own tables, then copy the legacy data in.
cd estate-edit-cms
npm run migrate           # payload migrate — creates assets, services, … tables
npm run migrate:legacy    # copies *_legacy rows in via the Local API

# 3. Re-establish the RLS the public site relies on.
#    Run in the Supabase SQL editor:
estate-edit/supabase/payload-cutover/02_payload_rls_and_grants.sql

# 4. Verify the public site (see estate-edit-cms/README.md "Verification"),
#    then, once happy, drop the legacy tables:
#      drop table if exists asset_images_legacy, assets_legacy, sale_events_legacy,
#        services_legacy, testimonials_legacy, site_stats_legacy, inquiries_legacy cascade;
```

Do this against a **Supabase branch / staging project first** if you have one.

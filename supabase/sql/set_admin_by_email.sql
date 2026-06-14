-- Run in the Supabase SQL editor.
-- Promotes the user with the given email to 'admin' in user_profiles.
-- Requires the role column from add_role_column.sql to already exist.

-- 1. Check the user exists in auth.users first:
select id, email from auth.users where email = 'admin@gmail.com';

-- 2. If found, upsert their role into user_profiles:
insert into public.user_profiles (id, role, updated_at)
select id, 'admin', now()
from auth.users
where email = 'admin@gmail.com'
on conflict (id) do update set role = 'admin', updated_at = now();

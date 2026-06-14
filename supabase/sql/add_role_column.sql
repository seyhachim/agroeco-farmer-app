-- Run once in the Supabase SQL editor.
-- Adds a 'role' column to user_profiles to support an admin role.

alter table public.user_profiles
  add column if not exists role text not null default 'farmer'
  check (role in ('farmer', 'admin'));

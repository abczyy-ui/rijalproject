-- CreateWeb: setup database Supabase
-- Salin semua ke Supabase > SQL Editor > Run. Aman dijalankan berulang kali.
-- (Template email OTP ada di file terpisah: otp-template.html)

-- Tabel
create table if not exists profiles(
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  role text default 'user',
  avatar_url text,
  created_at timestamptz default now()
);
alter table profiles add column if not exists avatar_url text;

create table if not exists deploys(
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade,
  name text,
  url text,
  state text,
  created_at timestamptz default now()
);

-- Keamanan: user hanya bisa membaca datanya sendiri
alter table profiles enable row level security;
alter table deploys enable row level security;
drop policy if exists "profil sendiri" on profiles;
drop policy if exists "deploy sendiri" on deploys;
create policy "profil sendiri" on profiles for select using (auth.uid()=id);
create policy "deploy sendiri" on deploys for select using (auth.uid()=user_id);

-- Profil dibuat otomatis saat user mendaftar (username dari form daftar)
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into profiles(id,username) values(new.id,new.raw_user_meta_data->>'username');
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

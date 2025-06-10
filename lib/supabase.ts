import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Replace these with your Supabase project URL and anon key
const supabaseUrl = 'https://ytsplvnabhiouiskknur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0c3Bsdm5hYmhpb3Vpc2trbnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0Njk2NTcsImV4cCI6MjA2NTA0NTY1N30.bm2J7cRBXB2TfEzwu4MCPkLuTPu4-jXMcQmWreomZXw';

/*
SQL to create the profiles table:
create table public.profiles (
  id uuid references auth.users on delete cascade,
  full_name text,
  email text unique,
  phone_number text,
  password text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );
*/

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 
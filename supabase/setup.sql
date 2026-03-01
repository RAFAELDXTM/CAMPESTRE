-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create events table for event sourcing
create table if not exists public.events (
    id uuid primary key default uuid_generate_v4(),
    farm_id text not null,
    user_id text not null,
    type text not null,
    payload jsonb not null,
    timestamp timestamptz not null default now(),
    created_at timestamptz not null default now()
);

-- Create indexes for faster queries
create index if not exists events_farm_id_idx on public.events(farm_id);
create index if not exists events_timestamp_idx on public.events(timestamp);
create index if not exists events_type_idx on public.events(type);

-- Set up Row Level Security (RLS)
alter table public.events enable row level security;

-- Create policies
-- Policy: Users can read events for their farm
create policy "Users can read events"
    on public.events for select
    using (auth.uid() is not null);

-- Policy: Users can insert events
create policy "Users can insert events"
    on public.events for insert
    with check (auth.uid() is not null);

-- Note: For a real production app, you would want to restrict access based on farm_id 
-- and the user's association with that farm. For now, any authenticated user can read/write.

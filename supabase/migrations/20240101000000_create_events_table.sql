-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_events_farm_id ON public.events(farm_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON public.events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type);

-- Set up Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Note: In a real app, you'd want to restrict this based on the authenticated user's farm_id.
-- For now, we'll allow authenticated users to read/write all events, or you can adjust as needed.
CREATE POLICY "Allow authenticated users to read events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anon access for development (remove in production)
CREATE POLICY "Allow anon read access"
  ON public.events
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert access"
  ON public.events
  FOR INSERT
  TO anon
  WITH CHECK (true);

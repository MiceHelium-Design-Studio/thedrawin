
-- Create media_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.media_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  user_id UUID NOT NULL,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on the media_items table
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Create policies for the media_items table
-- Users can view their own media items
CREATE POLICY IF NOT EXISTS "Users can view their own media items"
  ON public.media_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own media items
CREATE POLICY IF NOT EXISTS "Users can insert their own media items"
  ON public.media_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own media items
CREATE POLICY IF NOT EXISTS "Users can update their own media items"
  ON public.media_items
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own media items
CREATE POLICY IF NOT EXISTS "Users can delete their own media items"
  ON public.media_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all media items
CREATE POLICY IF NOT EXISTS "Admins can manage all media items"
  ON public.media_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

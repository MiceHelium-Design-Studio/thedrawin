
-- ENABLE RLS if not already enabled
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist so we can recreate them cleanly
DROP POLICY IF EXISTS "Users can select their own media" ON public.media_items;
DROP POLICY IF EXISTS "Users can insert their own media" ON public.media_items;
DROP POLICY IF EXISTS "Users can update their own media" ON public.media_items;
DROP POLICY IF EXISTS "Users can delete their own media" ON public.media_items;

-- Allow SELECT: only for the user's own files
CREATE POLICY "Users can select their own media"
  ON public.media_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow INSERT: only if the inserted user_id is the current user's id
CREATE POLICY "Users can insert their own media"
  ON public.media_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow UPDATE: only for the user's own files
CREATE POLICY "Users can update their own media"
  ON public.media_items
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow DELETE: only for the user's own files
CREATE POLICY "Users can delete their own media"
  ON public.media_items
  FOR DELETE
  USING (auth.uid() = user_id);

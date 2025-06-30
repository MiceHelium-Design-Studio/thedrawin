-- Comprehensive fix for storage RLS policies
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile_images', 'profile_images', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('draw_images', 'draw_images', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Drop ALL existing policies on storage.objects
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Step 3: Disable RLS temporarily to reset
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Step 4: Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 5: Create very permissive policies for authenticated users
CREATE POLICY "Allow authenticated users full access to storage"
ON storage.objects FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 6: Allow public read access to public buckets
CREATE POLICY "Allow public read access to public buckets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('media', 'profile_images', 'banners', 'draw_images'));

-- Step 7: Grant permissions
GRANT USAGE ON SCHEMA storage TO authenticated, anon;
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT SELECT ON storage.buckets TO anon; 
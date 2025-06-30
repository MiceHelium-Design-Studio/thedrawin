-- TEMPORARY FIX: Disable RLS on storage.objects entirely
-- This will remove all access restrictions
-- Use this ONLY if the comprehensive fix doesn't work

-- Disable RLS completely on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Ensure buckets exist and are public
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

-- Grant permissions
GRANT ALL ON storage.objects TO authenticated, anon;
GRANT ALL ON storage.buckets TO authenticated, anon; 
-- Fix storage policies to resolve "new row violates row-level security policy" error
-- Run this in your Supabase Dashboard → SQL Editor

-- First, drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can view their own media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their own media folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own draw images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own draw images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own draw images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own draw images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage banner images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view banner images" ON storage.objects;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create comprehensive storage policies

-- 1. Media bucket policies
CREATE POLICY "Allow all operations for authenticated users on media bucket"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- 2. Profile images bucket policies
CREATE POLICY "Allow all operations for authenticated users on profile_images bucket"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'profile_images')
WITH CHECK (bucket_id = 'profile_images');

-- 3. Banners bucket policies
CREATE POLICY "Allow all operations for authenticated users on banners bucket"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'banners')
WITH CHECK (bucket_id = 'banners');

-- 4. Draw images bucket policies
CREATE POLICY "Allow all operations for authenticated users on draw_images bucket"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'draw_images')
WITH CHECK (bucket_id = 'draw_images');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated; 
-- Simple RLS fix for storage.objects
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Drop all existing policies
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
DROP POLICY IF EXISTS "Allow all operations for authenticated users on media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on profile_images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on banners bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on draw_images bucket" ON storage.objects;

-- Step 2: Disable RLS
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY; 
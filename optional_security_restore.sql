-- OPTIONAL: Run this AFTER the simple fix works to restore basic security
-- Only run this if you want to add some security back

-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a very simple policy for authenticated users
CREATE POLICY "Allow authenticated users to access storage"
ON storage.objects FOR ALL
TO authenticated
USING (true)
WITH CHECK (true); 
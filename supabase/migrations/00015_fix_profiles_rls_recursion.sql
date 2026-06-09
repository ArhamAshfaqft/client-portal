-- Fix profiles SELECT policy: avoid self-referential recursion.
-- Allow users to see their own profile + profiles in the same agency.
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = user_id
    OR
    agency_id = (SELECT agency_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );

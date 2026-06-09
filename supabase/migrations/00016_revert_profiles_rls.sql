-- Revert profiles SELECT to original authenticated-only policy.
-- The self-referential agency scoping causes recursion issues in PostgreSQL.
-- App-layer filtering already handles agency isolation.
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

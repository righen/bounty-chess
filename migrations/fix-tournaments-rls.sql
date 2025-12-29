-- ============================================================================
-- FIX: RLS Policies for Tournaments Table
-- ============================================================================
-- This script ensures all necessary RLS policies exist and are correct

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view tournaments" ON tournaments;
DROP POLICY IF EXISTS "Admins can manage tournaments" ON tournaments;
DROP POLICY IF EXISTS "Admins can insert tournaments" ON tournaments;
DROP POLICY IF EXISTS "Admins can update tournaments" ON tournaments;
DROP POLICY IF EXISTS "Admins can delete tournaments" ON tournaments;

-- Ensure RLS is enabled
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can view tournaments (public access)
CREATE POLICY "Public can view tournaments"
  ON tournaments
  FOR SELECT
  USING (true);

-- Policy 2: Admins can insert tournaments
CREATE POLICY "Admins can insert tournaments"
  ON tournaments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy 3: Admins can update tournaments
CREATE POLICY "Admins can update tournaments"
  ON tournaments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy 4: Admins can delete tournaments
CREATE POLICY "Admins can delete tournaments"
  ON tournaments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- Fix tournament_registrations RLS
-- ============================================================================

DROP POLICY IF EXISTS "Public can view tournament_registrations" ON tournament_registrations;
DROP POLICY IF EXISTS "Admins can manage tournament_registrations" ON tournament_registrations;
DROP POLICY IF EXISTS "Admins can insert tournament_registrations" ON tournament_registrations;
DROP POLICY IF EXISTS "Admins can update tournament_registrations" ON tournament_registrations;
DROP POLICY IF EXISTS "Admins can delete tournament_registrations" ON tournament_registrations;

ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Everyone can view registrations
CREATE POLICY "Public can view tournament_registrations"
  ON tournament_registrations
  FOR SELECT
  USING (true);

-- Admins can insert registrations
CREATE POLICY "Admins can insert tournament_registrations"
  ON tournament_registrations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update registrations
CREATE POLICY "Admins can update tournament_registrations"
  ON tournament_registrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete registrations
CREATE POLICY "Admins can delete tournament_registrations"
  ON tournament_registrations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- Fix check_in_log RLS
-- ============================================================================

DROP POLICY IF EXISTS "Public can view check_in_log" ON check_in_log;
DROP POLICY IF EXISTS "Admins can insert check_in_log" ON check_in_log;

ALTER TABLE check_in_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view check_in_log"
  ON check_in_log
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert check_in_log"
  ON check_in_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- Verification
-- ============================================================================

-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('tournaments', 'tournament_registrations', 'check_in_log')
ORDER BY tablename, policyname;

-- Test query (should return all tournaments)
SELECT 
  id, 
  name, 
  status, 
  created_at 
FROM tournaments 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'RLS policies for tournaments, tournament_registrations, and check_in_log have been fixed!';
  RAISE NOTICE 'All tables now have proper SELECT policies allowing public read access.';
  RAISE NOTICE 'Admin-only policies are in place for INSERT, UPDATE, and DELETE operations.';
END $$;


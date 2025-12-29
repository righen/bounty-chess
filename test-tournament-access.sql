-- ============================================================================
-- DIAGNOSTIC: Test Tournament Access and RLS
-- ============================================================================

-- 1. Check if tournaments table exists and has data
SELECT 'Step 1: Check tournaments table' AS test;
SELECT COUNT(*) AS tournament_count FROM tournaments;
SELECT id, name, status FROM tournaments ORDER BY created_at DESC LIMIT 5;

-- 2. Check if RLS is enabled
SELECT 'Step 2: Check RLS status' AS test;
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('tournaments', 'tournament_registrations', 'player_pool');

-- 3. Check current user and role
SELECT 'Step 3: Check current user' AS test;
SELECT 
  auth.uid() AS user_id,
  auth.email() AS user_email;

-- 4. Check if user is admin
SELECT 'Step 4: Check admin status' AS test;
SELECT 
  id,
  email,
  role 
FROM profiles 
WHERE id = auth.uid();

-- 5. Check existing RLS policies
SELECT 'Step 5: Check RLS policies for tournaments' AS test;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END AS using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END AS with_check_clause
FROM pg_policies
WHERE tablename = 'tournaments'
ORDER BY policyname;

-- 6. Test SELECT without RLS (as superuser would see it)
SELECT 'Step 6: Raw tournament data (no RLS)' AS test;
-- This shows what's actually in the table

-- 7. Try to SELECT with RLS (what the app sees)
SELECT 'Step 7: Test SELECT with current user' AS test;
SELECT id, name, status, created_at FROM tournaments ORDER BY created_at DESC;

-- 8. Check tournament_registrations table
SELECT 'Step 8: Check tournament_registrations' AS test;
SELECT COUNT(*) AS registration_count FROM tournament_registrations;

-- 9. Check games table  
SELECT 'Step 9: Check games' AS test;
SELECT COUNT(*) AS games_count FROM games;

-- 10. Test the exact query the app uses
SELECT 'Step 10: Test app query' AS test;
SELECT * FROM tournaments ORDER BY start_date DESC;

-- ============================================================================
-- QUICK FIX: If policies are missing, create them now
-- ============================================================================

-- Drop and recreate policies
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON tournaments;
  DROP POLICY IF EXISTS "Public can view tournaments" ON tournaments;
  DROP POLICY IF EXISTS "Admins can insert tournaments" ON tournaments;
  DROP POLICY IF EXISTS "Admins can update tournaments" ON tournaments;
  DROP POLICY IF EXISTS "Admins can delete tournaments" ON tournaments;
  
  -- Create new policies
  CREATE POLICY "Enable read access for all users"
    ON tournaments FOR SELECT
    USING (true);
  
  CREATE POLICY "Admins can insert tournaments"
    ON tournaments FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
  
  CREATE POLICY "Admins can update tournaments"
    ON tournaments FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
  
  CREATE POLICY "Admins can delete tournaments"
    ON tournaments FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
  
  RAISE NOTICE 'RLS policies recreated successfully!';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- Final verification
SELECT 'Step 11: Final verification - Policies after fix' AS test;
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'tournaments'
ORDER BY policyname;

-- Test SELECT again
SELECT 'Step 12: Test SELECT after fix' AS test;
SELECT id, name, status FROM tournaments ORDER BY created_at DESC;

-- ============================================================================
-- RESULT INTERPRETATION
-- ============================================================================
/*
WHAT TO LOOK FOR:

✅ GOOD:
- Step 1: Shows 2 tournaments
- Step 4: Shows your user with role='admin'
- Step 5: Shows "Enable read access for all users" policy
- Step 7: Shows tournament data
- Step 12: Shows tournament data after fix

❌ BAD:
- Step 1: No tournaments found
- Step 4: User not found or role != 'admin'
- Step 5: No SELECT policy found
- Step 7: Empty result or error
- Step 12: Still empty after fix

If Step 12 shows tournaments but dashboard still empty:
- Clear browser cache (Cmd+Shift+R)
- Check browser console for JavaScript errors
- Verify Supabase client is using correct URL and anon key
*/


-- ============================================================================
-- COMPLETE FIX: All Database Issues in One Script
-- ============================================================================
-- Run this ONCE in Supabase SQL Editor to fix everything
-- ============================================================================

-- ============================================================================
-- PART 1: Fix tournament_registrations Foreign Keys (CRITICAL)
-- ============================================================================

-- Drop ALL existing foreign keys that might be duplicates
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE 'Dropping existing foreign keys...';
  FOR r IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'tournament_registrations'::regclass 
    AND contype = 'f'
  LOOP
    EXECUTE 'ALTER TABLE tournament_registrations DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    RAISE NOTICE 'Dropped: %', r.conname;
  END LOOP;
END $$;

-- Recreate ONLY the correct foreign keys with proper names
ALTER TABLE tournament_registrations
  DROP CONSTRAINT IF EXISTS tournament_registrations_tournament_id_fkey CASCADE;
  
ALTER TABLE tournament_registrations
  DROP CONSTRAINT IF EXISTS tournament_registrations_player_id_fkey CASCADE;

ALTER TABLE tournament_registrations
  ADD CONSTRAINT tournament_registrations_tournament_id_fkey 
  FOREIGN KEY (tournament_id) 
  REFERENCES tournaments(id) 
  ON DELETE CASCADE;

ALTER TABLE tournament_registrations
  ADD CONSTRAINT tournament_registrations_player_id_fkey 
  FOREIGN KEY (player_id) 
  REFERENCES player_pool(id) 
  ON DELETE CASCADE;

RAISE NOTICE '✅ Foreign keys fixed!';

-- ============================================================================
-- PART 2: Ensure All Required Columns Exist
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Adding missing columns...';
  
  -- Ensure id column exists and is primary key
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_registrations' AND column_name = 'id') THEN
    ALTER TABLE tournament_registrations ADD COLUMN id TEXT DEFAULT gen_random_uuid()::TEXT;
    UPDATE tournament_registrations SET id = gen_random_uuid()::TEXT WHERE id IS NULL;
    ALTER TABLE tournament_registrations ADD PRIMARY KEY (id);
    RAISE NOTICE 'Added id column';
  END IF;

  -- Add other missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_registrations' AND column_name = 'pairing_number') THEN
    ALTER TABLE tournament_registrations ADD COLUMN pairing_number INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_registrations' AND column_name = 'entry_fee_paid') THEN
    ALTER TABLE tournament_registrations ADD COLUMN entry_fee_paid BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_registrations' AND column_name = 'payment_method') THEN
    ALTER TABLE tournament_registrations ADD COLUMN payment_method TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_registrations' AND column_name = 'payment_reference') THEN
    ALTER TABLE tournament_registrations ADD COLUMN payment_reference TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_registrations' AND column_name = 'checked_in') THEN
    ALTER TABLE tournament_registrations ADD COLUMN checked_in BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_registrations' AND column_name = 'check_in_time') THEN
    ALTER TABLE tournament_registrations ADD COLUMN check_in_time TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_registrations' AND column_name = 'notes') THEN
    ALTER TABLE tournament_registrations ADD COLUMN notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_registrations' AND column_name = 'registered_at') THEN
    ALTER TABLE tournament_registrations ADD COLUMN registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournament_registrations' AND column_name = 'updated_at') THEN
    ALTER TABLE tournament_registrations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  RAISE NOTICE '✅ All columns added!';
END $$;

-- ============================================================================
-- PART 3: Fix RLS Policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON tournaments;
DROP POLICY IF EXISTS "Public can view tournaments" ON tournaments;
DROP POLICY IF EXISTS "Admins can insert tournaments" ON tournaments;
DROP POLICY IF EXISTS "Admins can update tournaments" ON tournaments;
DROP POLICY IF EXISTS "Admins can delete tournaments" ON tournaments;

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_pool ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "tournaments_select_policy"
  ON tournaments FOR SELECT
  USING (true);

CREATE POLICY "tournaments_insert_policy"
  ON tournaments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "tournaments_update_policy"
  ON tournaments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "tournaments_delete_policy"
  ON tournaments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- tournament_registrations policies
DROP POLICY IF EXISTS "Public can view tournament_registrations" ON tournament_registrations;
DROP POLICY IF EXISTS "Admins can manage tournament_registrations" ON tournament_registrations;

CREATE POLICY "registrations_select_policy"
  ON tournament_registrations FOR SELECT
  USING (true);

CREATE POLICY "registrations_insert_policy"
  ON tournament_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "registrations_update_policy"
  ON tournament_registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "registrations_delete_policy"
  ON tournament_registrations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- player_pool policies
DROP POLICY IF EXISTS "Public can view player_pool" ON player_pool;
DROP POLICY IF EXISTS "Admins can manage player_pool" ON player_pool;

CREATE POLICY "player_pool_select_policy"
  ON player_pool FOR SELECT
  USING (true);

CREATE POLICY "player_pool_insert_policy"
  ON player_pool FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "player_pool_update_policy"
  ON player_pool FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "player_pool_delete_policy"
  ON player_pool FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

RAISE NOTICE '✅ RLS policies fixed!';

-- ============================================================================
-- PART 4: Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament_id 
  ON tournament_registrations(tournament_id);
  
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_player_id 
  ON tournament_registrations(player_id);
  
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_pairing 
  ON tournament_registrations(tournament_id, pairing_number);

CREATE INDEX IF NOT EXISTS idx_player_pool_name 
  ON player_pool(surname, name);

CREATE INDEX IF NOT EXISTS idx_tournaments_start_date 
  ON tournaments(start_date DESC);

RAISE NOTICE '✅ Indexes created!';

-- ============================================================================
-- PART 5: Test Everything
-- ============================================================================

-- Test 1: Select tournaments
SELECT '✅ TEST 1: Select tournaments' AS test;
SELECT id, name, status FROM tournaments ORDER BY created_at DESC LIMIT 3;

-- Test 2: Select tournament_registrations with player join
SELECT '✅ TEST 2: Select registrations with player data' AS test;
SELECT 
  tr.id,
  tr.tournament_id,
  tr.player_id,
  pp.name AS player_name,
  pp.surname AS player_surname,
  tr.entry_fee_paid,
  tr.checked_in
FROM tournament_registrations tr
LEFT JOIN player_pool pp ON tr.player_id = pp.id
LIMIT 5;

-- Test 3: Verify foreign keys
SELECT '✅ TEST 3: Verify foreign keys' AS test;
SELECT 
  conname AS constraint_name,
  a.attname AS column_name,
  confrelid::regclass AS references_table
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = 'tournament_registrations'::regclass
AND c.contype = 'f'
ORDER BY conname;

-- Test 4: Verify RLS policies
SELECT '✅ TEST 4: Verify RLS policies' AS test;
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('tournaments', 'tournament_registrations', 'player_pool')
ORDER BY tablename, policyname;

-- ============================================================================
-- FINAL MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ ALL FIXES COMPLETED SUCCESSFULLY!                      ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║  Fixed:                                                    ║';
  RAISE NOTICE '║  • Foreign key conflicts                                   ║';
  RAISE NOTICE '║  • Missing columns                                         ║';
  RAISE NOTICE '║  • RLS policies                                            ║';
  RAISE NOTICE '║  • Indexes                                                 ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  Next steps:                                               ║';
  RAISE NOTICE '║  1. Hard refresh your browser (Cmd+Shift+R)                ║';
  RAISE NOTICE '║  2. Dashboard should now show tournaments                  ║';
  RAISE NOTICE '║  3. View/Edit/Delete buttons should work                   ║';
  RAISE NOTICE '║  4. Registration & Check-in should work                    ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
END $$;


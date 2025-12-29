-- ============================================================================
-- CRITICAL FIX: Remove Duplicate Foreign Keys
-- ============================================================================

-- Step 1: Check current foreign keys
SELECT 
  'Current foreign keys on tournament_registrations:' AS info,
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  a.attname AS column_name,
  confrelid::regclass AS foreign_table_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = 'tournament_registrations'::regclass
AND c.contype = 'f'
ORDER BY conname;

-- Step 2: Drop ALL foreign keys from tournament_registrations
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'tournament_registrations'::regclass 
    AND contype = 'f'
  LOOP
    EXECUTE 'ALTER TABLE tournament_registrations DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    RAISE NOTICE 'Dropped constraint: %', r.conname;
  END LOOP;
END $$;

-- Step 3: Recreate ONLY the correct foreign keys
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

-- Step 4: Verify the fix
SELECT 
  'Fixed foreign keys:' AS info,
  conname AS constraint_name,
  a.attname AS column_name,
  confrelid::regclass AS references_table
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = 'tournament_registrations'::regclass
AND c.contype = 'f'
ORDER BY conname;

-- Step 5: Test the query that was failing
SELECT 'Test query - tournament_registrations with player_pool join:' AS info;
SELECT 
  tr.id,
  tr.tournament_id,
  tr.player_id,
  pp.name,
  pp.surname
FROM tournament_registrations tr
LEFT JOIN player_pool pp ON tr.player_id = pp.id
LIMIT 5;

RAISE NOTICE 'Foreign key fix completed successfully!';


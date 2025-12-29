-- ============================================================================
-- FIX: Schema Mismatch - Add Missing Columns to tournament_registrations
-- ============================================================================

-- Check current structure
SELECT 'Current tournament_registrations columns:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tournament_registrations'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add player_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'player_id'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN player_id INTEGER REFERENCES player_pool(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added player_id column';
  END IF;

  -- Add pairing_number if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'pairing_number'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN pairing_number INTEGER;
    RAISE NOTICE 'Added pairing_number column';
  END IF;

  -- Add entry_fee_paid if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'entry_fee_paid'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN entry_fee_paid BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added entry_fee_paid column';
  END IF;

  -- Add payment_method if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN payment_method TEXT;
    RAISE NOTICE 'Added payment_method column';
  END IF;

  -- Add payment_reference if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN payment_reference TEXT;
    RAISE NOTICE 'Added payment_reference column';
  END IF;

  -- Add checked_in if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'checked_in'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN checked_in BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added checked_in column';
  END IF;

  -- Add check_in_time if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'check_in_time'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN check_in_time TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added check_in_time column';
  END IF;

  -- Add notes if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN notes TEXT;
    RAISE NOTICE 'Added notes column';
  END IF;

  -- Add registered_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'registered_at'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added registered_at column';
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column';
  END IF;

  -- Add id column if missing (primary key)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'id'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN id TEXT DEFAULT gen_random_uuid()::TEXT;
    RAISE NOTICE 'Added id column';
  END IF;

  -- Add tournament_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tournament_registrations' 
    AND column_name = 'tournament_id'
  ) THEN
    ALTER TABLE tournament_registrations 
    ADD COLUMN tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added tournament_id column';
  END IF;

END $$;

-- Set id as primary key if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'tournament_registrations' 
    AND constraint_type = 'PRIMARY KEY'
  ) THEN
    -- First, ensure all id values are unique
    UPDATE tournament_registrations 
    SET id = gen_random_uuid()::TEXT 
    WHERE id IS NULL;
    
    ALTER TABLE tournament_registrations 
    ADD PRIMARY KEY (id);
    RAISE NOTICE 'Set id as primary key';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament 
  ON tournament_registrations(tournament_id);
  
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_player 
  ON tournament_registrations(player_id);
  
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_pairing 
  ON tournament_registrations(tournament_id, pairing_number);

-- Verify the structure
SELECT 'Updated tournament_registrations columns:' AS info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tournament_registrations'
ORDER BY ordinal_position;

-- Test query
SELECT 'Test query - should work now:' AS info;
SELECT 
  id,
  tournament_id,
  player_id,
  pairing_number,
  entry_fee_paid,
  checked_in
FROM tournament_registrations
LIMIT 5;

DO $$
BEGIN
  RAISE NOTICE 'Schema fix completed! tournament_registrations table now has all required columns.';
END $$;


-- ============================================================================
-- ADD tournament_id TO rounds TABLE
-- ============================================================================
-- This migration adds the tournament_id column to the rounds table
-- to support the new tournament system

-- Add tournament_id column if it doesn't exist
ALTER TABLE rounds 
ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_rounds_tournament_id ON rounds(tournament_id);

-- Update existing rounds to link to the first tournament (if any exist)
-- This is a safety measure - ideally all rounds should be created with tournament_id
DO $$
DECLARE
  first_tournament_id UUID;
BEGIN
  SELECT id INTO first_tournament_id FROM tournaments LIMIT 1;
  
  IF first_tournament_id IS NOT NULL THEN
    UPDATE rounds 
    SET tournament_id = first_tournament_id 
    WHERE tournament_id IS NULL;
    
    RAISE NOTICE 'Updated existing rounds to link to tournament: %', first_tournament_id;
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN rounds.tournament_id IS 'Links round to a specific tournament';

-- Verify
SELECT 
  'Rounds table updated' AS status,
  COUNT(*) AS total_rounds,
  COUNT(tournament_id) AS rounds_with_tournament_id
FROM rounds;


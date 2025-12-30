-- ============================================================================
-- ADD board_number TO games TABLE
-- ============================================================================
-- This migration adds the board_number column to the games table
-- to support ordered display of pairings

-- Add board_number column if it doesn't exist
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS board_number INTEGER;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_games_board_number ON games(round_id, board_number);

-- Update existing games to have board_number based on their order
-- This assigns board numbers based on creation order within each round
DO $$
DECLARE
  round_rec RECORD;
  board_num INTEGER;
BEGIN
  FOR round_rec IN SELECT DISTINCT round_id FROM games WHERE board_number IS NULL LOOP
    board_num := 1;
    
    -- Update games in this round, ordered by id (creation order)
    FOR board_num IN 1..(
      SELECT COUNT(*)::INTEGER 
      FROM games 
      WHERE round_id = round_rec.round_id AND board_number IS NULL
    ) LOOP
      UPDATE games
      SET board_number = board_num
      WHERE round_id = round_rec.round_id
        AND board_number IS NULL
        AND id = (
          SELECT id 
          FROM games 
          WHERE round_id = round_rec.round_id 
            AND board_number IS NULL
          ORDER BY id
          LIMIT 1
          OFFSET board_num - 1
        );
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Updated board_number for existing games';
END $$;

-- Add comment
COMMENT ON COLUMN games.board_number IS 'Board number for this game within the round (1, 2, 3, ...)';

-- Verify
SELECT 
  'Games table updated' AS status,
  COUNT(*) AS total_games,
  COUNT(board_number) AS games_with_board_number
FROM games;


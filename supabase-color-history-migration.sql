-- Migration to add color_history column for FIDE color balancing

-- Add color_history column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS color_history TEXT[] DEFAULT '{}';

-- Add comment explaining the column
COMMENT ON COLUMN players.color_history IS 'Array of colors played each round: W (white), B (black), or BYE. Used for FIDE Swiss pairing color balancing rules.';

-- Update existing players to have empty color history
UPDATE players
SET color_history = '{}'
WHERE color_history IS NULL;


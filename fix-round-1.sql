-- Fix Round 1 - Clear and Regenerate
-- Run this in Supabase SQL Editor if Round 1 shows 0 games

-- Step 1: Delete the broken Round 1
DELETE FROM games WHERE round_number = 1;
DELETE FROM rounds WHERE round_number = 1;

-- Step 2: Clear all player opponent history (allows fresh pairings)
UPDATE players
SET opponent_ids = '{}',
    color_history = '{}';

-- Step 3: Reset tournament to Round 0 (so you can generate Round 1 again)
UPDATE tournament
SET current_round = 0
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Step 4: Verify everything is reset
SELECT 
  (SELECT COUNT(*) FROM games WHERE round_number = 1) as round_1_games,
  (SELECT COUNT(*) FROM rounds WHERE round_number = 1) as round_1_exists,
  (SELECT current_round FROM tournament LIMIT 1) as current_round,
  (SELECT COUNT(*) FROM players) as total_players;
  
-- Expected result:
-- round_1_games: 0
-- round_1_exists: 0
-- current_round: 0
-- total_players: 53 (or your count)


-- ============================================================================
-- DELETE DUPLICATE ROUND 1 GAMES
-- ============================================================================
-- This script deletes duplicate games from Round 1
-- Keeps the first game (lowest ID) for each unique pairing

-- Step 1: Show duplicate games (same players paired twice)
SELECT 
  'Duplicate Games to DELETE' as action,
  g.id as game_id,
  g.white_player_id,
  g.black_player_id,
  wp.name || ' ' || wp.surname as white_player,
  bp.name || ' ' || bp.surname as black_player,
  g.created_at
FROM games g
LEFT JOIN player_pool wp ON g.white_player_id = wp.id
LEFT JOIN player_pool bp ON g.black_player_id = bp.id
WHERE g.round_number = 1
  AND g.black_player_id != 0  -- Exclude BYE games
  AND g.id NOT IN (
    -- Keep the game with the lowest ID for each pairing
    SELECT MIN(g2.id)
    FROM games g2
    WHERE g2.round_number = 1
      AND g2.black_player_id != 0
      AND (
        (g2.white_player_id = g.white_player_id AND g2.black_player_id = g.black_player_id)
        OR
        (g2.white_player_id = g.black_player_id AND g2.black_player_id = g.white_player_id)
      )
    GROUP BY 
      LEAST(g2.white_player_id, g2.black_player_id),
      GREATEST(g2.white_player_id, g2.black_player_id)
  )
ORDER BY g.created_at, g.id;

-- Step 2: Show duplicate BYE games
SELECT 
  'Duplicate BYE Games to DELETE' as action,
  g.id as game_id,
  g.white_player_id,
  wp.name || ' ' || wp.surname as player,
  g.created_at
FROM games g
LEFT JOIN player_pool wp ON g.white_player_id = wp.id
WHERE g.round_number = 1
  AND g.black_player_id = 0  -- BYE games
  AND g.id NOT IN (
    -- Keep the BYE game with the lowest ID for each player
    SELECT MIN(g2.id)
    FROM games g2
    WHERE g2.round_number = 1
      AND g2.black_player_id = 0
      AND g2.white_player_id = g.white_player_id
    GROUP BY g2.white_player_id
  )
ORDER BY g.created_at, g.id;

-- Step 3: DELETE duplicate games (keeps the one with LOWEST id)
-- WARNING: This will delete duplicate games!
-- Review Steps 1-2 before running this!

-- Delete duplicate normal games
DELETE FROM games
WHERE round_number = 1
  AND black_player_id != 0
  AND id NOT IN (
    SELECT MIN(g2.id)
    FROM games g2
    WHERE g2.round_number = 1
      AND g2.black_player_id != 0
      AND (
        (g2.white_player_id = games.white_player_id AND g2.black_player_id = games.black_player_id)
        OR
        (g2.white_player_id = games.black_player_id AND g2.black_player_id = games.white_player_id)
      )
    GROUP BY 
      LEAST(g2.white_player_id, g2.black_player_id),
      GREATEST(g2.white_player_id, g2.black_player_id)
  );

-- Delete duplicate BYE games
DELETE FROM games
WHERE round_number = 1
  AND black_player_id = 0
  AND id NOT IN (
    SELECT MIN(g2.id)
    FROM games g2
    WHERE g2.round_number = 1
      AND g2.black_player_id = 0
      AND g2.white_player_id = games.white_player_id
    GROUP BY g2.white_player_id
  );

-- Step 4: Verify - should show 0 duplicates
SELECT 
  'Verification: Remaining duplicate games' as check_type,
  white_player_id,
  black_player_id,
  COUNT(*) as count
FROM games
WHERE round_number = 1
  AND black_player_id != 0
GROUP BY white_player_id, black_player_id
HAVING COUNT(*) > 1;

-- Step 5: Show final game count
SELECT 
  'Final Round 1 Game Count' as info,
  COUNT(*) as total_games,
  COUNT(CASE WHEN black_player_id = 0 THEN 1 END) as bye_games,
  COUNT(CASE WHEN black_player_id != 0 THEN 1 END) as normal_games
FROM games
WHERE round_number = 1;

-- Step 6: Show expected vs actual
WITH player_count AS (
  SELECT COUNT(DISTINCT CASE WHEN checked_in = TRUE THEN player_pool_id END) as checked_in_players
  FROM tournament_registrations
)
SELECT 
  'Game Count Check' as info,
  pc.checked_in_players as players,
  CEIL(pc.checked_in_players::numeric / 2) as expected_games,
  COUNT(g.id) as actual_games,
  CASE 
    WHEN COUNT(g.id) = CEIL(pc.checked_in_players::numeric / 2) THEN '✅ CORRECT'
    ELSE '❌ MISMATCH'
  END as status
FROM player_count pc
CROSS JOIN games g
WHERE g.round_number = 1
GROUP BY pc.checked_in_players;


-- ============================================================================
-- DIAGNOSE GAME COUNT ISSUE
-- ============================================================================
-- This script helps identify why there are 47 games for 41 players

-- Step 1: Count checked-in players
SELECT 
  'Checked-in Players' as check_type,
  COUNT(*) as count
FROM tournament_registrations
WHERE checked_in = TRUE;

-- Step 2: Check for duplicate registrations (same player registered twice)
SELECT 
  'Duplicate Registrations' as check_type,
  player_pool_id,
  COUNT(*) as registration_count,
  STRING_AGG(id::text, ', ') as registration_ids
FROM tournament_registrations
WHERE checked_in = TRUE
GROUP BY player_pool_id
HAVING COUNT(*) > 1
ORDER BY registration_count DESC;

-- Step 3: Count games in Round 1
SELECT 
  'Round 1 Games' as check_type,
  COUNT(*) as game_count
FROM games
WHERE round_number = 1;

-- Step 4: Check for duplicate games (same players paired twice)
SELECT 
  'Duplicate Games Check' as check_type,
  white_player_id,
  black_player_id,
  COUNT(*) as game_count,
  STRING_AGG(id::text, ', ') as game_ids
FROM games
WHERE round_number = 1
  AND black_player_id != 0  -- Exclude BYE games
GROUP BY white_player_id, black_player_id
HAVING COUNT(*) > 1
ORDER BY game_count DESC;

-- Step 5: Check for games with same player on both sides
SELECT 
  'Invalid Games (same player both sides)' as check_type,
  id as game_id,
  white_player_id,
  black_player_id,
  round_number
FROM games
WHERE round_number = 1
  AND white_player_id = black_player_id
  AND black_player_id != 0;

-- Step 6: Count unique players in games
SELECT 
  'Unique Players in Games' as check_type,
  COUNT(DISTINCT white_player_id) + COUNT(DISTINCT CASE WHEN black_player_id != 0 THEN black_player_id END) as unique_players
FROM games
WHERE round_number = 1;

-- Step 7: Show all Round 1 games with player names
SELECT 
  g.id as game_id,
  g.board_number,
  g.round_number,
  wp.name || ' ' || wp.surname as white_player,
  bp.name || ' ' || bp.surname as black_player,
  CASE WHEN g.black_player_id = 0 THEN 'BYE' ELSE 'Normal' END as game_type
FROM games g
LEFT JOIN player_pool wp ON g.white_player_id = wp.id
LEFT JOIN player_pool bp ON g.black_player_id = bp.id
WHERE g.round_number = 1
ORDER BY g.board_number, g.id;

-- Step 8: Check if there are duplicate player_pool entries being used
SELECT 
  'Players in Games (checking for duplicates)' as check_type,
  pp.id,
  pp.name,
  pp.surname,
  COUNT(DISTINCT g.id) as games_as_white,
  COUNT(DISTINCT g2.id) as games_as_black
FROM player_pool pp
LEFT JOIN games g ON g.white_player_id = pp.id AND g.round_number = 1
LEFT JOIN games g2 ON g2.black_player_id = pp.id AND g.round_number = 1 AND g2.black_player_id != 0
GROUP BY pp.id, pp.name, pp.surname
HAVING COUNT(DISTINCT g.id) > 0 OR COUNT(DISTINCT g2.id) > 0
ORDER BY pp.surname, pp.name;


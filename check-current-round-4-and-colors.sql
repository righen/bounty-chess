-- Check Current Round 4 Status and Player Color Histories
-- =========================================================

-- 1. Check if Round 4 exists and its status
SELECT 
  'ROUND 4 STATUS' as section,
  round_number,
  completed,
  (SELECT COUNT(*) FROM games WHERE round_number = 4) as total_games,
  (SELECT COUNT(*) FROM games WHERE round_number = 4 AND completed = true) as completed_games
FROM rounds
WHERE round_number = 4;

-- 2. Show Round 4 pairings with colors
SELECT 
  'ROUND 4 PAIRINGS' as section,
  g.id,
  wp.name || ' ' || wp.surname as white_player,
  bp.name || ' ' || bp.surname as black_player,
  g.result,
  g.completed
FROM games g
LEFT JOIN players wp ON g.white_player_id = wp.id
LEFT JOIN players bp ON g.black_player_id = bp.id
WHERE g.round_number = 4
ORDER BY g.id;

-- 3. Check color history for ALL players (showing current state)
SELECT 
  'PLAYER COLOR HISTORIES' as section,
  name || ' ' || surname as player,
  color_history,
  array_length(color_history, 1) as games_played,
  -- Count colors
  (SELECT COUNT(*) FROM unnest(color_history) c WHERE c = 'W') as whites,
  (SELECT COUNT(*) FROM unnest(color_history) c WHERE c = 'B') as blacks,
  (SELECT COUNT(*) FROM unnest(color_history) c WHERE c = 'BYE') as byes
FROM players
ORDER BY surname, name;

-- 4. Summary of color history state
SELECT 
  'COLOR HISTORY SUMMARY' as section,
  COUNT(*) as total_players,
  SUM(CASE WHEN array_length(color_history, 1) > 0 THEN 1 ELSE 0 END) as players_with_history,
  SUM(CASE WHEN array_length(color_history, 1) = 0 OR color_history IS NULL THEN 1 ELSE 0 END) as players_without_history,
  MAX(array_length(color_history, 1)) as max_games_played
FROM players;


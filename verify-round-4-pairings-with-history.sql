-- Verify Round 4 Pairings with Player Color History
-- ==================================================

-- Show each Round 4 game with both players' color histories
SELECT 
  ROW_NUMBER() OVER (ORDER BY g.id) as board,
  
  -- White Player
  wp.name || ' ' || wp.surname as white_player,
  wp.color_history as white_history,
  COALESCE(array_length(wp.color_history, 1), 0) as white_games,
  
  -- Black Player  
  CASE 
    WHEN g.black_player_id = 0 THEN 'BYE'
    ELSE bp.name || ' ' || bp.surname 
  END as black_player,
  CASE 
    WHEN g.black_player_id = 0 THEN ARRAY[]::text[]
    ELSE bp.color_history 
  END as black_history,
  CASE 
    WHEN g.black_player_id = 0 THEN 0
    ELSE COALESCE(array_length(bp.color_history, 1), 0)
  END as black_games,
  
  -- Game Status
  g.completed,
  g.result
  
FROM games g
LEFT JOIN players wp ON g.white_player_id = wp.id
LEFT JOIN players bp ON g.black_player_id = bp.id
WHERE g.round_number = 4
ORDER BY g.id;

-- Check if any violations exist (players with WW getting W, or BB getting B)
SELECT 
  'POTENTIAL VIOLATIONS' as check_type,
  COUNT(*) as violation_count
FROM games g
LEFT JOIN players wp ON g.white_player_id = wp.id
LEFT JOIN players bp ON g.black_player_id = bp.id
WHERE g.round_number = 4
  AND (
    -- White player has WW and gets W again
    (array_length(wp.color_history, 1) >= 2 
     AND wp.color_history[array_length(wp.color_history, 1)] = 'W'
     AND wp.color_history[array_length(wp.color_history, 1) - 1] = 'W')
    OR
    -- Black player has BB and gets B again  
    (array_length(bp.color_history, 1) >= 2 
     AND bp.color_history[array_length(bp.color_history, 1)] = 'B'
     AND bp.color_history[array_length(bp.color_history, 1) - 1] = 'B')
  );


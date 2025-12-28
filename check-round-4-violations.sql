-- Check Round 4 for Color Balancing Issues
-- ==========================================

-- Find players with WWW from rounds 1-3 and check their Round 4 color
SELECT 
  'PLAYERS WITH WWW - MUST GET BLACK IN R4' as issue_type,
  p.name || ' ' || p.surname as player,
  p.color_history as rounds_1_3_history,
  CASE 
    WHEN g4w.white_player_id = p.id THEN 'WHITE (VIOLATION!)'
    WHEN g4b.black_player_id = p.id THEN 'BLACK (CORRECT)'
    ELSE 'NOT FOUND IN ROUND 4'
  END as round_4_color,
  CASE 
    WHEN g4w.white_player_id = p.id THEN p.color_history || ARRAY['W']
    WHEN g4b.black_player_id = p.id THEN p.color_history || ARRAY['B']
    ELSE p.color_history
  END as full_history
FROM players p
LEFT JOIN games g4w ON g4w.round_number = 4 AND g4w.white_player_id = p.id
LEFT JOIN games g4b ON g4b.round_number = 4 AND g4b.black_player_id = p.id
WHERE array_length(p.color_history, 1) >= 3
  AND p.color_history[array_length(p.color_history, 1)] = 'W'
  AND p.color_history[array_length(p.color_history, 1) - 1] = 'W'
  AND p.color_history[array_length(p.color_history, 1) - 2] = 'W';

-- Find players with BBB from rounds 1-3 (if any)
SELECT 
  'PLAYERS WITH BBB - MUST GET WHITE IN R4' as issue_type,
  p.name || ' ' || p.surname as player,
  p.color_history as rounds_1_3_history,
  CASE 
    WHEN g4w.white_player_id = p.id THEN 'WHITE (CORRECT)'
    WHEN g4b.black_player_id = p.id THEN 'BLACK (VIOLATION!)'
    ELSE 'NOT FOUND IN ROUND 4'
  END as round_4_color
FROM players p
LEFT JOIN games g4w ON g4w.round_number = 4 AND g4w.white_player_id = p.id
LEFT JOIN games g4b ON g4b.round_number = 4 AND g4b.black_player_id = p.id
WHERE array_length(p.color_history, 1) >= 3
  AND p.color_history[array_length(p.color_history, 1)] = 'B'
  AND p.color_history[array_length(p.color_history, 1) - 1] = 'B'
  AND p.color_history[array_length(p.color_history, 1) - 2] = 'B';

-- Show ALL Round 4 pairings with color histories
SELECT 
  ROW_NUMBER() OVER (ORDER BY g.id) as board,
  wp.name || ' ' || wp.surname as white_player,
  wp.color_history as white_r1_3,
  wp.color_history || ARRAY['W'] as white_full,
  CASE 
    WHEN g.black_player_id = 0 THEN 'BYE'
    ELSE bp.name || ' ' || bp.surname 
  END as black_player,
  CASE 
    WHEN g.black_player_id = 0 THEN ARRAY[]::text[]
    ELSE bp.color_history 
  END as black_r1_3,
  CASE 
    WHEN g.black_player_id = 0 THEN ARRAY[]::text[]
    ELSE bp.color_history || ARRAY['B']
  END as black_full
FROM games g
LEFT JOIN players wp ON g.white_player_id = wp.id
LEFT JOIN players bp ON g.black_player_id = bp.id
WHERE g.round_number = 4
ORDER BY g.id;


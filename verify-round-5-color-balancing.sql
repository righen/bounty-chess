-- Verify Round 5 Color Balancing (FIDE Compliance Check)
-- ========================================================
-- Run this AFTER Round 5 is generated to verify no violations

-- PART 1: Check for CRITICAL violations (WWWW or BBBB) after Round 5
-- ====================================================================
SELECT 
  'CRITICAL: WWWW VIOLATIONS (4+ consecutive whites)' as violation_type,
  wp.name || ' ' || wp.surname as player,
  wp.color_history as rounds_1_4,
  wp.color_history || ARRAY['W'] as after_round_5,
  'BOARD ' || ROW_NUMBER() OVER (ORDER BY g.id) as board_number
FROM games g
JOIN players wp ON g.white_player_id = wp.id
WHERE g.round_number = 5
  AND array_length(wp.color_history, 1) >= 3
  AND wp.color_history[array_length(wp.color_history, 1)] = 'W'
  AND wp.color_history[array_length(wp.color_history, 1) - 1] = 'W'
  AND wp.color_history[array_length(wp.color_history, 1) - 2] = 'W'

UNION ALL

SELECT 
  'CRITICAL: BBBB VIOLATIONS (4+ consecutive blacks)' as violation_type,
  bp.name || ' ' || bp.surname as player,
  bp.color_history as rounds_1_4,
  bp.color_history || ARRAY['B'] as after_round_5,
  'BOARD ' || ROW_NUMBER() OVER (ORDER BY g.id) as board_number
FROM games g
JOIN players bp ON g.black_player_id = bp.id
WHERE g.round_number = 5
  AND g.black_player_id != 0  -- Exclude BYE
  AND array_length(bp.color_history, 1) >= 3
  AND bp.color_history[array_length(bp.color_history, 1)] = 'B'
  AND bp.color_history[array_length(bp.color_history, 1) - 1] = 'B'
  AND bp.color_history[array_length(bp.color_history, 1) - 2] = 'B';

-- PART 2: Check for WARNING (WWW or BBB) - players at risk for Round 6
-- =====================================================================
SELECT 
  'WARNING: WWW (needs Black in Round 6)' as warning_type,
  wp.name || ' ' || wp.surname as player,
  wp.color_history || ARRAY['W'] as after_round_5,
  'BOARD ' || ROW_NUMBER() OVER (ORDER BY g.id) as board_number
FROM games g
JOIN players wp ON g.white_player_id = wp.id
WHERE g.round_number = 5
  AND array_length(wp.color_history, 1) >= 2
  AND wp.color_history[array_length(wp.color_history, 1)] = 'W'
  AND wp.color_history[array_length(wp.color_history, 1) - 1] = 'W'
  -- Exclude if already WWWW (covered above)
  AND NOT (
    array_length(wp.color_history, 1) >= 3
    AND wp.color_history[array_length(wp.color_history, 1) - 2] = 'W'
  )

UNION ALL

SELECT 
  'WARNING: BBB (needs White in Round 6)' as warning_type,
  bp.name || ' ' || bp.surname as player,
  bp.color_history || ARRAY['B'] as after_round_5,
  'BOARD ' || ROW_NUMBER() OVER (ORDER BY g.id) as board_number
FROM games g
JOIN players bp ON g.black_player_id = bp.id
WHERE g.round_number = 5
  AND g.black_player_id != 0  -- Exclude BYE
  AND array_length(bp.color_history, 1) >= 2
  AND bp.color_history[array_length(bp.color_history, 1)] = 'B'
  AND bp.color_history[array_length(bp.color_history, 1) - 1] = 'B'
  -- Exclude if already BBBB (covered above)
  AND NOT (
    array_length(bp.color_history, 1) >= 3
    AND bp.color_history[array_length(bp.color_history, 1) - 2] = 'B'
  );

-- PART 3: Summary Statistics
-- ===========================
SELECT 
  'SUMMARY' as section,
  
  -- Critical violations count
  (SELECT COUNT(DISTINCT player_id) FROM (
    SELECT wp.id as player_id
    FROM games g
    JOIN players wp ON g.white_player_id = wp.id
    WHERE g.round_number = 5
      AND array_length(wp.color_history, 1) >= 3
      AND wp.color_history[array_length(wp.color_history, 1)] = 'W'
      AND wp.color_history[array_length(wp.color_history, 1) - 1] = 'W'
      AND wp.color_history[array_length(wp.color_history, 1) - 2] = 'W'
    UNION
    SELECT bp.id as player_id
    FROM games g
    JOIN players bp ON g.black_player_id = bp.id
    WHERE g.round_number = 5
      AND g.black_player_id != 0
      AND array_length(bp.color_history, 1) >= 3
      AND bp.color_history[array_length(bp.color_history, 1)] = 'B'
      AND bp.color_history[array_length(bp.color_history, 1) - 1] = 'B'
      AND bp.color_history[array_length(bp.color_history, 1) - 2] = 'B'
  ) violations) as critical_violations,
  
  -- Total games in Round 5
  (SELECT COUNT(*) FROM games WHERE round_number = 5) as total_round_5_games,
  
  -- Completed games in Round 5
  (SELECT COUNT(*) FROM games WHERE round_number = 5 AND completed = true) as completed_games,
  
  -- Pass/Fail status
  CASE 
    WHEN (SELECT COUNT(DISTINCT player_id) FROM (
      SELECT wp.id as player_id
      FROM games g
      JOIN players wp ON g.white_player_id = wp.id
      WHERE g.round_number = 5
        AND array_length(wp.color_history, 1) >= 3
        AND wp.color_history[array_length(wp.color_history, 1)] = 'W'
        AND wp.color_history[array_length(wp.color_history, 1) - 1] = 'W'
        AND wp.color_history[array_length(wp.color_history, 1) - 2] = 'W'
      UNION
      SELECT bp.id as player_id
      FROM games g
      JOIN players bp ON g.black_player_id = bp.id
      WHERE g.round_number = 5
        AND g.black_player_id != 0
        AND array_length(bp.color_history, 1) >= 3
        AND bp.color_history[array_length(bp.color_history, 1)] = 'B'
        AND bp.color_history[array_length(bp.color_history, 1) - 1] = 'B'
        AND bp.color_history[array_length(bp.color_history, 1) - 2] = 'B'
    ) violations) = 0 THEN '✅ PASS - No FIDE violations'
    ELSE '❌ FAIL - FIDE violations detected'
  END as fide_compliance_status;

-- PART 4: Detailed Round 5 Pairings with Full History
-- ====================================================
SELECT 
  ROW_NUMBER() OVER (ORDER BY g.id) as board,
  
  -- White Player
  wp.name || ' ' || wp.surname as white_player,
  wp.color_history as white_r1_4,
  wp.color_history || ARRAY['W'] as white_after_r5,
  
  -- Color balance for white
  CASE 
    WHEN array_length(wp.color_history, 1) >= 3
      AND wp.color_history[array_length(wp.color_history, 1)] = 'W'
      AND wp.color_history[array_length(wp.color_history, 1) - 1] = 'W'
      AND wp.color_history[array_length(wp.color_history, 1) - 2] = 'W'
    THEN '🔴 WWWW'
    WHEN array_length(wp.color_history, 1) >= 2
      AND wp.color_history[array_length(wp.color_history, 1)] = 'W'
      AND wp.color_history[array_length(wp.color_history, 1) - 1] = 'W'
    THEN '⚠️ WWW'
    ELSE '✅ OK'
  END as white_status,
  
  -- Black Player
  CASE 
    WHEN g.black_player_id = 0 THEN 'BYE'
    ELSE bp.name || ' ' || bp.surname 
  END as black_player,
  CASE 
    WHEN g.black_player_id = 0 THEN ARRAY[]::text[]
    ELSE bp.color_history 
  END as black_r1_4,
  CASE 
    WHEN g.black_player_id = 0 THEN ARRAY[]::text[]
    ELSE bp.color_history || ARRAY['B']
  END as black_after_r5,
  
  -- Color balance for black
  CASE 
    WHEN g.black_player_id = 0 THEN 'BYE'
    WHEN array_length(bp.color_history, 1) >= 3
      AND bp.color_history[array_length(bp.color_history, 1)] = 'B'
      AND bp.color_history[array_length(bp.color_history, 1) - 1] = 'B'
      AND bp.color_history[array_length(bp.color_history, 1) - 2] = 'B'
    THEN '🔴 BBBB'
    WHEN array_length(bp.color_history, 1) >= 2
      AND bp.color_history[array_length(bp.color_history, 1)] = 'B'
      AND bp.color_history[array_length(bp.color_history, 1) - 1] = 'B'
    THEN '⚠️ BBB'
    ELSE '✅ OK'
  END as black_status,
  
  -- Game info
  g.completed,
  g.result
  
FROM games g
LEFT JOIN players wp ON g.white_player_id = wp.id
LEFT JOIN players bp ON g.black_player_id = bp.id
WHERE g.round_number = 5
ORDER BY g.id;


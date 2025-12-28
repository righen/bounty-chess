-- Required Colors for Round 5 (Pre-Generation Check)
-- ===================================================
-- Run this BEFORE generating Round 5 to see which players
-- MUST get specific colors to avoid FIDE violations

-- Players with WWWW - MUST get Black in Round 5
SELECT 
  'MUST GET BLACK (has WWWW)' as requirement,
  p.name || ' ' || p.surname as player,
  p.color_history as current_history,
  p.bounty,
  p.wins,
  'CRITICAL' as priority
FROM players p
WHERE array_length(p.color_history, 1) >= 4
  AND p.color_history[array_length(p.color_history, 1)] = 'W'
  AND p.color_history[array_length(p.color_history, 1) - 1] = 'W'
  AND p.color_history[array_length(p.color_history, 1) - 2] = 'W'
  AND p.color_history[array_length(p.color_history, 1) - 3] = 'W'

UNION ALL

-- Players with BBBB - MUST get White in Round 5
SELECT 
  'MUST GET WHITE (has BBBB)' as requirement,
  p.name || ' ' || p.surname as player,
  p.color_history as current_history,
  p.bounty,
  p.wins,
  'CRITICAL' as priority
FROM players p
WHERE array_length(p.color_history, 1) >= 4
  AND p.color_history[array_length(p.color_history, 1)] = 'B'
  AND p.color_history[array_length(p.color_history, 1) - 1] = 'B'
  AND p.color_history[array_length(p.color_history, 1) - 2] = 'B'
  AND p.color_history[array_length(p.color_history, 1) - 3] = 'B'

UNION ALL

-- Players with WWW - Should get Black in Round 5 (not critical yet, but prevents WWWW)
SELECT 
  'SHOULD GET BLACK (has WWW)' as requirement,
  p.name || ' ' || p.surname as player,
  p.color_history as current_history,
  p.bounty,
  p.wins,
  'HIGH' as priority
FROM players p
WHERE array_length(p.color_history, 1) >= 3
  AND p.color_history[array_length(p.color_history, 1)] = 'W'
  AND p.color_history[array_length(p.color_history, 1) - 1] = 'W'
  AND p.color_history[array_length(p.color_history, 1) - 2] = 'W'
  -- Exclude WWWW (already covered above)
  AND NOT (
    array_length(p.color_history, 1) >= 4
    AND p.color_history[array_length(p.color_history, 1) - 3] = 'W'
  )

UNION ALL

-- Players with BBB - Should get White in Round 5
SELECT 
  'SHOULD GET WHITE (has BBB)' as requirement,
  p.name || ' ' || p.surname as player,
  p.color_history as current_history,
  p.bounty,
  p.wins,
  'HIGH' as priority
FROM players p
WHERE array_length(p.color_history, 1) >= 3
  AND p.color_history[array_length(p.color_history, 1)] = 'B'
  AND p.color_history[array_length(p.color_history, 1) - 1] = 'B'
  AND p.color_history[array_length(p.color_history, 1) - 2] = 'B'
  -- Exclude BBBB (already covered above)
  AND NOT (
    array_length(p.color_history, 1) >= 4
    AND p.color_history[array_length(p.color_history, 1) - 3] = 'B'
  )

ORDER BY 
  CASE priority
    WHEN 'CRITICAL' THEN 1
    WHEN 'HIGH' THEN 2
    ELSE 3
  END,
  requirement,
  player;

-- Summary counts
SELECT 
  'SUMMARY' as section,
  
  -- WWWW count (MUST fix)
  (SELECT COUNT(*) FROM players p
   WHERE array_length(p.color_history, 1) >= 4
     AND p.color_history[array_length(p.color_history, 1)] = 'W'
     AND p.color_history[array_length(p.color_history, 1) - 1] = 'W'
     AND p.color_history[array_length(p.color_history, 1) - 2] = 'W'
     AND p.color_history[array_length(p.color_history, 1) - 3] = 'W'
  ) as players_with_wwww,
  
  -- BBBB count (MUST fix)
  (SELECT COUNT(*) FROM players p
   WHERE array_length(p.color_history, 1) >= 4
     AND p.color_history[array_length(p.color_history, 1)] = 'B'
     AND p.color_history[array_length(p.color_history, 1) - 1] = 'B'
     AND p.color_history[array_length(p.color_history, 1) - 2] = 'B'
     AND p.color_history[array_length(p.color_history, 1) - 3] = 'B'
  ) as players_with_bbbb,
  
  -- WWW count (should fix)
  (SELECT COUNT(*) FROM players p
   WHERE array_length(p.color_history, 1) >= 3
     AND p.color_history[array_length(p.color_history, 1)] = 'W'
     AND p.color_history[array_length(p.color_history, 1) - 1] = 'W'
     AND p.color_history[array_length(p.color_history, 1) - 2] = 'W'
     AND NOT (
       array_length(p.color_history, 1) >= 4
       AND p.color_history[array_length(p.color_history, 1) - 3] = 'W'
     )
  ) as players_with_www,
  
  -- BBB count (should fix)
  (SELECT COUNT(*) FROM players p
   WHERE array_length(p.color_history, 1) >= 3
     AND p.color_history[array_length(p.color_history, 1)] = 'B'
     AND p.color_history[array_length(p.color_history, 1) - 1] = 'B'
     AND p.color_history[array_length(p.color_history, 1) - 2] = 'B'
     AND NOT (
       array_length(p.color_history, 1) >= 4
       AND p.color_history[array_length(p.color_history, 1) - 3] = 'B'
     )
  ) as players_with_bbb,
  
  -- Total critical cases
  (SELECT COUNT(*) FROM players p
   WHERE (
     -- WWWW
     (array_length(p.color_history, 1) >= 4
      AND p.color_history[array_length(p.color_history, 1)] = 'W'
      AND p.color_history[array_length(p.color_history, 1) - 1] = 'W'
      AND p.color_history[array_length(p.color_history, 1) - 2] = 'W'
      AND p.color_history[array_length(p.color_history, 1) - 3] = 'W')
     OR
     -- BBBB
     (array_length(p.color_history, 1) >= 4
      AND p.color_history[array_length(p.color_history, 1)] = 'B'
      AND p.color_history[array_length(p.color_history, 1) - 1] = 'B'
      AND p.color_history[array_length(p.color_history, 1) - 2] = 'B'
      AND p.color_history[array_length(p.color_history, 1) - 3] = 'B')
   )
  ) as total_critical_violations;


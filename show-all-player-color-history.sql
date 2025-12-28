-- Show All Players' Complete Color History
-- Simple view to check for violations

SELECT 
  p.name || ' ' || p.surname as player_name,
  p.color_history as color_history,
  ARRAY_LENGTH(p.color_history, 1) as total_rounds,
  
  -- Count colors
  (SELECT COUNT(*) FROM UNNEST(p.color_history) AS c WHERE c = 'W') as whites,
  (SELECT COUNT(*) FROM UNNEST(p.color_history) AS c WHERE c = 'B') as blacks,
  (SELECT COUNT(*) FROM UNNEST(p.color_history) AS c WHERE c = 'BYE') as byes,
  
  -- Color balance (positive = more whites, negative = more blacks)
  (SELECT COUNT(*) FROM UNNEST(p.color_history) AS c WHERE c = 'W') -
  (SELECT COUNT(*) FROM UNNEST(p.color_history) AS c WHERE c = 'B') as balance,
  
  -- Check for 3 consecutive same colors (VIOLATION)
  CASE
    -- Check WWW
    WHEN ARRAY_LENGTH(p.color_history, 1) >= 3 AND (
      (p.color_history[1] = 'W' AND p.color_history[2] = 'W' AND p.color_history[3] = 'W') OR
      (p.color_history[2] = 'W' AND p.color_history[3] = 'W' AND p.color_history[4] = 'W') OR
      (p.color_history[3] = 'W' AND p.color_history[4] = 'W' AND p.color_history[5] = 'W') OR
      (p.color_history[4] = 'W' AND p.color_history[5] = 'W' AND p.color_history[6] = 'W')
    ) THEN '❌ VIOLATION: 3 Whites'
    
    -- Check BBB
    WHEN ARRAY_LENGTH(p.color_history, 1) >= 3 AND (
      (p.color_history[1] = 'B' AND p.color_history[2] = 'B' AND p.color_history[3] = 'B') OR
      (p.color_history[2] = 'B' AND p.color_history[3] = 'B' AND p.color_history[4] = 'B') OR
      (p.color_history[3] = 'B' AND p.color_history[4] = 'B' AND p.color_history[5] = 'B') OR
      (p.color_history[4] = 'B' AND p.color_history[5] = 'B' AND p.color_history[6] = 'B')
    ) THEN '❌ VIOLATION: 3 Blacks'
    
    -- Check for 2 consecutive (warning)
    WHEN ARRAY_LENGTH(p.color_history, 1) >= 2 AND
         p.color_history[ARRAY_LENGTH(p.color_history, 1) - 1] = 
         p.color_history[ARRAY_LENGTH(p.color_history, 1)] AND
         p.color_history[ARRAY_LENGTH(p.color_history, 1)] != 'BYE'
    THEN '⚠️ Due opposite (last 2 same)'
    
    ELSE '✅ OK'
  END as status
  
FROM players p
WHERE ARRAY_LENGTH(p.color_history, 1) >= 1
ORDER BY 
  CASE 
    WHEN ARRAY_LENGTH(p.color_history, 1) >= 3 AND (
      (p.color_history[1] = 'W' AND p.color_history[2] = 'W' AND p.color_history[3] = 'W') OR
      (p.color_history[2] = 'W' AND p.color_history[3] = 'W' AND p.color_history[4] = 'W') OR
      (p.color_history[3] = 'W' AND p.color_history[4] = 'W' AND p.color_history[5] = 'W') OR
      (p.color_history[4] = 'W' AND p.color_history[5] = 'W' AND p.color_history[6] = 'W') OR
      (p.color_history[1] = 'B' AND p.color_history[2] = 'B' AND p.color_history[3] = 'B') OR
      (p.color_history[2] = 'B' AND p.color_history[3] = 'B' AND p.color_history[4] = 'B') OR
      (p.color_history[3] = 'B' AND p.color_history[4] = 'B' AND p.color_history[5] = 'B') OR
      (p.color_history[4] = 'B' AND p.color_history[5] = 'B' AND p.color_history[6] = 'B')
    ) THEN 0  -- Violations first
    ELSE 1
  END,
  p.surname, p.name;


-- Check Round 4 Color Balancing
-- Verify no player has 3+ consecutive same colors

-- =====================================================
-- 1. Show all Round 4 games with colors
-- =====================================================

SELECT 
  'Round 4 Games' as check_type,
  ROW_NUMBER() OVER (ORDER BY g.id) as board,
  pw.name || ' ' || pw.surname as white_player,
  pb.name || ' ' || pb.surname as black_player,
  pw.color_history as white_history,
  pb.color_history as black_history
FROM games g
LEFT JOIN players pw ON g.white_player_id = pw.id
LEFT JOIN players pb ON g.black_player_id = pb.id
WHERE g.round_number = 4
ORDER BY g.id;

-- =====================================================
-- 2. Check for VIOLATIONS - Players with 3+ consecutive same colors
-- =====================================================

WITH round_4_colors AS (
  SELECT 
    pw.id as player_id,
    pw.name || ' ' || pw.surname as player_name,
    'W' as round_4_color,
    pw.color_history
  FROM games g
  JOIN players pw ON g.white_player_id = pw.id
  WHERE g.round_number = 4
  
  UNION ALL
  
  SELECT 
    pb.id as player_id,
    pb.name || ' ' || pb.surname as player_name,
    'B' as round_4_color,
    pb.color_history
  FROM games g
  JOIN players pb ON g.black_player_id = pb.id
  WHERE g.round_number = 4 AND g.black_player_id != 0
),
with_full_history AS (
  SELECT 
    player_id,
    player_name,
    round_4_color,
    color_history,
    -- Get last 2 colors from history
    CASE 
      WHEN ARRAY_LENGTH(color_history, 1) >= 2 
      THEN color_history[ARRAY_LENGTH(color_history, 1) - 1]
      ELSE NULL
    END as last_color,
    CASE 
      WHEN ARRAY_LENGTH(color_history, 1) >= 2 
      THEN color_history[ARRAY_LENGTH(color_history, 1)]
      ELSE NULL
    END as second_last_color
  FROM round_4_colors
)
SELECT 
  '❌ VIOLATIONS' as status,
  player_name,
  color_history || round_4_color::TEXT as full_history_with_r4,
  second_last_color || last_color || round_4_color as last_3_colors,
  'VIOLATION: 3 consecutive ' || round_4_color || '''s' as violation_type
FROM with_full_history
WHERE second_last_color = last_color 
  AND last_color = round_4_color
  AND last_color != 'BYE'
ORDER BY player_name;

-- If no results, then no violations!

-- =====================================================
-- 3. Show all players with their complete color history
-- =====================================================

WITH round_4_colors AS (
  SELECT 
    pw.id as player_id,
    'W' as round_4_color
  FROM games g
  JOIN players pw ON g.white_player_id = pw.id
  WHERE g.round_number = 4
  
  UNION ALL
  
  SELECT 
    pb.id as player_id,
    'B' as round_4_color
  FROM games g
  JOIN players pb ON g.black_player_id = pb.id
  WHERE g.round_number = 4 AND g.black_player_id != 0
)
SELECT 
  'Player Color Analysis' as check_type,
  p.name || ' ' || p.surname as player_name,
  p.color_history as rounds_1_3,
  COALESCE(r4.round_4_color, 'BYE') as round_4,
  p.color_history || COALESCE(r4.round_4_color, 'BYE')::TEXT as full_history,
  
  -- Count whites and blacks
  (SELECT COUNT(*) FROM UNNEST(p.color_history) AS c WHERE c = 'W') + 
    CASE WHEN r4.round_4_color = 'W' THEN 1 ELSE 0 END as total_whites,
  (SELECT COUNT(*) FROM UNNEST(p.color_history) AS c WHERE c = 'B') + 
    CASE WHEN r4.round_4_color = 'B' THEN 1 ELSE 0 END as total_blacks,
  
  -- Color balance
  ((SELECT COUNT(*) FROM UNNEST(p.color_history) AS c WHERE c = 'W') + 
    CASE WHEN r4.round_4_color = 'W' THEN 1 ELSE 0 END) -
  ((SELECT COUNT(*) FROM UNNEST(p.color_history) AS c WHERE c = 'B') + 
    CASE WHEN r4.round_4_color = 'B' THEN 1 ELSE 0 END) as color_balance,
  
  -- Check last 3 colors for violations
  CASE 
    WHEN ARRAY_LENGTH(p.color_history, 1) >= 2 THEN
      CASE 
        WHEN p.color_history[ARRAY_LENGTH(p.color_history, 1) - 1] = 
             p.color_history[ARRAY_LENGTH(p.color_history, 1)] AND
             p.color_history[ARRAY_LENGTH(p.color_history, 1)] = r4.round_4_color AND
             p.color_history[ARRAY_LENGTH(p.color_history, 1)] != 'BYE'
        THEN '❌ VIOLATION'
        WHEN p.color_history[ARRAY_LENGTH(p.color_history, 1) - 1] = 
             p.color_history[ARRAY_LENGTH(p.color_history, 1)] AND
             p.color_history[ARRAY_LENGTH(p.color_history, 1)] != 'BYE'
        THEN '⚠️ Due opposite (had 2 same)'
        ELSE '✅ OK'
      END
    ELSE '✅ OK'
  END as status
FROM players p
LEFT JOIN round_4_colors r4 ON p.id = r4.player_id
WHERE ARRAY_LENGTH(p.color_history, 1) >= 1
ORDER BY 
  CASE 
    WHEN ARRAY_LENGTH(p.color_history, 1) >= 2 THEN
      CASE 
        WHEN p.color_history[ARRAY_LENGTH(p.color_history, 1) - 1] = 
             p.color_history[ARRAY_LENGTH(p.color_history, 1)] AND
             p.color_history[ARRAY_LENGTH(p.color_history, 1)] = r4.round_4_color AND
             p.color_history[ARRAY_LENGTH(p.color_history, 1)] != 'BYE'
        THEN 0  -- Violations first
        ELSE 1
      END
    ELSE 1
  END,
  p.surname, p.name;

-- =====================================================
-- 4. Summary Statistics
-- =====================================================

WITH round_4_colors AS (
  SELECT 
    pw.id as player_id,
    'W' as round_4_color
  FROM games g
  JOIN players pw ON g.white_player_id = pw.id
  WHERE g.round_number = 4
  
  UNION ALL
  
  SELECT 
    pb.id as player_id,
    'B' as round_4_color
  FROM games g
  JOIN players pb ON g.black_player_id = pb.id
  WHERE g.round_number = 4 AND g.black_player_id != 0
),
player_analysis AS (
  SELECT 
    p.id,
    p.color_history,
    r4.round_4_color,
    CASE 
      WHEN ARRAY_LENGTH(p.color_history, 1) >= 2 THEN
        CASE 
          WHEN p.color_history[ARRAY_LENGTH(p.color_history, 1) - 1] = 
               p.color_history[ARRAY_LENGTH(p.color_history, 1)] AND
               p.color_history[ARRAY_LENGTH(p.color_history, 1)] = r4.round_4_color AND
               p.color_history[ARRAY_LENGTH(p.color_history, 1)] != 'BYE'
          THEN true
          ELSE false
        END
      ELSE false
    END as has_violation
  FROM players p
  LEFT JOIN round_4_colors r4 ON p.id = r4.player_id
  WHERE ARRAY_LENGTH(p.color_history, 1) >= 1
)
SELECT 
  '📊 SUMMARY' as report,
  COUNT(*) as total_players_in_round_4,
  SUM(CASE WHEN has_violation THEN 1 ELSE 0 END) as players_with_violations,
  SUM(CASE WHEN NOT has_violation THEN 1 ELSE 0 END) as players_ok,
  CASE 
    WHEN SUM(CASE WHEN has_violation THEN 1 ELSE 0 END) = 0 
    THEN '🎉 ALL CORRECT! No violations'
    ELSE '❌ VIOLATIONS FOUND - See details above'
  END as overall_status
FROM player_analysis;

-- =====================================================
-- 5. Color distribution stats
-- =====================================================

SELECT 
  '📈 Color Distribution' as stats,
  COUNT(CASE WHEN pw.id IS NOT NULL THEN 1 END) as total_white_assignments,
  COUNT(CASE WHEN pb.id IS NOT NULL AND pb.id != 0 THEN 1 END) as total_black_assignments,
  COUNT(CASE WHEN g.black_player_id = 0 THEN 1 END) as bye_games
FROM games g
LEFT JOIN players pw ON g.white_player_id = pw.id
LEFT JOIN players pb ON g.black_player_id = pb.id
WHERE g.round_number = 4;


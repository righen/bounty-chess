-- Reset Round 4 for Regeneration with Fixed Color Balancing
-- Fixes bug: Players were getting more than 2 consecutive whites/blacks

-- =====================================================
-- 1. Check current state
-- =====================================================

SELECT 
  'Current State' as check_type,
  current_round,
  tournament_started
FROM tournament;

-- =====================================================
-- 2. Show Round 4 games before deletion
-- =====================================================

SELECT 
  'Round 4 Games (TO BE DELETED)' as check_type,
  COUNT(*) as total_games
FROM games
WHERE round_number = 4;

-- =====================================================
-- 3. Delete Round 4 games
-- =====================================================

DELETE FROM games
WHERE round_number = 4;

-- =====================================================
-- 4. Delete Round 4 from rounds table
-- =====================================================

DELETE FROM rounds
WHERE round_number = 4;

-- =====================================================
-- 5. Set tournament back to Round 3
-- =====================================================

UPDATE tournament
SET current_round = 3
WHERE id = '00000000-0000-0000-0000-000000000001';

-- =====================================================
-- 6. Verify deletion
-- =====================================================

SELECT 
  '✅ Round 4 Deleted' as status,
  (SELECT COUNT(*) FROM games WHERE round_number = 4) as round_4_games,
  (SELECT current_round FROM tournament LIMIT 1) as current_round,
  'Tournament ready to generate Round 4 with fixed pairing logic' as next_step
FROM tournament LIMIT 1;

-- =====================================================
-- 7. Show color history for verification
-- =====================================================

SELECT 
  'Player Color History' as info,
  name || ' ' || surname as player_name,
  color_history,
  ARRAY_LENGTH(color_history, 1) as rounds_played,
  CASE 
    WHEN ARRAY_LENGTH(color_history, 1) >= 2 
      AND color_history[ARRAY_LENGTH(color_history, 1)] = color_history[ARRAY_LENGTH(color_history, 1) - 1]
      AND color_history[ARRAY_LENGTH(color_history, 1)] != 'BYE'
    THEN '⚠️ Due opposite color (had 2 same)'
    ELSE '✅ Normal'
  END as color_status
FROM players
WHERE ARRAY_LENGTH(color_history, 1) >= 2
ORDER BY color_status, surname
LIMIT 20;

-- =====================================================
-- 8. Next Steps
-- =====================================================

SELECT 
  '📋 NEXT STEPS' as action,
  '1. Refresh your admin panel (Ctrl+Shift+R)' as step_1,
  '2. Go to Leaderboard tab' as step_2,
  '3. Click "Generate Round 4" button' as step_3,
  '4. New pairing will enforce: NO more than 2 consecutive same colors' as step_4;


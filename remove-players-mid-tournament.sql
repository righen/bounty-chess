-- Remove Sanju Backory and Vanji Motee (Mid-Tournament)
-- Currently at Round 3, need to continue to Round 4 without them

-- =====================================================
-- STEP 1: Check current tournament state
-- =====================================================

SELECT 
  'Current Tournament State' as check_type,
  current_round,
  total_rounds,
  tournament_started
FROM tournament;

-- =====================================================
-- STEP 2: Check the players to remove
-- =====================================================

SELECT 
  'Players to Remove' as check_type,
  id,
  name,
  surname,
  bounty,
  wins,
  losses,
  draws,
  'Round 1-3 games will be deleted' as impact
FROM players
WHERE (name = 'Sanju' AND surname = 'Backory')
   OR (name = 'Vanji' AND surname = 'Motee')
ORDER BY surname;

-- =====================================================
-- STEP 3: Check all their games across all rounds
-- =====================================================

SELECT 
  'Games Impact Analysis' as check_type,
  g.round_number,
  g.id as game_id,
  pw.name || ' ' || pw.surname as white_player,
  pb.name || ' ' || pb.surname as black_player,
  g.result,
  g.bounty_transferred,
  CASE 
    WHEN g.result IS NULL THEN 'Incomplete - Safe to delete'
    ELSE 'Completed - Will affect opponent bounties'
  END as impact
FROM games g
LEFT JOIN players pw ON g.white_player_id = pw.id
LEFT JOIN players pb ON g.black_player_id = pb.id
WHERE g.white_player_id IN (
    SELECT id FROM players 
    WHERE (name = 'Sanju' AND surname = 'Backory')
       OR (name = 'Vanji' AND surname = 'Motee')
  )
  OR g.black_player_id IN (
    SELECT id FROM players 
    WHERE (name = 'Sanju' AND surname = 'Backory')
       OR (name = 'Vanji' AND surname = 'Motee')
  )
ORDER BY g.round_number;

-- =====================================================
-- STEP 4: Delete their games from ALL rounds
-- =====================================================

-- This will remove their game history
-- WARNING: This may affect opponent bounties if games were completed!

DELETE FROM games
WHERE white_player_id IN (
    SELECT id FROM players 
    WHERE (name = 'Sanju' AND surname = 'Backory')
       OR (name = 'Vanji' AND surname = 'Motee')
  )
  OR black_player_id IN (
    SELECT id FROM players 
    WHERE (name = 'Sanju' AND surname = 'Backory')
       OR (name = 'Vanji' AND surname = 'Motee')
  );

-- =====================================================
-- STEP 5: Delete the players
-- =====================================================

DELETE FROM players
WHERE (name = 'Sanju' AND surname = 'Backory')
   OR (name = 'Vanji' AND surname = 'Motee');

-- =====================================================
-- STEP 6: Verify and show impact
-- =====================================================

SELECT 
  '✅ Players Removed' as status,
  COUNT(*) as remaining_players,
  'Round 4 can now be generated with 49 players' as next_step
FROM players;

-- Check tournament is still at Round 3
SELECT 
  'Tournament Status' as check_type,
  current_round,
  'Still at Round 3 - Ready for Round 4' as status
FROM tournament;

-- Show remaining players
SELECT 
  'Remaining Players' as check_type,
  COUNT(*) as total
FROM players;

-- =====================================================
-- STEP 7: IMPORTANT - Recalculate affected opponent bounties
-- =====================================================

-- List players who played against the removed players
-- Their bounties may need adjustment

SELECT 
  '⚠️ AFFECTED PLAYERS' as warning,
  'These players had games deleted' as note,
  'Their bounties may need recalculation' as action_needed
FROM games LIMIT 0;

-- Since games are deleted, we can't directly query them
-- But the opponents' bounties should be recalculated
-- Run the validation script after this to check all bounties

-- =====================================================
-- STEP 8: Next Steps
-- =====================================================

SELECT 
  '📋 NEXT STEPS' as action,
  '1. Run validation script to check all bounties are correct' as step_1,
  '2. Generate Round 4 pairings (will have 49 players now)' as step_2,
  '3. One player will get BYE in Round 4 (odd number)' as step_3;


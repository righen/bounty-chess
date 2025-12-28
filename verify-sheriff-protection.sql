-- Verify Sheriff Protection is Working Correctly
-- Check the 2 games where loser used sheriff for protection

-- =====================================================
-- Check Game 1: Rama vs Seeven
-- =====================================================

SELECT 
  'Game 1: Rama vs Seeven' as game,
  g.result as winner,
  g.black_sheriff_used as seeven_used_sheriff_for_protection,
  g.bounty_transferred as actual_transfer,
  '0 (Sheriff Protection)' as expected_transfer,
  pw.bounty as rama_bounty,
  pb.bounty as seeven_bounty,
  pw.criminal_status as rama_criminal_status,
  pb.criminal_status as seeven_criminal_status
FROM games g
JOIN players pw ON g.white_player_id = pw.id
JOIN players pb ON g.black_player_id = pb.id
WHERE pw.name = 'Rama' AND pw.surname = 'Baloonuck'
  AND pb.name = 'Seeven' AND pb.surname = 'Parian';

-- Expected:
-- - Transfer = 0 (Seeven used sheriff for protection)
-- - Rama should be ANGRY (criminal status)
-- - Rama bounty = 20 (no gain)
-- - Seeven bounty = 20 (protected, no loss)

-- =====================================================
-- Check Game 2: Noah vs Keshav
-- =====================================================

SELECT 
  'Game 2: Noah vs Keshav' as game,
  g.result as winner,
  g.black_sheriff_used as keshav_used_sheriff_for_protection,
  g.bounty_transferred as actual_transfer,
  '0 (Sheriff Protection)' as expected_transfer,
  pw.bounty as noah_bounty,
  pb.bounty as keshav_bounty,
  pw.criminal_status as noah_criminal_status,
  pb.criminal_status as keshav_criminal_status
FROM games g
JOIN players pw ON g.white_player_id = pw.id
JOIN players pb ON g.black_player_id = pb.id
WHERE pw.name = 'Noah Mikhael' AND pw.surname = 'Hardy'
  AND pb.name = 'Keshav' AND pb.surname = 'Sooroojebally';

-- Expected:
-- - Transfer = 0 (Keshav used sheriff for protection)
-- - Noah should be ANGRY (criminal status)
-- - Noah bounty = 20 (no gain)
-- - Keshav bounty = 20 (protected, no loss)

-- =====================================================
-- Verify ALL sheriff protection games are correct
-- =====================================================

SELECT 
  pw.name || ' ' || pw.surname as winner,
  pb.name || ' ' || pb.surname as loser,
  CASE 
    WHEN g.result = 'white' THEN 'Black used sheriff (protection)'
    WHEN g.result = 'black' THEN 'White used sheriff (protection)'
  END as protection_type,
  g.bounty_transferred,
  pw.bounty as winner_bounty,
  pb.bounty as loser_bounty,
  pw.criminal_status as winner_status,
  pb.criminal_status as loser_status,
  CASE 
    WHEN g.bounty_transferred = 0 AND pw.criminal_status IN ('angry', 'mad') 
    THEN '✅ Correct (0 transfer, winner angry/mad)'
    WHEN g.bounty_transferred = 0 
    THEN '⚠️ Check (0 transfer but winner not angry)'
    ELSE '❌ Wrong (should be 0)'
  END as verification
FROM games g
JOIN players pw ON g.white_player_id = pw.id
JOIN players pb ON g.black_player_id = pb.id
WHERE g.round_number = 1
  AND ((g.result = 'white' AND g.black_sheriff_used = true)
    OR (g.result = 'black' AND g.white_sheriff_used = true));


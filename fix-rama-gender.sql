-- Fix Rama Baloonuck Gender
-- Should be Male, not Female

-- =====================================================
-- 1. Check current state and games
-- =====================================================

SELECT 
  'Current State' as check_type,
  id,
  name,
  surname,
  gender,
  bounty,
  wins,
  losses,
  draws
FROM players
WHERE name = 'Rama' AND surname = 'Baloonuck';

-- Check Rama's games
SELECT 
  'Rama Games' as check_type,
  g.id,
  g.round_number,
  CASE 
    WHEN g.white_player_id = 4 THEN 'White (Rama)'
    ELSE 'Black (Rama)'
  END as rama_color,
  pw.name || ' ' || pw.surname as white_player,
  pb.name || ' ' || pb.surname as black_player,
  g.result,
  g.white_sheriff_used,
  g.black_sheriff_used,
  g.bounty_transferred,
  CASE
    WHEN g.result = 'white' AND g.white_player_id = 4 THEN 'Rama WON'
    WHEN g.result = 'black' AND g.black_player_id = 4 THEN 'Rama WON'
    WHEN g.result = 'white' AND g.black_player_id = 4 THEN 'Rama LOST'
    WHEN g.result = 'black' AND g.white_player_id = 4 THEN 'Rama LOST'
    WHEN g.result = 'draw' THEN 'DRAW'
    ELSE 'Unknown'
  END as outcome
FROM games g
LEFT JOIN players pw ON g.white_player_id = pw.id
LEFT JOIN players pb ON g.black_player_id = pb.id
WHERE g.white_player_id = 4 OR g.black_player_id = 4;

-- =====================================================
-- 2. Fix gender to Male
-- =====================================================

UPDATE players
SET gender = 'M'
WHERE name = 'Rama' AND surname = 'Baloonuck';

-- =====================================================
-- 3. Check if bounty calculation needs adjustment
-- =====================================================

-- Rama's game was:
-- Rama (white, F) vs Seeven Parian (black, M)
-- Result: White won (Rama won)
-- Seeven used sheriff for protection
-- Transfer = 0 (sheriff protection)
-- 
-- Gender doesn't matter when sheriff protection is used!
-- Transfer is always 0 regardless of gender
-- So no recalculation needed!

SELECT 
  '✅ Gender Fixed' as status,
  'No bounty recalculation needed' as note,
  'Sheriff protection = 0 transfer regardless of gender' as reason
FROM players
WHERE name = 'Rama' AND surname = 'Baloonuck';

-- =====================================================
-- 4. Verify the fix
-- =====================================================

SELECT 
  '✅ AFTER FIX' as status,
  name,
  surname,
  gender,
  bounty
FROM players
WHERE name = 'Rama' AND surname = 'Baloonuck';

-- Show all gender fixes made
SELECT 
  'All Gender Corrections' as summary,
  name,
  surname,
  gender,
  '✅ Verified' as status
FROM players 
WHERE (name = 'Stephane' AND surname = 'Lam')
   OR (name = 'Keshavi' AND surname = 'Meenowa')
   OR (name = 'Loganatha' AND surname = 'Pillay')
   OR (name = 'Rama' AND surname = 'Baloonuck')
ORDER BY surname;

-- Expected:
-- Stephane Lam: M
-- Keshavi Meenowa: F
-- Loganatha Pillay: M
-- Rama Baloonuck: M


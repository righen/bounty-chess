-- Fix Stephane Lam Gender and Recalculate Bounty
-- The game was calculated when Stephane was marked as Female, need to recalculate

-- =====================================================
-- PART 1: Check current state
-- =====================================================

-- Check current bounties
SELECT 
  name, 
  surname, 
  gender, 
  bounty,
  'BEFORE FIX' as status
FROM players 
WHERE (name = 'Stephane' AND surname = 'Lam')
   OR (name = 'Bhavish' AND surname = 'Sunnassee')
ORDER BY surname;

-- =====================================================
-- PART 2: Fix all gender issues
-- =====================================================

-- Fix Stephane Lam (Male, not Female)
UPDATE players
SET gender = 'M'
WHERE name = 'Stephane' AND surname = 'Lam';

-- Fix Keshavi Meenowa (Female)
UPDATE players
SET gender = 'F'
WHERE name = 'Keshavi' AND surname = 'Meenowa';

-- Fix Loganatha Pillay (Male)
UPDATE players
SET gender = 'M'
WHERE name = 'Loganatha' AND surname = 'Pillay';

-- =====================================================
-- PART 3: Recalculate Stephane vs Bhavish bounty
-- =====================================================

-- EXPLANATION:
-- Stephane was Female when game was calculated:
--   Female protection (Round 1): 20 × (1/3) = 6.67 → 6 bounty
--   Sheriff boost: 6 × 1.2 = 7.2 → 7 bounty transferred
--   Result: Stephane = 13, Bhavish = 27
--
-- Stephane is actually Male:
--   Male: 20 × 50% = 10 bounty
--   Sheriff boost: 10 × 1.2 = 12 bounty should transfer
--   Should be: Stephane = 8, Bhavish = 32
--
-- Adjustment needed: 5 more bounty should transfer

-- Fix Stephane (currently 13, should be 8 = lose 5 more)
UPDATE players
SET bounty = bounty - 5
WHERE name = 'Stephane' AND surname = 'Lam';

-- Fix Bhavish (currently 27, should be 32 = gain 5 more)
UPDATE players
SET bounty = bounty + 5
WHERE name = 'Bhavish' AND surname = 'Sunnassee';

-- Update the game record with correct transfer amount
UPDATE games
SET bounty_transferred = 12
WHERE round_number = 1
  AND ((white_player_id = 15 AND black_player_id = 29)
    OR (white_player_id = 29 AND black_player_id = 15));

-- =====================================================
-- PART 4: Verify all fixes
-- =====================================================

-- Verify bounties are correct
SELECT 
  name, 
  surname, 
  gender, 
  bounty,
  'AFTER FIX' as status
FROM players 
WHERE (name = 'Stephane' AND surname = 'Lam')
   OR (name = 'Bhavish' AND surname = 'Sunnassee')
ORDER BY surname;

-- Expected:
-- Stephane Lam: M, 8 bounty
-- Bhavish Sunnassee: M, 32 bounty

-- Verify all gender fixes
SELECT 
  name, 
  surname, 
  gender,
  'Gender Fixed' as status
FROM players 
WHERE (name = 'Stephane' AND surname = 'Lam')
   OR (name = 'Keshavi' AND surname = 'Meenowa')
   OR (name = 'Loganatha' AND surname = 'Pillay')
ORDER BY surname;

-- Expected:
-- Stephane Lam: M
-- Keshavi Meenowa: F
-- Loganatha Pillay: M

-- Show the corrected game
SELECT 
  g.id,
  g.round_number,
  pw.name || ' ' || pw.surname as white_player,
  pb.name || ' ' || pb.surname as black_player,
  g.result,
  g.white_sheriff_used,
  g.black_sheriff_used,
  g.bounty_transferred,
  pw.bounty as white_bounty,
  pb.bounty as black_bounty
FROM games g
LEFT JOIN players pw ON g.white_player_id = pw.id
LEFT JOIN players pb ON g.black_player_id = pb.id
WHERE g.round_number = 1
  AND ((g.white_player_id = 15 AND g.black_player_id = 29)
    OR (g.white_player_id = 29 AND g.black_player_id = 15));

-- Expected bounty_transferred: 12


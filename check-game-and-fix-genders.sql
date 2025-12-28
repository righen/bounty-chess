-- Check Game Result and Fix Gender Issues
-- Run this in Supabase SQL Editor

-- =====================================================
-- PART 1: Check the specific game and bounties
-- =====================================================

-- Find Stephane Lam and Bhavish Sunnassee
SELECT 
  id, 
  name, 
  surname, 
  gender, 
  bounty, 
  wins, 
  losses, 
  draws,
  has_sheriff_badge
FROM players 
WHERE (name = 'Stephane' AND surname = 'Lam')
   OR (name = 'Bhavish' AND surname = 'Sunnassee')
ORDER BY surname;

-- Check their game in Round 1
SELECT 
  g.id,
  g.round_number,
  g.white_player_id,
  g.black_player_id,
  g.result,
  g.sheriff_white,
  g.sheriff_black,
  g.bounty_transfer,
  pw.name || ' ' || pw.surname as white_player,
  pb.name || ' ' || pb.surname as black_player
FROM games g
LEFT JOIN players pw ON g.white_player_id = pw.id
LEFT JOIN players pb ON g.black_player_id = pb.id
WHERE g.round_number = 1
  AND ((g.white_player_id = 15 OR g.black_player_id = 15)  -- Stephane Lam
    OR (g.white_player_id = 29 OR g.black_player_id = 29)); -- Bhavish Sunnassee

-- =====================================================
-- PART 2: Fix Gender Issues
-- =====================================================

-- Fix Stephane Lam (Male, not Female)
UPDATE players
SET gender = 'M'
WHERE name = 'Stephane' AND surname = 'Lam';

-- Verify Keshavi Meenowa (should be Female)
SELECT id, name, surname, gender FROM players
WHERE name = 'Keshavi' AND surname = 'Meenowa';

-- Update Keshavi to Female if needed
UPDATE players
SET gender = 'F'
WHERE name = 'Keshavi' AND surname = 'Meenowa';

-- Fix Loganatha Pillay (Male)
UPDATE players
SET gender = 'M'
WHERE name = 'Loganatha' AND surname = 'Pillay';

-- =====================================================
-- PART 3: Verify Gender Fixes
-- =====================================================

SELECT 
  name, 
  surname, 
  gender,
  'Fixed' as status
FROM players 
WHERE (name = 'Stephane' AND surname = 'Lam')
   OR (name = 'Keshavi' AND surname = 'Meenowa')
   OR (name = 'Loganatha' AND surname = 'Pillay')
ORDER BY surname;

-- =====================================================
-- PART 4: Check all games with sheriff usage
-- =====================================================

SELECT 
  g.id,
  g.round_number,
  pw.name || ' ' || pw.surname as white_player,
  pb.name || ' ' || pb.surname as black_player,
  g.result,
  g.sheriff_white,
  g.sheriff_black,
  g.bounty_transfer,
  pw.bounty as white_bounty,
  pb.bounty as black_bounty
FROM games g
LEFT JOIN players pw ON g.white_player_id = pw.id
LEFT JOIN players pb ON g.black_player_id = pb.id
WHERE (g.sheriff_white = true OR g.sheriff_black = true)
  AND g.result IS NOT NULL
ORDER BY g.round_number, g.id;


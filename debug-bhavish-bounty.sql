-- Debug: Why is Bhavish still at 27 bounty?
-- Check the complete history

-- =====================================================
-- 1. Check Bhavish's current state
-- =====================================================

SELECT 
  'Current State' as check_type,
  id,
  name,
  surname,
  bounty,
  wins,
  losses,
  draws,
  has_sheriff_badge,
  criminal_status
FROM players
WHERE name = 'Bhavish' AND surname = 'Sunnassee';

-- =====================================================
-- 2. Check ALL games Bhavish played
-- =====================================================

SELECT 
  'Bhavish Games' as check_type,
  g.id,
  g.round_number,
  CASE 
    WHEN g.white_player_id = 29 THEN 'White'
    WHEN g.black_player_id = 29 THEN 'Black'
  END as bhavish_color,
  pw.name || ' ' || pw.surname as white_player,
  pb.name || ' ' || pb.surname as black_player,
  g.result,
  g.white_sheriff_used,
  g.black_sheriff_used,
  g.bounty_transferred,
  CASE
    WHEN g.result = 'white' AND g.white_player_id = 29 THEN 'Bhavish WON'
    WHEN g.result = 'black' AND g.black_player_id = 29 THEN 'Bhavish WON'
    WHEN g.result = 'white' AND g.black_player_id = 29 THEN 'Bhavish LOST'
    WHEN g.result = 'black' AND g.white_player_id = 29 THEN 'Bhavish LOST'
    WHEN g.result = 'draw' THEN 'DRAW'
    ELSE 'Unknown'
  END as outcome
FROM games g
LEFT JOIN players pw ON g.white_player_id = pw.id
LEFT JOIN players pb ON g.black_player_id = pb.id
WHERE g.white_player_id = 29 OR g.black_player_id = 29;

-- =====================================================
-- 3. Calculate what Bhavish's bounty SHOULD be
-- =====================================================

WITH bhavish_games AS (
  SELECT 
    g.bounty_transferred,
    CASE
      -- Bhavish won
      WHEN (g.result = 'white' AND g.white_player_id = 29) 
        OR (g.result = 'black' AND g.black_player_id = 29) 
      THEN 
        CASE 
          -- Check if opponent used sheriff (protection)
          WHEN (g.white_player_id = 29 AND g.black_sheriff_used = true)
            OR (g.black_player_id = 29 AND g.white_sheriff_used = true)
          THEN 0  -- No bounty gained due to protection
          ELSE g.bounty_transferred  -- Gain bounty
        END
      
      -- Bhavish lost
      WHEN (g.result = 'white' AND g.black_player_id = 29) 
        OR (g.result = 'black' AND g.white_player_id = 29)
      THEN
        CASE
          -- Check if Bhavish used sheriff (protection)
          WHEN (g.white_player_id = 29 AND g.white_sheriff_used = true)
            OR (g.black_player_id = 29 AND g.black_sheriff_used = true)
          THEN 0  -- No bounty lost due to protection
          ELSE -g.bounty_transferred  -- Lose bounty
        END
      
      -- Draw
      ELSE 0
    END as bounty_change
  FROM games g
  WHERE (g.white_player_id = 29 OR g.black_player_id = 29)
    AND g.result IS NOT NULL
)
SELECT 
  'Bhavish Bounty Calculation' as check_type,
  20 as starting_bounty,
  SUM(bounty_change) as total_change,
  20 + SUM(bounty_change) as expected_bounty,
  (SELECT bounty FROM players WHERE id = 29) as actual_bounty,
  ((SELECT bounty FROM players WHERE id = 29) - (20 + SUM(bounty_change))) as difference
FROM bhavish_games;

-- =====================================================
-- 4. FIX: Update Bhavish to correct bounty
-- =====================================================

-- Calculate correct bounty first
WITH bhavish_games AS (
  SELECT 
    CASE
      WHEN (g.result = 'white' AND g.white_player_id = 29) 
        OR (g.result = 'black' AND g.black_player_id = 29) 
      THEN 
        CASE 
          WHEN (g.white_player_id = 29 AND g.black_sheriff_used = true)
            OR (g.black_player_id = 29 AND g.white_sheriff_used = true)
          THEN 0
          ELSE g.bounty_transferred
        END
      WHEN (g.result = 'white' AND g.black_player_id = 29) 
        OR (g.result = 'black' AND g.white_player_id = 29)
      THEN
        CASE
          WHEN (g.white_player_id = 29 AND g.white_sheriff_used = true)
            OR (g.black_player_id = 29 AND g.black_sheriff_used = true)
          THEN 0
          ELSE -g.bounty_transferred
        END
      ELSE 0
    END as bounty_change
  FROM games g
  WHERE (g.white_player_id = 29 OR g.black_player_id = 29)
    AND g.result IS NOT NULL
),
correct_bounty AS (
  SELECT 20 + SUM(bounty_change) as should_be
  FROM bhavish_games
)
UPDATE players
SET bounty = (SELECT should_be FROM correct_bounty)
WHERE id = 29;

-- =====================================================
-- 5. Verify the fix
-- =====================================================

SELECT 
  '✅ AFTER FIX' as status,
  name,
  surname,
  bounty
FROM players
WHERE id = 29;


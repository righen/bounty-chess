-- Simple Audit of All Bounty Calculations
-- Check if transfers match expected amounts

-- =====================================================
-- Show all completed games with actual vs expected transfer
-- =====================================================

WITH game_calculations AS (
  SELECT 
    g.id,
    g.round_number,
    pw.name || ' ' || pw.surname as white_player,
    pb.name || ' ' || pb.surname as black_player,
    g.result,
    g.white_sheriff_used,
    g.black_sheriff_used,
    g.bounty_transferred as actual_transfer,
    
    -- Calculate expected transfer based on starting bounty of 20
    CASE
      -- Draw or no result
      WHEN g.result IS NULL OR g.result = 'draw' THEN 0
      
      -- BYE game
      WHEN g.black_player_id = 0 THEN 0
      
      -- White wins (black loses)
      WHEN g.result = 'white' THEN
        CASE
          -- U12 protection (1/4 loss) in round 1
          WHEN pb.age < 12 THEN 
            CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(20 * 0.25) * 1.2) 
                 ELSE FLOOR(20 * 0.25) END
          
          -- Female or U16 protection (1/3 loss) in round 1
          WHEN pb.gender = 'F' OR pb.age < 16 THEN
            CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(20 * 0.333) * 1.2)
                 ELSE FLOOR(20 * 0.333) END
          
          -- Normal male adult (1/2 loss)
          ELSE
            CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(20 * 0.5) * 1.2)
                 ELSE FLOOR(20 * 0.5) END
        END
      
      -- Black wins (white loses)
      WHEN g.result = 'black' THEN
        CASE
          WHEN pw.age < 12 THEN 
            CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(20 * 0.25) * 1.2)
                 ELSE FLOOR(20 * 0.25) END
          
          WHEN pw.gender = 'F' OR pw.age < 16 THEN
            CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(20 * 0.333) * 1.2)
                 ELSE FLOOR(20 * 0.333) END
          
          ELSE
            CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(20 * 0.5) * 1.2)
                 ELSE FLOOR(20 * 0.5) END
        END
      
      ELSE 0
    END as expected_transfer,
    
    pw.gender as white_gender,
    pw.age as white_age,
    pb.gender as black_gender,
    pb.age as black_age,
    pw.bounty as white_bounty,
    pb.bounty as black_bounty
    
  FROM games g
  LEFT JOIN players pw ON g.white_player_id = pw.id
  LEFT JOIN players pb ON g.black_player_id = pb.id
  WHERE g.round_number = 1
    AND g.result IS NOT NULL
)
SELECT 
  *,
  CASE 
    WHEN actual_transfer = expected_transfer THEN '✅ Correct'
    ELSE '❌ WRONG (Expected: ' || expected_transfer || ')'
  END as status
FROM game_calculations
ORDER BY 
  CASE WHEN actual_transfer = expected_transfer THEN 1 ELSE 0 END,
  id;

-- =====================================================
-- Summary: How many are wrong?
-- =====================================================

WITH game_calculations AS (
  SELECT 
    g.id,
    g.bounty_transferred as actual_transfer,
    CASE
      WHEN g.result IS NULL OR g.result = 'draw' THEN 0
      WHEN g.black_player_id = 0 THEN 0
      WHEN g.result = 'white' THEN
        CASE
          WHEN pb.age < 12 THEN 
            CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(20 * 0.25) * 1.2) ELSE FLOOR(20 * 0.25) END
          WHEN pb.gender = 'F' OR pb.age < 16 THEN
            CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(20 * 0.333) * 1.2) ELSE FLOOR(20 * 0.333) END
          ELSE
            CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(20 * 0.5) * 1.2) ELSE FLOOR(20 * 0.5) END
        END
      WHEN g.result = 'black' THEN
        CASE
          WHEN pw.age < 12 THEN 
            CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(20 * 0.25) * 1.2) ELSE FLOOR(20 * 0.25) END
          WHEN pw.gender = 'F' OR pw.age < 16 THEN
            CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(20 * 0.333) * 1.2) ELSE FLOOR(20 * 0.333) END
          ELSE
            CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(20 * 0.5) * 1.2) ELSE FLOOR(20 * 0.5) END
        END
      ELSE 0
    END as expected_transfer
  FROM games g
  LEFT JOIN players pw ON g.white_player_id = pw.id
  LEFT JOIN players pb ON g.black_player_id = pb.id
  WHERE g.round_number = 1 AND g.result IS NOT NULL
)
SELECT 
  COUNT(*) as total_games,
  SUM(CASE WHEN actual_transfer = expected_transfer THEN 1 ELSE 0 END) as correct,
  SUM(CASE WHEN actual_transfer != expected_transfer THEN 1 ELSE 0 END) as wrong
FROM game_calculations;

-- =====================================================
-- List only WRONG calculations for easy fixing
-- =====================================================

WITH game_calculations AS (
  SELECT 
    g.id,
    pw.name || ' ' || pw.surname as white_player,
    pb.name || ' ' || pb.surname as black_player,
    g.result,
    g.white_sheriff_used,
    g.black_sheriff_used,
    g.bounty_transferred as actual_transfer,
    CASE
      WHEN g.result IS NULL OR g.result = 'draw' THEN 0
      WHEN g.black_player_id = 0 THEN 0
      WHEN g.result = 'white' THEN
        CASE
          WHEN pb.age < 12 THEN 
            CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(20 * 0.25) * 1.2) ELSE FLOOR(20 * 0.25) END
          WHEN pb.gender = 'F' OR pb.age < 16 THEN
            CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(20 * 0.333) * 1.2) ELSE FLOOR(20 * 0.333) END
          ELSE
            CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(20 * 0.5) * 1.2) ELSE FLOOR(20 * 0.5) END
        END
      WHEN g.result = 'black' THEN
        CASE
          WHEN pw.age < 12 THEN 
            CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(20 * 0.25) * 1.2) ELSE FLOOR(20 * 0.25) END
          WHEN pw.gender = 'F' OR pw.age < 16 THEN
            CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(20 * 0.333) * 1.2) ELSE FLOOR(20 * 0.333) END
          ELSE
            CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(20 * 0.5) * 1.2) ELSE FLOOR(20 * 0.5) END
        END
      ELSE 0
    END as expected_transfer,
    pw.gender as white_gender,
    pb.gender as black_gender
  FROM games g
  LEFT JOIN players pw ON g.white_player_id = pw.id
  LEFT JOIN players pb ON g.black_player_id = pb.id
  WHERE g.round_number = 1 AND g.result IS NOT NULL
)
SELECT 
  '❌ WRONG CALCULATION' as issue,
  white_player,
  black_player,
  result,
  white_sheriff_used,
  black_sheriff_used,
  white_gender,
  black_gender,
  actual_transfer,
  expected_transfer,
  (expected_transfer - actual_transfer) as adjustment_needed
FROM game_calculations
WHERE actual_transfer != expected_transfer;


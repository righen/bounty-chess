-- Audit ALL Bounty Calculations for Round 1
-- Check if bounties were calculated correctly based on gender, age, and sheriff usage

-- =====================================================
-- PART 1: Get all completed games with player details
-- =====================================================

SELECT 
  g.id,
  g.round_number,
  g.result,
  g.white_sheriff_used,
  g.black_sheriff_used,
  g.bounty_transferred,
  
  -- White player details
  pw.id as white_id,
  pw.name || ' ' || pw.surname as white_player,
  pw.gender as white_gender,
  pw.age as white_age,
  pw.bounty as white_current_bounty,
  
  -- Black player details
  pb.id as black_id,
  pb.name || ' ' || pb.surname as black_player,
  pb.gender as black_gender,
  pb.age as black_age,
  pb.bounty as black_current_bounty,
  
  -- Calculate what the transfer SHOULD BE
  CASE
    -- Draw = 0 transfer
    WHEN g.result = 'draw' THEN 0
    
    -- BYE game = 0 transfer
    WHEN g.black_player_id = 0 THEN 0
    
    -- White wins
    WHEN g.result = 'white' THEN
      CASE
        -- Calculate base loss for black player (loser)
        -- If bounty <= 2, lose everything
        WHEN pb.bounty <= 2 THEN
          CASE WHEN g.white_sheriff_used THEN FLOOR(pb.bounty * 1.2) ELSE pb.bounty END
        
        -- U12 protection (first 5 rounds) = 1/4
        WHEN pb.age < 12 AND g.round_number <= 5 THEN
          CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(pb.bounty * 0.25) * 1.2) ELSE FLOOR(pb.bounty * 0.25) END
        
        -- Female or U16 protection (first 5 rounds) = 1/3
        WHEN (pb.gender = 'F' OR pb.age < 16) AND g.round_number <= 5 THEN
          CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(pb.bounty * 0.333) * 1.2) ELSE FLOOR(pb.bounty * 0.333) END
        
        -- Normal loss = 1/2
        ELSE
          CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(pb.bounty * 0.5) * 1.2) ELSE FLOOR(pb.bounty * 0.5) END
      END
    
    -- Black wins
    WHEN g.result = 'black' THEN
      CASE
        -- Calculate base loss for white player (loser)
        WHEN pw.bounty <= 2 THEN
          CASE WHEN g.black_sheriff_used THEN FLOOR(pw.bounty * 1.2) ELSE pw.bounty END
        
        WHEN pw.age < 12 AND g.round_number <= 5 THEN
          CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(pw.bounty * 0.25) * 1.2) ELSE FLOOR(pw.bounty * 0.25) END
        
        WHEN (pw.gender = 'F' OR pw.age < 16) AND g.round_number <= 5 THEN
          CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(pw.bounty * 0.333) * 1.2) ELSE FLOOR(pw.bounty * 0.333) END
        
        ELSE
          CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(pw.bounty * 0.5) * 1.2) ELSE FLOOR(pw.bounty * 0.5) END
      END
    
    ELSE 0
  END as expected_transfer,
  
  -- Check if it matches
  CASE
    WHEN g.result IS NULL THEN 'Not Completed'
    WHEN g.black_player_id = 0 THEN 'BYE Game'
    WHEN g.result = 'draw' THEN 
      CASE WHEN g.bounty_transferred = 0 THEN '✅ Correct' ELSE '❌ WRONG' END
    ELSE
      CASE 
        WHEN g.bounty_transferred = (
          CASE
            WHEN g.result = 'white' THEN
              CASE
                WHEN pb.bounty <= 2 THEN
                  CASE WHEN g.white_sheriff_used THEN FLOOR(pb.bounty * 1.2) ELSE pb.bounty END
                WHEN pb.age < 12 AND g.round_number <= 5 THEN
                  CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(pb.bounty * 0.25) * 1.2) ELSE FLOOR(pb.bounty * 0.25) END
                WHEN (pb.gender = 'F' OR pb.age < 16) AND g.round_number <= 5 THEN
                  CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(pb.bounty * 0.333) * 1.2) ELSE FLOOR(pb.bounty * 0.333) END
                ELSE
                  CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(pb.bounty * 0.5) * 1.2) ELSE FLOOR(pb.bounty * 0.5) END
              END
            WHEN g.result = 'black' THEN
              CASE
                WHEN pw.bounty <= 2 THEN
                  CASE WHEN g.black_sheriff_used THEN FLOOR(pw.bounty * 1.2) ELSE pw.bounty END
                WHEN pw.age < 12 AND g.round_number <= 5 THEN
                  CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(pw.bounty * 0.25) * 1.2) ELSE FLOOR(pw.bounty * 0.25) END
                WHEN (pw.gender = 'F' OR pw.age < 16) AND g.round_number <= 5 THEN
                  CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(pw.bounty * 0.333) * 1.2) ELSE FLOOR(pw.bounty * 0.333) END
                ELSE
                  CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(pw.bounty * 0.5) * 1.2) ELSE FLOOR(pw.bounty * 0.5) END
              END
            ELSE 0
          END
        ) THEN '✅ Correct'
        ELSE '❌ WRONG'
      END
  END as status

FROM games g
LEFT JOIN players pw ON g.white_player_id = pw.id
LEFT JOIN players pb ON g.black_player_id = pb.id
WHERE g.round_number = 1
  AND g.result IS NOT NULL
ORDER BY 
  CASE 
    WHEN status = '❌ WRONG' THEN 0
    ELSE 1
  END,
  g.id;

-- =====================================================
-- PART 2: Summary of issues
-- =====================================================

SELECT 
  COUNT(*) as total_completed_games,
  SUM(CASE WHEN status = '✅ Correct' THEN 1 ELSE 0 END) as correct_calculations,
  SUM(CASE WHEN status = '❌ WRONG' THEN 1 ELSE 0 END) as wrong_calculations
FROM (
  SELECT 
    CASE
      WHEN g.result IS NULL THEN 'Not Completed'
      WHEN g.black_player_id = 0 THEN 'BYE Game'
      WHEN g.result = 'draw' THEN 
        CASE WHEN g.bounty_transferred = 0 THEN '✅ Correct' ELSE '❌ WRONG' END
      ELSE
        CASE 
          WHEN g.bounty_transferred = (
            CASE
              WHEN g.result = 'white' THEN
                CASE
                  WHEN pb.bounty <= 2 THEN CASE WHEN g.white_sheriff_used THEN FLOOR(pb.bounty * 1.2) ELSE pb.bounty END
                  WHEN pb.age < 12 AND g.round_number <= 5 THEN CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(pb.bounty * 0.25) * 1.2) ELSE FLOOR(pb.bounty * 0.25) END
                  WHEN (pb.gender = 'F' OR pb.age < 16) AND g.round_number <= 5 THEN CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(pb.bounty * 0.333) * 1.2) ELSE FLOOR(pb.bounty * 0.333) END
                  ELSE CASE WHEN g.white_sheriff_used THEN FLOOR(FLOOR(pb.bounty * 0.5) * 1.2) ELSE FLOOR(pb.bounty * 0.5) END
                END
              WHEN g.result = 'black' THEN
                CASE
                  WHEN pw.bounty <= 2 THEN CASE WHEN g.black_sheriff_used THEN FLOOR(pw.bounty * 1.2) ELSE pw.bounty END
                  WHEN pw.age < 12 AND g.round_number <= 5 THEN CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(pw.bounty * 0.25) * 1.2) ELSE FLOOR(pw.bounty * 0.25) END
                  WHEN (pw.gender = 'F' OR pw.age < 16) AND g.round_number <= 5 THEN CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(pw.bounty * 0.333) * 1.2) ELSE FLOOR(pw.bounty * 0.333) END
                  ELSE CASE WHEN g.black_sheriff_used THEN FLOOR(FLOOR(pw.bounty * 0.5) * 1.2) ELSE FLOOR(pw.bounty * 0.5) END
                END
              ELSE 0
            END
          ) THEN '✅ Correct'
          ELSE '❌ WRONG'
        END
    END as status
  FROM games g
  LEFT JOIN players pw ON g.white_player_id = pw.id
  LEFT JOIN players pb ON g.black_player_id = pb.id
  WHERE g.round_number = 1 AND g.result IS NOT NULL
) subquery;

-- =====================================================
-- PART 3: Check for gender issues in database
-- =====================================================

SELECT 
  name,
  surname,
  gender,
  age,
  bounty,
  CASE 
    WHEN gender NOT IN ('M', 'F') THEN '❌ Invalid Gender'
    WHEN age < 0 OR age > 100 THEN '❌ Invalid Age'
    ELSE '✅ OK'
  END as data_quality
FROM players
ORDER BY surname, name;


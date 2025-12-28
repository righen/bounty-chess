-- COMPLETE VALIDATION: Check Every Player's Bounty is Calculated Correctly
-- This validates ALL players by recalculating their bounties from scratch

-- =====================================================
-- Calculate expected bounty for EVERY player
-- =====================================================

WITH player_games AS (
  -- Get all games where player participated
  SELECT 
    p.id as player_id,
    p.name || ' ' || p.surname as player_name,
    p.bounty as current_bounty,
    p.gender,
    p.age,
    g.id as game_id,
    g.round_number,
    g.result,
    g.white_sheriff_used,
    g.black_sheriff_used,
    g.bounty_transferred,
    
    -- Determine if player was white or black
    CASE WHEN g.white_player_id = p.id THEN 'white' ELSE 'black' END as player_color,
    
    -- Determine if player won, lost, or drew
    CASE 
      WHEN g.result IS NULL THEN 'incomplete'
      WHEN g.result = 'draw' THEN 'draw'
      WHEN (g.result = 'white' AND g.white_player_id = p.id) THEN 'won'
      WHEN (g.result = 'black' AND g.black_player_id = p.id) THEN 'won'
      WHEN g.black_player_id = 0 AND g.white_player_id = p.id THEN 'bye'
      ELSE 'lost'
    END as game_outcome,
    
    -- Get opponent info
    CASE 
      WHEN g.white_player_id = p.id THEN g.black_player_id
      ELSE g.white_player_id
    END as opponent_id
    
  FROM players p
  LEFT JOIN games g ON (g.white_player_id = p.id OR g.black_player_id = p.id)
  WHERE g.round_number = 1 AND g.result IS NOT NULL
),

player_bounty_changes AS (
  SELECT 
    pg.player_id,
    pg.player_name,
    pg.current_bounty,
    pg.game_id,
    pg.game_outcome,
    pg.bounty_transferred,
    
    -- Calculate expected bounty change for this game
    CASE
      -- BYE game = no bounty change
      WHEN pg.game_outcome = 'bye' THEN 0
      
      -- Draw = no bounty change
      WHEN pg.game_outcome = 'draw' THEN 0
      
      -- Player WON
      WHEN pg.game_outcome = 'won' THEN
        CASE
          -- Check if opponent used sheriff for protection
          WHEN (pg.player_color = 'white' AND pg.black_sheriff_used = true)
            OR (pg.player_color = 'black' AND pg.white_sheriff_used = true)
          THEN 0  -- Sheriff protection = no bounty gain
          
          -- Normal win or sheriff boost
          ELSE pg.bounty_transferred
        END
      
      -- Player LOST
      WHEN pg.game_outcome = 'lost' THEN
        CASE
          -- Check if player used sheriff for protection
          WHEN (pg.player_color = 'white' AND pg.white_sheriff_used = true)
            OR (pg.player_color = 'black' AND pg.black_sheriff_used = true)
          THEN 0  -- Sheriff protection = no bounty loss
          
          -- Normal loss (negative)
          ELSE -pg.bounty_transferred
        END
      
      ELSE 0
    END as bounty_change
    
  FROM player_games pg
),

player_expected_bounties AS (
  SELECT 
    player_id,
    player_name,
    current_bounty,
    20 as starting_bounty,
    COALESCE(SUM(bounty_change), 0) as total_bounty_change,
    20 + COALESCE(SUM(bounty_change), 0) as expected_bounty,
    COUNT(game_id) as games_played
  FROM player_bounty_changes
  GROUP BY player_id, player_name, current_bounty
  
  UNION ALL
  
  -- Include players who didn't play any games yet
  SELECT 
    p.id as player_id,
    p.name || ' ' || p.surname as player_name,
    p.bounty as current_bounty,
    20 as starting_bounty,
    0 as total_bounty_change,
    20 as expected_bounty,
    0 as games_played
  FROM players p
  WHERE NOT EXISTS (
    SELECT 1 FROM games g 
    WHERE (g.white_player_id = p.id OR g.black_player_id = p.id)
      AND g.round_number = 1 
      AND g.result IS NOT NULL
  )
)

SELECT 
  player_name,
  games_played,
  starting_bounty,
  total_bounty_change,
  expected_bounty,
  current_bounty,
  (current_bounty - expected_bounty) as difference,
  CASE 
    WHEN current_bounty = expected_bounty THEN '✅ CORRECT'
    ELSE '❌ WRONG (off by ' || (current_bounty - expected_bounty) || ')'
  END as status
FROM player_expected_bounties
ORDER BY 
  CASE WHEN current_bounty = expected_bounty THEN 1 ELSE 0 END,
  difference DESC,
  player_name;

-- =====================================================
-- SUMMARY: How many players have wrong bounties?
-- =====================================================

WITH player_games AS (
  SELECT 
    p.id as player_id,
    p.name || ' ' || p.surname as player_name,
    p.bounty as current_bounty,
    g.id as game_id,
    g.result,
    g.white_sheriff_used,
    g.black_sheriff_used,
    g.bounty_transferred,
    CASE WHEN g.white_player_id = p.id THEN 'white' ELSE 'black' END as player_color,
    CASE 
      WHEN g.result IS NULL THEN 'incomplete'
      WHEN g.result = 'draw' THEN 'draw'
      WHEN (g.result = 'white' AND g.white_player_id = p.id) THEN 'won'
      WHEN (g.result = 'black' AND g.black_player_id = p.id) THEN 'won'
      WHEN g.black_player_id = 0 AND g.white_player_id = p.id THEN 'bye'
      ELSE 'lost'
    END as game_outcome
  FROM players p
  LEFT JOIN games g ON (g.white_player_id = p.id OR g.black_player_id = p.id)
  WHERE g.round_number = 1 AND g.result IS NOT NULL
),
player_bounty_changes AS (
  SELECT 
    pg.player_id,
    pg.current_bounty,
    CASE
      WHEN pg.game_outcome = 'bye' OR pg.game_outcome = 'draw' THEN 0
      WHEN pg.game_outcome = 'won' THEN
        CASE
          WHEN (pg.player_color = 'white' AND pg.black_sheriff_used = true)
            OR (pg.player_color = 'black' AND pg.white_sheriff_used = true)
          THEN 0
          ELSE pg.bounty_transferred
        END
      WHEN pg.game_outcome = 'lost' THEN
        CASE
          WHEN (pg.player_color = 'white' AND pg.white_sheriff_used = true)
            OR (pg.player_color = 'black' AND pg.black_sheriff_used = true)
          THEN 0
          ELSE -pg.bounty_transferred
        END
      ELSE 0
    END as bounty_change
  FROM player_games pg
),
player_expected_bounties AS (
  SELECT 
    player_id,
    current_bounty,
    20 + COALESCE(SUM(bounty_change), 0) as expected_bounty
  FROM player_bounty_changes
  GROUP BY player_id, current_bounty
  UNION ALL
  SELECT 
    p.id,
    p.bounty,
    20
  FROM players p
  WHERE NOT EXISTS (
    SELECT 1 FROM games g 
    WHERE (g.white_player_id = p.id OR g.black_player_id = p.id)
      AND g.round_number = 1 AND g.result IS NOT NULL
  )
)
SELECT 
  COUNT(*) as total_players,
  SUM(CASE WHEN current_bounty = expected_bounty THEN 1 ELSE 0 END) as correct_bounties,
  SUM(CASE WHEN current_bounty != expected_bounty THEN 1 ELSE 0 END) as wrong_bounties,
  CASE 
    WHEN SUM(CASE WHEN current_bounty != expected_bounty THEN 1 ELSE 0 END) = 0 
    THEN '🎉 ALL CORRECT!'
    ELSE '⚠️ SOME WRONG - See details above'
  END as overall_status
FROM player_expected_bounties;

-- =====================================================
-- LIST ONLY PLAYERS WITH WRONG BOUNTIES
-- =====================================================

WITH player_games AS (
  SELECT 
    p.id as player_id,
    p.name || ' ' || p.surname as player_name,
    p.bounty as current_bounty,
    g.id as game_id,
    g.result,
    g.white_sheriff_used,
    g.black_sheriff_used,
    g.bounty_transferred,
    CASE WHEN g.white_player_id = p.id THEN 'white' ELSE 'black' END as player_color,
    CASE 
      WHEN g.result IS NULL THEN 'incomplete'
      WHEN g.result = 'draw' THEN 'draw'
      WHEN (g.result = 'white' AND g.white_player_id = p.id) THEN 'won'
      WHEN (g.result = 'black' AND g.black_player_id = p.id) THEN 'won'
      WHEN g.black_player_id = 0 AND g.white_player_id = p.id THEN 'bye'
      ELSE 'lost'
    END as game_outcome
  FROM players p
  LEFT JOIN games g ON (g.white_player_id = p.id OR g.black_player_id = p.id)
  WHERE g.round_number = 1 AND g.result IS NOT NULL
),
player_bounty_changes AS (
  SELECT 
    pg.player_id,
    pg.player_name,
    pg.current_bounty,
    CASE
      WHEN pg.game_outcome = 'bye' OR pg.game_outcome = 'draw' THEN 0
      WHEN pg.game_outcome = 'won' THEN
        CASE
          WHEN (pg.player_color = 'white' AND pg.black_sheriff_used = true)
            OR (pg.player_color = 'black' AND pg.white_sheriff_used = true)
          THEN 0
          ELSE pg.bounty_transferred
        END
      WHEN pg.game_outcome = 'lost' THEN
        CASE
          WHEN (pg.player_color = 'white' AND pg.white_sheriff_used = true)
            OR (pg.player_color = 'black' AND pg.black_sheriff_used = true)
          THEN 0
          ELSE -pg.bounty_transferred
        END
      ELSE 0
    END as bounty_change
  FROM player_games pg
),
player_expected_bounties AS (
  SELECT 
    player_id,
    player_name,
    current_bounty,
    20 + COALESCE(SUM(bounty_change), 0) as expected_bounty
  FROM player_bounty_changes
  GROUP BY player_id, player_name, current_bounty
  UNION ALL
  SELECT 
    p.id,
    p.name || ' ' || p.surname,
    p.bounty,
    20
  FROM players p
  WHERE NOT EXISTS (
    SELECT 1 FROM games g 
    WHERE (g.white_player_id = p.id OR g.black_player_id = p.id)
      AND g.round_number = 1 AND g.result IS NOT NULL
  )
)
SELECT 
  '❌ NEEDS FIX' as issue,
  player_name,
  current_bounty,
  expected_bounty,
  (expected_bounty - current_bounty) as correction_needed
FROM player_expected_bounties
WHERE current_bounty != expected_bounty
ORDER BY ABS(expected_bounty - current_bounty) DESC;


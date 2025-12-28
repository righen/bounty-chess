-- Reconstruct Color History from Existing Game Data
-- ==================================================
-- Since color history wasn't saved during rounds 1-3,
-- we can reconstruct it by analyzing the games table!

-- STEP 1: Build color history for each player from rounds 1-3
WITH player_colors AS (
  SELECT 
    player_id,
    round_number,
    color
  FROM (
    -- Get all white games
    SELECT 
      white_player_id as player_id,
      round_number,
      'W' as color
    FROM games
    WHERE round_number <= 3
      AND completed = true
    
    UNION ALL
    
    -- Get all black games (including BYE)
    SELECT 
      black_player_id as player_id,
      round_number,
      CASE 
        WHEN white_player_id = black_player_id THEN 'BYE'  -- BYE game
        ELSE 'B'
      END as color
    FROM games
    WHERE round_number <= 3
      AND completed = true
      AND black_player_id != 0  -- Exclude actual BYE (black_player_id = 0)
    
    UNION ALL
    
    -- Get BYE games (where black_player_id = 0, white player gets BYE)
    SELECT 
      white_player_id as player_id,
      round_number,
      'BYE' as color
    FROM games
    WHERE round_number <= 3
      AND black_player_id = 0
  ) all_colors
  ORDER BY player_id, round_number
),
aggregated_history AS (
  SELECT 
    player_id,
    array_agg(color ORDER BY round_number) as reconstructed_history
  FROM player_colors
  GROUP BY player_id
)

-- STEP 2: Update players table with reconstructed history
UPDATE players p
SET color_history = COALESCE(ah.reconstructed_history, ARRAY[]::text[])
FROM aggregated_history ah
WHERE p.id = ah.player_id;

-- STEP 3: Verify the reconstruction
SELECT 
  'RECONSTRUCTION SUMMARY' as summary,
  COUNT(*) as total_players,
  SUM(CASE WHEN array_length(color_history, 1) > 0 THEN 1 ELSE 0 END) as players_with_history,
  SUM(CASE WHEN array_length(color_history, 1) = 0 OR color_history IS NULL THEN 1 ELSE 0 END) as players_without_history
FROM players;

-- STEP 4: Show sample of reconstructed histories
SELECT 
  name || ' ' || surname as player,
  color_history,
  array_length(color_history, 1) as rounds_played
FROM players
WHERE array_length(color_history, 1) > 0
ORDER BY surname, name
LIMIT 20;


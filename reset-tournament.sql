-- Reset Tournament Script
-- This will clear all tournament data but keep the players table structure
-- Run this in Supabase SQL Editor before starting a new tournament

-- 1. Delete all games
DELETE FROM games;

-- 2. Delete all rounds
DELETE FROM rounds;

-- 3. Delete all players (optional - comment out if you want to keep players)
DELETE FROM players;

-- 4. Reset tournament status
UPDATE tournament
SET 
  current_round = 0,
  tournament_started = false
WHERE id = 'default';

-- 5. If no tournament row exists, create one
INSERT INTO tournament (id, current_round, total_rounds, tournament_started)
VALUES ('default', 0, 9, false)
ON CONFLICT (id) DO NOTHING;

-- Verify reset
SELECT * FROM tournament;
SELECT COUNT(*) as player_count FROM players;
SELECT COUNT(*) as rounds_count FROM rounds;
SELECT COUNT(*) as games_count FROM games;


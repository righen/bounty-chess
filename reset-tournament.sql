-- Reset Tournament Script
-- This will clear all tournament data but keep the players table structure
-- Run this in Supabase SQL Editor before starting a new tournament

-- 1. Delete all games
DELETE FROM games;

-- 2. Delete all rounds
DELETE FROM rounds;

-- 3. Delete all players (optional - comment out if you want to keep players)
DELETE FROM players;

-- 4. Delete all tournament rows first (clean slate)
DELETE FROM tournament;

-- 5. Insert tournament row with the EXACT UUID the app expects
-- The app is hardcoded to look for this specific UUID
INSERT INTO tournament (id, current_round, total_rounds, tournament_started)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 0, 9, false);

-- Verify reset
SELECT * FROM tournament;
SELECT COUNT(*) as player_count FROM players;
SELECT COUNT(*) as rounds_count FROM rounds;
SELECT COUNT(*) as games_count FROM games;


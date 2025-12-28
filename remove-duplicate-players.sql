-- Remove Duplicate Players
-- This finds players with same name+surname and keeps only one copy
-- Run this in Supabase SQL Editor

-- Step 1: Show duplicates (for review)
SELECT 
  name, 
  surname, 
  COUNT(*) as count,
  STRING_AGG(id::text, ', ' ORDER BY id) as player_ids
FROM players
GROUP BY name, surname
HAVING COUNT(*) > 1
ORDER BY count DESC, surname, name;

-- Step 2: Delete duplicate players (keeps the one with LOWEST id)
-- Uncomment below after reviewing Step 1 results

/*
DELETE FROM players
WHERE id IN (
  SELECT p.id
  FROM players p
  INNER JOIN (
    SELECT 
      name, 
      surname, 
      MIN(id) as keep_id
    FROM players
    GROUP BY name, surname
    HAVING COUNT(*) > 1
  ) duplicates
  ON p.name = duplicates.name 
  AND p.surname = duplicates.surname
  AND p.id != duplicates.keep_id
);
*/

-- Step 3: Verify - should show 0 duplicates
SELECT 
  name, 
  surname, 
  COUNT(*) as count
FROM players
GROUP BY name, surname
HAVING COUNT(*) > 1;

-- Step 4: Show total player count
SELECT COUNT(*) as total_players FROM players;


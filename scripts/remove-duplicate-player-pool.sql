-- ============================================================================
-- REMOVE DUPLICATE PLAYERS FROM player_pool
-- ============================================================================
-- This script finds and removes duplicate players based on name+surname
-- Keeps the player with the lowest ID (oldest record)

-- Step 1: Show duplicates (for review)
SELECT 
  name, 
  surname, 
  COUNT(*) as count,
  STRING_AGG(id::text, ', ' ORDER BY id) as player_ids,
  STRING_AGG(created_at::text, ', ' ORDER BY id) as created_dates
FROM player_pool
GROUP BY name, surname
HAVING COUNT(*) > 1
ORDER BY count DESC, surname, name;

-- Step 2: Show which players will be kept (lowest ID)
SELECT 
  'Players to KEEP' as action,
  pp.id,
  pp.name,
  pp.surname,
  pp.created_at,
  pp.email,
  pp.rating
FROM player_pool pp
INNER JOIN (
  SELECT 
    name, 
    surname, 
    MIN(id) as keep_id
  FROM player_pool
  GROUP BY name, surname
  HAVING COUNT(*) > 1
) duplicates
ON pp.name = duplicates.name 
AND pp.surname = duplicates.surname
AND pp.id = duplicates.keep_id
ORDER BY pp.surname, pp.name;

-- Step 3: Show which players will be DELETED (higher IDs)
SELECT 
  'Players to DELETE' as action,
  pp.id,
  pp.name,
  pp.surname,
  pp.created_at,
  pp.email,
  pp.rating
FROM player_pool pp
INNER JOIN (
  SELECT 
    name, 
    surname, 
    MIN(id) as keep_id
  FROM player_pool
  GROUP BY name, surname
  HAVING COUNT(*) > 1
) duplicates
ON pp.name = duplicates.name 
AND pp.surname = duplicates.surname
AND pp.id != duplicates.keep_id
ORDER BY pp.surname, pp.name;

-- Step 4: Check if any duplicates are registered in tournaments
SELECT 
  'Duplicate players in tournaments' as check_type,
  pp.id,
  pp.name,
  pp.surname,
  COUNT(tr.id) as tournament_registrations
FROM player_pool pp
INNER JOIN (
  SELECT 
    name, 
    surname, 
    MIN(id) as keep_id
  FROM player_pool
  GROUP BY name, surname
  HAVING COUNT(*) > 1
) duplicates
ON pp.name = duplicates.name 
AND pp.surname = duplicates.surname
AND pp.id != duplicates.keep_id
LEFT JOIN tournament_registrations tr ON tr.player_pool_id = pp.id
GROUP BY pp.id, pp.name, pp.surname
ORDER BY tournament_registrations DESC, pp.surname, pp.name;

-- Step 5: DELETE duplicate players (keeps the one with LOWEST id)
-- WARNING: This will delete duplicate players!
-- Review Steps 1-4 before running this!

DELETE FROM player_pool
WHERE id IN (
  SELECT pp.id
  FROM player_pool pp
  INNER JOIN (
    SELECT 
      name, 
      surname, 
      MIN(id) as keep_id
    FROM player_pool
    GROUP BY name, surname
    HAVING COUNT(*) > 1
  ) duplicates
  ON pp.name = duplicates.name 
  AND pp.surname = duplicates.surname
  AND pp.id != duplicates.keep_id
);

-- Step 6: Verify - should show 0 duplicates
SELECT 
  'Verification: Remaining duplicates' as check_type,
  name, 
  surname, 
  COUNT(*) as count
FROM player_pool
GROUP BY name, surname
HAVING COUNT(*) > 1;

-- Step 7: Show total player count
SELECT 
  'Total players in pool' as info, 
  COUNT(*) as count 
FROM player_pool;

-- Step 8: Show all players sorted alphabetically
SELECT 
  id,
  name,
  surname,
  email,
  rating,
  active,
  created_at
FROM player_pool
ORDER BY surname, name;


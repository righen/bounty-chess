-- Fix Harishav Emrit name typo
-- Should be "Hrishav" not "Harishav"

-- Check current name
SELECT 
  id,
  name,
  surname,
  'BEFORE FIX' as status
FROM players
WHERE name = 'Harishav' AND surname = 'Emrit';

-- Fix the name
UPDATE players
SET name = 'Hrishav'
WHERE name = 'Harishav' AND surname = 'Emrit';

-- Verify the fix
SELECT 
  id,
  name,
  surname,
  '✅ FIXED' as status
FROM players
WHERE name = 'Hrishav' AND surname = 'Emrit';

-- Show all players to confirm
SELECT 
  id,
  name,
  surname,
  bounty
FROM players
ORDER BY surname, name;


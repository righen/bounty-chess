-- Remove Sanju Backory and Vanji Motee
-- These players should not be in the tournament

-- =====================================================
-- 1. Check current state before deletion
-- =====================================================

SELECT 
  'Players to Remove' as check_type,
  id,
  name,
  surname,
  bounty,
  wins,
  losses,
  draws
FROM players
WHERE (name = 'Sanju' AND surname = 'Backory')
   OR (name = 'Vanji' AND surname = 'Motee')
ORDER BY surname;

-- =====================================================
-- 2. Check if they have any games
-- =====================================================

SELECT 
  'Games to be deleted' as check_type,
  g.id as game_id,
  g.round_number,
  pw.name || ' ' || pw.surname as white_player,
  pb.name || ' ' || pb.surname as black_player,
  g.result
FROM games g
LEFT JOIN players pw ON g.white_player_id = pw.id
LEFT JOIN players pb ON g.black_player_id = pb.id
WHERE g.white_player_id IN (
    SELECT id FROM players 
    WHERE (name = 'Sanju' AND surname = 'Backory')
       OR (name = 'Vanji' AND surname = 'Motee')
  )
  OR g.black_player_id IN (
    SELECT id FROM players 
    WHERE (name = 'Sanju' AND surname = 'Backory')
       OR (name = 'Vanji' AND surname = 'Motee')
  );

-- =====================================================
-- 3. Delete games involving these players
-- =====================================================

-- Games will be automatically deleted due to foreign key CASCADE
-- But we'll delete them explicitly first for clarity

DELETE FROM games
WHERE white_player_id IN (
    SELECT id FROM players 
    WHERE (name = 'Sanju' AND surname = 'Backory')
       OR (name = 'Vanji' AND surname = 'Motee')
  )
  OR black_player_id IN (
    SELECT id FROM players 
    WHERE (name = 'Sanju' AND surname = 'Backory')
       OR (name = 'Vanji' AND surname = 'Motee')
  );

-- =====================================================
-- 4. Delete the players
-- =====================================================

DELETE FROM players
WHERE (name = 'Sanju' AND surname = 'Backory')
   OR (name = 'Vanji' AND surname = 'Motee');

-- =====================================================
-- 5. Verify deletion
-- =====================================================

SELECT 
  '✅ Players Removed' as status,
  COUNT(*) as remaining_players
FROM players;

-- Verify they're gone
SELECT 
  'Verification: Should be empty' as check_type,
  id,
  name,
  surname
FROM players
WHERE (name = 'Sanju' AND surname = 'Backory')
   OR (name = 'Vanji' AND surname = 'Motee');

-- Show final player count
SELECT 
  'Final Count' as summary,
  COUNT(*) as total_players,
  '(51 - 2 = 49 expected)' as note
FROM players;

-- Show all remaining players
SELECT 
  id,
  name,
  surname,
  bounty
FROM players
ORDER BY surname, name;


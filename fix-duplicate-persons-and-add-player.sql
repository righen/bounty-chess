-- Fix Duplicate Persons and Add New Player
-- Run this in Supabase SQL Editor

-- =====================================================
-- PART 1: Remove duplicate persons (same person, different names)
-- =====================================================

-- Step 1: Show current duplicates (for review)
SELECT id, name, surname, birthdate, age FROM players 
WHERE (name LIKE 'Krishna%' AND surname LIKE '%Samoo%')
   OR (name LIKE 'Krishna%' AND surname LIKE '%Nagarajen%')
ORDER BY surname, name;

SELECT id, name, surname, birthdate, age FROM players 
WHERE surname = 'Permal'
ORDER BY name;

SELECT id, name, surname, birthdate, age FROM players 
WHERE surname = 'Hardy' AND (name LIKE '%Mikhael%' OR name LIKE '%Noah%')
ORDER BY name;

-- Step 2: Delete the duplicate entries
-- Keep: Krishna Nagarajen, Pascal Permal, Noah Mikhael Hardy
-- Delete: Krishna Samoo, Dany Permal, Mikhael Hardy

DELETE FROM players
WHERE (name = 'Krishna' AND surname = 'Samoo');

DELETE FROM players
WHERE (name = 'Dany' AND surname = 'Permal');

DELETE FROM players
WHERE (name = 'Mikhael' AND surname = 'Hardy');

-- =====================================================
-- PART 2: Add new player - Seeven Parian (42 years old)
-- =====================================================

-- Calculate birth date: 42 years old as of December 28, 2025
-- Birth year: 2025 - 42 = 1983
-- Using 01/01/1983 (DD/MM/YYYY format)

-- Get next available ID
INSERT INTO players (
  id,
  name,
  surname,
  birthdate,
  age,
  gender,
  bounty,
  wins,
  losses,
  draws,
  has_sheriff_badge,
  criminal_status,
  opponent_ids,
  color_history
)
SELECT 
  COALESCE(MAX(id), 0) + 1,
  'Seeven',
  'Parian',
  '01/01/1983',
  42,
  'M',
  20,
  0,
  0,
  0,
  true,
  'normal',
  '{}',
  '{}'
FROM players;

-- =====================================================
-- PART 3: Verify changes
-- =====================================================

-- Check no more duplicate persons
SELECT 'Krishna check' as check_type, COUNT(*) as count FROM players 
WHERE name = 'Krishna';

SELECT 'Permal check' as check_type, COUNT(*) as count FROM players 
WHERE surname = 'Permal';

SELECT 'Hardy check' as check_type, COUNT(*) as count FROM players 
WHERE surname = 'Hardy' AND name LIKE '%Mikhael%';

-- Verify new player added
SELECT 'New player' as check_type, * FROM players 
WHERE name = 'Seeven' AND surname = 'Parian';

-- Show total player count
SELECT 'Total players' as info, COUNT(*) as count FROM players;

-- Show all players sorted alphabetically
SELECT id, name, surname, age, gender, birthdate
FROM players
ORDER BY surname, name;


-- Fix Krishna Nagarajen Gender
-- Should be Male

-- =====================================================
-- 1. Check current state
-- =====================================================

SELECT 
  'Current State' as check_type,
  id,
  name,
  surname,
  gender,
  bounty,
  wins,
  losses,
  draws
FROM players
WHERE name = 'Krishna' AND surname = 'Nagarajen';

-- =====================================================
-- 2. Update gender to Male
-- =====================================================

UPDATE players
SET gender = 'M'
WHERE name = 'Krishna' AND surname = 'Nagarajen';

-- =====================================================
-- 3. Verify the fix
-- =====================================================

SELECT 
  '✅ FIXED' as status,
  name,
  surname,
  gender,
  bounty
FROM players
WHERE name = 'Krishna' AND surname = 'Nagarajen';

-- =====================================================
-- 4. Show all gender corrections made
-- =====================================================

SELECT 
  '✅ All Gender Fixes' as summary,
  name,
  surname,
  gender
FROM players 
WHERE (name = 'Stephane' AND surname = 'Lam')
   OR (name = 'Keshavi' AND surname = 'Meenowa')
   OR (name = 'Loganatha' AND surname = 'Pillay')
   OR (name = 'Rama' AND surname = 'Baloonuck')
   OR (name = 'Krishna' AND surname = 'Nagarajen')
ORDER BY surname;

-- Expected:
-- Keshavi Meenowa: F
-- Krishna Nagarajen: M
-- Stephane Lam: M
-- Loganatha Pillay: M
-- Rama Baloonuck: M


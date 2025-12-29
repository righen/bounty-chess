-- ============================================================================
-- SETUP NEW TOURNAMENT WITH EXISTING PLAYERS
-- ============================================================================
-- This script:
-- 1. Creates a new tournament
-- 2. Registers all active players from player_pool
-- 3. Sets up initial state
-- ============================================================================

-- Step 1: Create a new tournament
INSERT INTO tournaments (
  name,
  location,
  start_date,
  end_date,
  format,
  total_rounds,
  current_round,
  time_control,
  default_time_minutes,
  grace_period_minutes,
  bye_points,
  initial_bounty,
  entry_fee,
  prize_pool,
  status,
  tournament_started,
  allow_late_entries,
  created_at,
  updated_at
)
VALUES (
  'Bounty Chess Tournament ' || TO_CHAR(NOW(), 'YYYY-MM-DD'),
  'Chess Club',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  'swiss',
  9,
  0,
  '30+0',
  30,
  0,
  1.0,
  NULL, -- No bounty system for standard tournament
  0,
  0,
  'draft',
  FALSE,
  TRUE,
  NOW(),
  NOW()
)
RETURNING id, name;

-- Step 2: Get the tournament ID (you'll need to run this separately or use a variable)
-- For now, let's get the latest tournament
DO $$
DECLARE
  new_tournament_id UUID;
  player_record RECORD;
  pairing_num INTEGER := 1;
BEGIN
  -- Get the newly created tournament ID
  SELECT id INTO new_tournament_id 
  FROM tournaments 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  RAISE NOTICE 'Tournament ID: %', new_tournament_id;
  
  -- Step 3: Register all active players from player_pool
  FOR player_record IN 
    SELECT id, name, surname 
    FROM player_pool 
    WHERE active = TRUE 
    AND banned = FALSE
    ORDER BY surname, name
  LOOP
    -- Insert registration
    INSERT INTO tournament_registrations (
      tournament_id,
      player_id,
      pairing_number,
      entry_fee_paid,
      checked_in,
      registered_at,
      updated_at
    )
    VALUES (
      new_tournament_id,
      player_record.id,
      pairing_num,
      FALSE, -- Entry fee not paid yet
      FALSE, -- Not checked in yet
      NOW(),
      NOW()
    )
    ON CONFLICT (tournament_id, player_id) DO NOTHING;
    
    pairing_num := pairing_num + 1;
    
    RAISE NOTICE 'Registered: % % (Pairing #%)', player_record.name, player_record.surname, pairing_num - 1;
  END LOOP;
  
  RAISE NOTICE 'Total players registered: %', pairing_num - 1;
END $$;

-- Step 4: Verify the setup
SELECT 
  'Tournament Created' AS status,
  t.name AS tournament_name,
  t.status,
  COUNT(tr.id) AS players_registered
FROM tournaments t
LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id
WHERE t.id = (SELECT id FROM tournaments ORDER BY created_at DESC LIMIT 1)
GROUP BY t.id, t.name, t.status;

-- Step 5: Show registered players
SELECT 
  tr.pairing_number,
  pp.name,
  pp.surname,
  pp.rating,
  tr.entry_fee_paid,
  tr.checked_in
FROM tournament_registrations tr
JOIN player_pool pp ON tr.player_id = pp.id
WHERE tr.tournament_id = (SELECT id FROM tournaments ORDER BY created_at DESC LIMIT 1)
ORDER BY tr.pairing_number;


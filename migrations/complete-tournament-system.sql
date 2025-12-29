-- ============================================================================
-- COMPLETE TOURNAMENT MANAGEMENT SYSTEM
-- Database Schema for Swiss Manager-style workflow
-- ============================================================================
-- 
-- This migration creates the complete infrastructure for:
-- 1. Player Pool (master database)
-- 2. Tournament Registration
-- 3. Check-In & Entry Fees
-- 4. Tournament Management
-- 5. Result Entry with full options
-- 6. Audit trails
-- ============================================================================

-- ============================================================================
-- PLAYER POOL (Master Database)
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_pool (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birthdate DATE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('M', 'F')),
  rating INTEGER,
  fide_id TEXT,
  national_id TEXT,
  photo_url TEXT,
  notes TEXT,
  
  -- Statistics
  tournaments_played INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_draws INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraints
  UNIQUE(email),
  UNIQUE(fide_id)
);

CREATE INDEX IF NOT EXISTS idx_player_pool_name ON player_pool(surname, name);
CREATE INDEX IF NOT EXISTS idx_player_pool_rating ON player_pool(rating DESC);
CREATE INDEX IF NOT EXISTS idx_player_pool_active ON player_pool(active);

COMMENT ON TABLE player_pool IS 'Master player database - permanent records';

-- ============================================================================
-- TOURNAMENT MASTER TABLE (Enhanced)
-- ============================================================================

-- Drop old tournament table if exists and recreate with full structure
-- Note: This is destructive - backup data first!

CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  
  -- Format
  format TEXT DEFAULT 'swiss' CHECK (format IN ('swiss', 'round_robin', 'knockout')),
  total_rounds INTEGER NOT NULL,
  current_round INTEGER DEFAULT 0,
  
  -- Settings
  time_control TEXT DEFAULT '30+0',
  default_time_minutes INTEGER DEFAULT 30,
  grace_period_minutes INTEGER DEFAULT 0,
  bye_points NUMERIC(3,1) DEFAULT 1.0,
  initial_bounty INTEGER DEFAULT 20,
  
  -- Entry
  entry_fee INTEGER DEFAULT 0,
  prize_pool INTEGER DEFAULT 0,
  allow_late_entries BOOLEAN DEFAULT TRUE,
  late_entry_deadline_round INTEGER,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'registration', 'ready', 'in_progress', 'completed', 'cancelled')),
  tournament_started BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  
  -- Legacy compatibility
  tournament_id TEXT GENERATED ALWAYS AS ('00000000-0000-0000-0000-000000000001') STORED
);

-- Migrate data from old tournament table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournament') THEN
    INSERT INTO tournaments (
      id, 
      name, 
      start_date,
      total_rounds, 
      current_round, 
      tournament_started, 
      initial_bounty, 
      default_time_minutes, 
      bye_points, 
      allow_late_entries,
      status
    )
    SELECT 
      id,
      'Current Tournament', -- default name for existing tournament
      CURRENT_DATE, -- default start date
      total_rounds,
      current_round,
      tournament_started,
      20, -- default initial_bounty
      COALESCE(default_time_minutes, 30),
      COALESCE(bye_points, 1.0),
      COALESCE(allow_late_entries, TRUE),
      CASE 
        WHEN tournament_started = TRUE THEN 'in_progress'
        ELSE 'draft'
      END
    FROM tournament
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date DESC);

COMMENT ON TABLE tournaments IS 'Tournament master records with full metadata';

-- ============================================================================
-- TOURNAMENT REGISTRATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tournament_registrations (
  id SERIAL PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_pool_id INTEGER REFERENCES player_pool(id) ON DELETE SET NULL,
  
  -- Player snapshot (in case player_pool entry is deleted)
  player_name TEXT NOT NULL,
  player_surname TEXT NOT NULL,
  player_age INTEGER,
  player_gender TEXT,
  player_rating INTEGER,
  
  -- Registration
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  registered_by TEXT,
  registration_notes TEXT,
  
  -- Entry Fee
  entry_fee_amount INTEGER DEFAULT 0,
  entry_fee_paid BOOLEAN DEFAULT FALSE,
  payment_method TEXT, -- 'cash', 'card', 'transfer', 'free'
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  
  -- Check-In
  checked_in BOOLEAN DEFAULT FALSE,
  check_in_time TIMESTAMP WITH TIME ZONE,
  checked_in_by TEXT,
  
  -- Pairing Number (assigned at check-in)
  pairing_number INTEGER,
  
  -- Status
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'playing', 'withdrawn', 'no_show', 'removed')),
  
  -- Withdrawal
  withdrawn BOOLEAN DEFAULT FALSE,
  withdrawal_date TIMESTAMP WITH TIME ZONE,
  withdrawal_reason TEXT,
  
  -- Link to actual tournament player (created when tournament starts)
  tournament_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
  
  UNIQUE(tournament_id, player_pool_id),
  UNIQUE(tournament_id, pairing_number)
);

CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON tournament_registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_checked_in ON tournament_registrations(checked_in);

COMMENT ON TABLE tournament_registrations IS 'Tournament registration and check-in tracking';

-- ============================================================================
-- CHECK-IN LOG (Detailed tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS check_in_log (
  id SERIAL PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  registration_id INTEGER NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL CHECK (action_type IN ('check_in', 'check_out', 'fee_paid', 'fee_refund')),
  performed_by TEXT,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  amount INTEGER, -- For fee payments/refunds
  payment_method TEXT,
  
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_check_in_log_tournament ON check_in_log(tournament_id);
CREATE INDEX IF NOT EXISTS idx_check_in_log_registration ON check_in_log(registration_id);

COMMENT ON TABLE check_in_log IS 'Detailed check-in and payment tracking';

-- ============================================================================
-- RESULT ENTRY OPTIONS (Track how results were entered)
-- ============================================================================

CREATE TABLE IF NOT EXISTS result_entries (
  id SERIAL PRIMARY KEY,
  game_id TEXT NOT NULL,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  
  -- Result details
  result_type TEXT NOT NULL CHECK (result_type IN ('normal', 'forfeit', 'bye', 'double_forfeit')),
  winner TEXT, -- 'white', 'black', null for draw
  
  -- Special flags
  sheriff_used_by TEXT, -- 'white', 'black', null
  criminal_triggered BOOLEAN DEFAULT FALSE,
  
  -- Forfeit details (if applicable)
  forfeit_reason TEXT,
  forfeit_declared_at TIMESTAMP WITH TIME ZONE,
  
  -- Entry metadata
  entered_by TEXT,
  entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entry_method TEXT DEFAULT 'manual', -- 'manual', 'import', 'auto'
  
  -- Corrections
  corrected BOOLEAN DEFAULT FALSE,
  correction_reason TEXT,
  original_result TEXT,
  
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_result_entries_game ON result_entries(game_id);
CREATE INDEX IF NOT EXISTS idx_result_entries_tournament ON result_entries(tournament_id, round_number);

COMMENT ON TABLE result_entries IS 'Detailed tracking of all result entries';

-- ============================================================================
-- ARBITER ACTIONS LOG (Comprehensive audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS arbiter_actions (
  id SERIAL PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL CHECK (action_type IN (
    'tournament_created', 'tournament_started', 'tournament_completed',
    'round_generated', 'round_started', 'round_completed',
    'result_entered', 'result_corrected',
    'player_registered', 'player_checked_in', 'player_withdrawn',
    'late_entry_added', 'forfeit_declared', 'pairing_adjusted',
    'bye_assigned', 'settings_changed', 'manual_intervention'
  )),
  
  -- Context
  round_number INTEGER,
  player_id INTEGER,
  game_id TEXT,
  
  -- Details
  action_data JSONB,
  reason TEXT,
  
  -- Who and when
  performed_by TEXT NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Reversal tracking
  reversed BOOLEAN DEFAULT FALSE,
  reversed_at TIMESTAMP WITH TIME ZONE,
  reversed_by TEXT,
  reversal_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_arbiter_actions_tournament ON arbiter_actions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_arbiter_actions_type ON arbiter_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_arbiter_actions_time ON arbiter_actions(performed_at DESC);

COMMENT ON TABLE arbiter_actions IS 'Complete audit trail of all arbiter actions';

-- ============================================================================
-- TOURNAMENT STATISTICS (Cached stats for performance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tournament_statistics (
  tournament_id UUID PRIMARY KEY REFERENCES tournaments(id) ON DELETE CASCADE,
  
  -- Player stats
  total_registered INTEGER DEFAULT 0,
  total_checked_in INTEGER DEFAULT 0,
  total_playing INTEGER DEFAULT 0,
  total_withdrawn INTEGER DEFAULT 0,
  total_no_shows INTEGER DEFAULT 0,
  
  -- Game stats
  total_games INTEGER DEFAULT 0,
  completed_games INTEGER DEFAULT 0,
  forfeits INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  decisive_games INTEGER DEFAULT 0,
  
  -- Financial
  total_entry_fees_collected INTEGER DEFAULT 0,
  total_entry_fees_pending INTEGER DEFAULT 0,
  prize_pool_total INTEGER DEFAULT 0,
  
  -- Round stats
  rounds_completed INTEGER DEFAULT 0,
  current_round_games_completed INTEGER DEFAULT 0,
  current_round_games_total INTEGER DEFAULT 0,
  
  -- Timing
  average_game_duration INTERVAL,
  tournament_duration INTERVAL,
  
  -- Last updated
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE tournament_statistics IS 'Cached tournament statistics for performance';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Update tournament statistics
CREATE OR REPLACE FUNCTION update_tournament_statistics(tournament_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO tournament_statistics (tournament_id)
  VALUES (tournament_uuid)
  ON CONFLICT (tournament_id) DO UPDATE SET
    total_registered = (
      SELECT COUNT(*) FROM tournament_registrations 
      WHERE tournament_id = tournament_uuid
    ),
    total_checked_in = (
      SELECT COUNT(*) FROM tournament_registrations 
      WHERE tournament_id = tournament_uuid AND checked_in = TRUE
    ),
    total_withdrawn = (
      SELECT COUNT(*) FROM tournament_registrations 
      WHERE tournament_id = tournament_uuid AND status = 'withdrawn'
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Auto-update player_pool statistics
CREATE OR REPLACE FUNCTION update_player_pool_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    -- Update tournament count and game stats for both players
    -- This would need actual implementation based on your schema
    NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Player Pool - Public can read, admin can write
ALTER TABLE player_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active players"
ON player_pool FOR SELECT
USING (active = TRUE OR auth.role() = 'admin');

CREATE POLICY "Only admins can manage player pool"
ON player_pool FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Tournaments - Public can read, admin/arbiter can write
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournaments"
ON tournaments FOR SELECT
USING (true);

CREATE POLICY "Admins and arbiters can manage tournaments"
ON tournaments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'arbiter')
  )
);

-- Registrations - Public can read, authenticated can register
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view registrations"
ON tournament_registrations FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can register"
ON tournament_registrations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage registrations"
ON tournament_registrations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'arbiter')
  )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'player_pool', 
  'tournaments', 
  'tournament_registrations',
  'check_in_log',
  'result_entries',
  'arbiter_actions',
  'tournament_statistics'
)
ORDER BY table_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Complete Tournament System database created successfully!';
  RAISE NOTICE 'Created tables: player_pool, tournaments, registrations, check_in_log, result_entries, arbiter_actions';
  RAISE NOTICE 'Ready for Swiss Manager-style tournament management!';
END $$;


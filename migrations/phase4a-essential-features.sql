-- ============================================================================
-- PHASE 4A: ESSENTIAL FIDE FEATURES
-- Database Schema Updates
-- ============================================================================
-- 
-- Features:
-- 1. Forfeit wins / No-show handling
-- 2. Late entries with TPN management
-- 3. Player withdrawals mid-tournament
-- 4. Games played counter for BYE assignment
-- 5. Default time tracking
-- ============================================================================

-- ============================================================================
-- PLAYERS TABLE UPDATES
-- ============================================================================

-- Add forfeit win tracking (C.2 - affects BYE eligibility)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS received_forfeit_win BOOLEAN DEFAULT FALSE;

-- Add late entry tracking
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS entry_round INTEGER DEFAULT 1;

-- Add withdrawal tracking
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS withdrawn BOOLEAN DEFAULT FALSE;

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS withdrawn_after_round INTEGER;

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS withdrawal_reason TEXT;

-- Add games played counter (used for BYE assignment priority)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS games_played INTEGER DEFAULT 0;

-- Add temporary pairing number (TPN) for late entries
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS temporary_pairing_number INTEGER;

-- Add comment
COMMENT ON COLUMN players.received_forfeit_win IS 'True if player received forfeit win. Affects BYE eligibility per FIDE C.2';
COMMENT ON COLUMN players.entry_round IS 'Round number when player entered tournament. 1 = from start, >1 = late entry';
COMMENT ON COLUMN players.withdrawn IS 'True if player has withdrawn from tournament';
COMMENT ON COLUMN players.withdrawn_after_round IS 'Last round played before withdrawal';
COMMENT ON COLUMN players.games_played IS 'Total games actually played (excludes BYE, forfeits received). Used for BYE assignment per FIDE 2.1.3';
COMMENT ON COLUMN players.temporary_pairing_number IS 'TPN for late entries. Used for initial pairing order per FIDE C.04.2-C';

-- ============================================================================
-- GAMES TABLE UPDATES
-- ============================================================================

-- Add forfeit tracking
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS forfeit BOOLEAN DEFAULT FALSE;

ALTER TABLE games 
ADD COLUMN IF NOT EXISTS forfeit_winner TEXT; -- 'white' | 'black' | null

ALTER TABLE games 
ADD COLUMN IF NOT EXISTS forfeit_reason TEXT; -- 'no_show' | 'late_arrival' | 'withdrawal' | 'arbiter_decision'

ALTER TABLE games 
ADD COLUMN IF NOT EXISTS forfeit_time TIMESTAMP WITH TIME ZONE; -- When forfeit was declared

-- Add unplayed game tracking (FIDE 7.5)
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS unplayed BOOLEAN DEFAULT FALSE;

ALTER TABLE games 
ADD COLUMN IF NOT EXISTS unplayed_reason TEXT; -- 'time' | 'arbiter_decision' | 'mutual_agreement'

-- Add scheduled start time (for default time calculation)
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP WITH TIME ZONE;

-- Add actual start time (when game actually began)
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS actual_start TIMESTAMP WITH TIME ZONE;

-- Add comment
COMMENT ON COLUMN games.forfeit IS 'True if game was decided by forfeit';
COMMENT ON COLUMN games.forfeit_winner IS 'Which player won by forfeit';
COMMENT ON COLUMN games.forfeit_reason IS 'Reason for forfeit';
COMMENT ON COLUMN games.scheduled_start IS 'Scheduled start time for default time calculation';
COMMENT ON COLUMN games.actual_start IS 'Actual start time when game began';

-- ============================================================================
-- TOURNAMENT TABLE UPDATES
-- ============================================================================

-- Add default time settings (FIDE 6.7)
ALTER TABLE tournament 
ADD COLUMN IF NOT EXISTS default_time_minutes INTEGER DEFAULT 30;

ALTER TABLE tournament 
ADD COLUMN IF NOT EXISTS grace_period_minutes INTEGER DEFAULT 0;

-- Add BYE point settings (some tournaments use 0.5 or 0 points)
ALTER TABLE tournament 
ADD COLUMN IF NOT EXISTS bye_points NUMERIC(3,1) DEFAULT 1.0;

-- Add late entry settings
ALTER TABLE tournament 
ADD COLUMN IF NOT EXISTS allow_late_entries BOOLEAN DEFAULT TRUE;

ALTER TABLE tournament 
ADD COLUMN IF NOT EXISTS late_entry_deadline_round INTEGER; -- NULL = no deadline

-- Add comment
COMMENT ON COLUMN tournament.default_time_minutes IS 'Minutes after scheduled start before forfeit (FIDE 6.7)';
COMMENT ON COLUMN tournament.grace_period_minutes IS 'Grace period before default time starts';
COMMENT ON COLUMN tournament.bye_points IS 'Points awarded for BYE (1.0 standard, 0.5 half-point BYE, 0.0 zero-point BYE)';
COMMENT ON COLUMN tournament.allow_late_entries IS 'Whether late entries are allowed';
COMMENT ON COLUMN tournament.late_entry_deadline_round IS 'Last round for late entries (NULL = no deadline)';

-- ============================================================================
-- CREATE AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tournament_audit_log (
  id SERIAL PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'forfeit' | 'withdrawal' | 'late_entry' | 'bye_assignment'
  player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
  game_id TEXT,
  round_number INTEGER,
  action_data JSONB, -- Additional data about the action
  performed_by TEXT, -- User who performed the action (arbiter)
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_log_tournament ON tournament_audit_log(tournament_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_player ON tournament_audit_log(player_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON tournament_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON tournament_audit_log(performed_at);

COMMENT ON TABLE tournament_audit_log IS 'Audit log for critical tournament actions (forfeits, withdrawals, etc.)';

-- ============================================================================
-- CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to check if player can receive BYE (FIDE C.2)
CREATE OR REPLACE FUNCTION can_receive_bye(player_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM players 
    WHERE id = player_id_param 
    AND (
      received_bye = TRUE 
      OR received_forfeit_win = TRUE
      OR withdrawn = TRUE
    )
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_receive_bye IS 'Check if player is eligible to receive BYE per FIDE C.2';

-- Function to count games actually played (excludes BYE and forfeit wins)
CREATE OR REPLACE FUNCTION count_games_played(player_id_param INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM games g
    WHERE (g.white_player_id = player_id_param OR g.black_player_id = player_id_param)
    AND g.completed = TRUE
    AND g.forfeit = FALSE
    AND g.black_player_id != 0 -- Exclude BYE
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION count_games_played IS 'Count actual games played (excludes BYE and forfeits received)';

-- Function to update games_played counter
CREATE OR REPLACE FUNCTION update_games_played_counter()
RETURNS VOID AS $$
BEGIN
  UPDATE players
  SET games_played = count_games_played(id);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_games_played_counter IS 'Update games_played counter for all players';

-- ============================================================================
-- UPDATE EXISTING DATA
-- ============================================================================

-- Set entry_round to 1 for all existing players
UPDATE players SET entry_round = 1 WHERE entry_round IS NULL;

-- Calculate games_played for existing players
SELECT update_games_played_counter();

-- Set default tournament settings if not set
UPDATE tournament 
SET 
  default_time_minutes = COALESCE(default_time_minutes, 30),
  grace_period_minutes = COALESCE(grace_period_minutes, 0),
  bye_points = COALESCE(bye_points, 1.0),
  allow_late_entries = COALESCE(allow_late_entries, TRUE)
WHERE 
  default_time_minutes IS NULL 
  OR grace_period_minutes IS NULL 
  OR bye_points IS NULL 
  OR allow_late_entries IS NULL;

-- ============================================================================
-- CREATE TRIGGER TO AUTO-UPDATE games_played
-- ============================================================================

CREATE OR REPLACE FUNCTION update_player_games_played()
RETURNS TRIGGER AS $$
BEGIN
  -- Update white player
  IF NEW.white_player_id IS NOT NULL THEN
    UPDATE players
    SET games_played = count_games_played(NEW.white_player_id)
    WHERE id = NEW.white_player_id;
  END IF;
  
  -- Update black player (if not BYE)
  IF NEW.black_player_id IS NOT NULL AND NEW.black_player_id != 0 THEN
    UPDATE players
    SET games_played = count_games_played(NEW.black_player_id)
    WHERE id = NEW.black_player_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_games_played ON games;

CREATE TRIGGER trigger_update_games_played
AFTER INSERT OR UPDATE OF completed ON games
FOR EACH ROW
WHEN (NEW.completed = TRUE)
EXECUTE FUNCTION update_player_games_played();

COMMENT ON TRIGGER trigger_update_games_played ON games IS 'Auto-update games_played counter when game completes';

-- ============================================================================
-- GRANT PERMISSIONS (if using RLS)
-- ============================================================================

-- Allow public read access to audit log for transparency
ALTER TABLE tournament_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view audit log"
ON tournament_audit_log FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert audit log"
ON tournament_audit_log FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify columns added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'players' 
AND column_name IN (
  'received_forfeit_win', 
  'entry_round', 
  'withdrawn', 
  'games_played',
  'temporary_pairing_number'
)
ORDER BY column_name;

SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'games' 
AND column_name IN (
  'forfeit', 
  'forfeit_winner', 
  'unplayed',
  'scheduled_start'
)
ORDER BY column_name;

-- Verify functions created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN (
  'can_receive_bye',
  'count_games_played',
  'update_games_played_counter'
)
ORDER BY routine_name;

-- Verify trigger created
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_games_played';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Phase 4A database migration completed successfully!';
  RAISE NOTICE 'Added: Forfeit tracking, late entries, withdrawals, games played counter';
  RAISE NOTICE 'Created: Audit log table, helper functions, triggers';
  RAISE NOTICE 'Please update your application code to use these new features.';
END $$;


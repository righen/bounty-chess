/**
 * Phase 4A: Essential FIDE Features - Type Definitions
 * 
 * Features:
 * - Forfeit wins / No-show handling
 * - Late entries with TPN management
 * - Player withdrawals
 * - Games played tracking
 */

import { Player, Game } from '@/types';

// ============================================================================
// FORFEIT TYPES
// ============================================================================

export type ForfeitReason = 
  | 'no_show'           // Player didn't arrive
  | 'late_arrival'      // Player arrived after default time
  | 'withdrawal'        // Player withdrew
  | 'arbiter_decision'  // Arbiter declared forfeit
  | 'time_forfeit'      // Clock ran out (already handled)
  | 'other';

export type ForfeitWinner = 'white' | 'black';

export interface ForfeitData {
  gameId: string;
  winner: ForfeitWinner;
  reason: ForfeitReason;
  declaredAt: Date;
  declaredBy?: string; // Arbiter who declared it
  notes?: string;
}

export interface ForfeitResult {
  game: Game;
  winner: Player;
  loser: Player;
  bountyTransfer: number; // Always 0 for forfeits
  pointsAwarded: number;  // Usually 1
  forfeitData: ForfeitData;
}

// ============================================================================
// LATE ENTRY TYPES
// ============================================================================

export interface LateEntryPlayer extends Player {
  entryRound: number;                // Round they entered (>1 = late)
  temporaryPairingNumber: number;    // TPN for pairing order
  initialRank?: number;              // Their rank/rating if known
  missedRounds: number[];            // Rounds they missed
}

export interface LateEntryRequest {
  player: Omit<Player, 'id'>;
  entryRound: number;
  initialRank?: number;
  notes?: string;
}

export interface LateEntryResult {
  success: boolean;
  player?: LateEntryPlayer;
  error?: string;
  tpnAssigned?: number;
}

// ============================================================================
// WITHDRAWAL TYPES
// ============================================================================

export type WithdrawalReason =
  | 'personal'
  | 'medical'
  | 'disqualification'
  | 'no_show_multiple'
  | 'other';

export interface WithdrawalData {
  playerId: number;
  withdrawnAfterRound: number;
  reason: WithdrawalReason;
  withdrawnAt: Date;
  withdrawnBy?: string; // Arbiter who processed it
  notes?: string;
}

export interface WithdrawnPlayer extends Player {
  withdrawn: true;
  withdrawnAfterRound: number;
  withdrawalReason: string;
}

export interface WithdrawalResult {
  success: boolean;
  player?: WithdrawnPlayer;
  affectedGames: Game[];  // Games that become forfeits
  error?: string;
}

// ============================================================================
// DEFAULT TIME TRACKING
// ============================================================================

export interface DefaultTimeSettings {
  defaultTimeMinutes: number;     // FIDE 6.7 - usually 30
  gracePeriodMinutes: number;     // Optional grace period (0-5)
}

export interface GameTimeInfo {
  gameId: string;
  scheduledStart: Date;
  actualStart?: Date;
  whiteArrivalTime?: Date;
  blackArrivalTime?: Date;
  defaultTimePassed: {
    white: boolean;
    black: boolean;
  };
}

// ============================================================================
// BYE ELIGIBILITY
// ============================================================================

export interface ByeEligibility {
  playerId: number;
  eligible: boolean;
  reason?: string;  // Why not eligible
  priority: number; // For sorting (lower = higher priority)
}

export interface ByeAssignmentCriteria {
  score: number;
  gamesPlayed: number;  // FIDE 2.1.3 - NEW
  tpn: number;
}

// ============================================================================
// GAMES PLAYED TRACKING
// ============================================================================

export interface GamesPlayedInfo {
  playerId: number;
  totalGames: number;        // All games in database
  gamesPlayed: number;       // Actual games played (no BYE, no forfeit received)
  byeReceived: number;       // Number of BYEs
  forfeitsReceived: number;  // Forfeit wins received
  forfeitsGiven: number;     // Forfeits given (losses)
  withdrawnGames: number;    // Games missed due to withdrawal
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export type AuditActionType = 
  | 'forfeit'
  | 'withdrawal'
  | 'late_entry'
  | 'bye_assignment'
  | 'pairing_adjustment'
  | 'result_correction';

export interface AuditLogEntry {
  id?: number;
  tournamentId: string;
  actionType: AuditActionType;
  playerId?: number;
  gameId?: string;
  roundNumber?: number;
  actionData: Record<string, any>;
  performedBy?: string;
  performedAt: Date;
  notes?: string;
}

// ============================================================================
// TOURNAMENT SETTINGS (EXTENDED)
// ============================================================================

export interface TournamentSettingsExtended {
  defaultTimeMinutes: number;
  gracePeriodMinutes: number;
  byePoints: number;              // 0, 0.5, or 1.0
  allowLateEntries: boolean;
  lateEntryDeadlineRound?: number; // NULL = no deadline
}

// ============================================================================
// PLAYER STATUS (EXTENDED)
// ============================================================================

export interface PlayerStatus {
  playerId: number;
  active: boolean;
  withdrawn: boolean;
  entryRound: number;
  gamesPlayed: number;
  receivedBye: boolean;
  receivedForfeitWin: boolean;
  canReceiveBye: boolean;
}

// ============================================================================
// FORFEIT CHECK RESULT
// ============================================================================

export interface ForfeitCheckResult {
  shouldForfeit: boolean;
  player: 'white' | 'black';
  reason: ForfeitReason;
  minutesLate: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PlayerWithExtendedInfo extends Player {
  gamesPlayed: number;
  receivedForfeitWin: boolean;
  entryRound: number;
  withdrawn: boolean;
  withdrawnAfterRound?: number;
  temporaryPairingNumber?: number;
}


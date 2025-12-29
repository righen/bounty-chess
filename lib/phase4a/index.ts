/**
 * Phase 4A: Essential FIDE Features
 * 
 * This module provides critical missing features based on FIDE Arbiters' Manual 2025:
 * - Forfeit wins / No-show handling (Articles 5.1, 6.7, 6.8, C.2)
 * - Late entries with TPN management (C.04.2 Article C)
 * - Player withdrawals mid-tournament (C.04.2 Article C)
 * - Games played counter for BYE assignment (Article 2.1.3)
 * 
 * @module phase4a
 * @version 1.0.0
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Forfeit types
  ForfeitReason,
  ForfeitWinner,
  ForfeitData,
  ForfeitResult,
  ForfeitCheckResult,
  GameTimeInfo,
  DefaultTimeSettings,
  
  // Late entry types
  LateEntryPlayer,
  LateEntryRequest,
  LateEntryResult,
  
  // Withdrawal types
  WithdrawalReason,
  WithdrawalData,
  WithdrawnPlayer,
  WithdrawalResult,
  
  // BYE types
  ByeEligibility,
  ByeAssignmentCriteria,
  
  // Tracking types
  GamesPlayedInfo,
  PlayerStatus,
  PlayerWithExtendedInfo,
  
  // Audit types
  AuditActionType,
  AuditLogEntry,
  
  // Settings types
  TournamentSettingsExtended,
} from './types';

// ============================================================================
// FORFEIT HANDLING EXPORTS
// ============================================================================

export {
  // Constants
  DEFAULT_SETTINGS,
  
  // Detection functions
  checkDefaultTime,
  shouldForfeitGame,
  
  // Processing functions
  processForfeit,
  calculateForfeitResult,
  handleNoShow,
  handleLateArrival,
  handleDoubleNoShow,
  
  // Eligibility
  canReceiveByeAfterForfeit,
  
  // Validation
  validateForfeitRequest,
  
  // Utilities
  formatForfeitReason,
  getTimeUntilDefault,
} from './forfeit-handler';

// ============================================================================
// LATE ENTRY EXPORTS
// ============================================================================

export {
  // TPN assignment
  calculateTPN,
  reassignTPNs,
  
  // Validation
  validateLateEntry,
  
  // Processing
  processLateEntry,
  prepareLateEntryForPairing,
  canPairInRound,
  
  // Score adjustment
  calculateMissedRoundPoints,
  
  // Statistics
  calculateLateEntryStats,
  
  // UI helpers
  formatLateEntryInfo,
  getLateEntryBadgeColor,
} from './late-entry-handler';

// ============================================================================
// WITHDRAWAL EXPORTS
// ============================================================================

export {
  // Validation
  validateWithdrawal,
  
  // Processing
  processWithdrawal,
  processWithdrawalBeforeRound,
  processWithdrawalDuringRound,
  resolveWithdrawalGames,
  
  // Pairing integration
  filterWithdrawnPlayers,
  isPlayerWithdrawn,
  getActivePlayers,
  
  // Statistics
  calculateWithdrawalStats,
  
  // Reasons
  formatWithdrawalReason,
  getWithdrawalSeverity,
  
  // Eligibility
  isEligibleForPrize,
  isEligibleForRefund,
  
  // UI helpers
  formatWithdrawalInfo,
  getWithdrawalBadgeColor,
  createWithdrawalNotification,
} from './withdrawal-handler';

// ============================================================================
// BYE ASSIGNMENT EXPORTS (FIXED)
// ============================================================================

export {
  // Games played calculation
  countGamesPlayed,
  getGamesPlayedFromDB,
  
  // BYE eligibility (fixed with forfeit check)
  canReceiveBye,
  getByeEligibility,
  
  // BYE assignment (fixed with games played priority)
  assignBye,
  assignByeSimple,
  
  // Validation
  validateByeAssignment,
  
  // Statistics
  calculateByeStats,
  
  // UI helpers
  formatByeEligibility,
  getTopByeCandidates,
} from './bye-assignment';

// ============================================================================
// VERSION INFO
// ============================================================================

export const PHASE4A_VERSION = '1.0.0';
export const FIDE_MANUAL_VERSION = '2025';

// ============================================================================
// QUICK START EXAMPLES
// ============================================================================

/**
 * Example 1: Handle No-Show
 * 
 * ```typescript
 * import { handleNoShow } from '@/lib/phase4a';
 * 
 * const forfeitResult = handleNoShow(
 *   game,
 *   'white', // Who didn't show
 *   whitePlayer,
 *   blackPlayer,
 *   'Arbiter Name'
 * );
 * 
 * // Update database with forfeitResult.game
 * // Update players: winner gets +1 point, +0 pesos
 * // Mark winner as receivedForfeitWin = true
 * ```
 * 
 * Example 2: Add Late Entry
 * 
 * ```typescript
 * import { processLateEntry, validateLateEntry } from '@/lib/phase4a';
 * 
 * const request = {
 *   player: newPlayerData,
 *   entryRound: 3,
 *   initialRank: 1500,
 * };
 * 
 * const validation = validateLateEntry(request, currentRound, true);
 * if (validation.valid) {
 *   const result = processLateEntry(request, existingPlayers, currentRound);
 *   // Add result.player to database
 * }
 * ```
 * 
 * Example 3: Process Withdrawal
 * 
 * ```typescript
 * import { processWithdrawal } from '@/lib/phase4a';
 * 
 * const withdrawalData = {
 *   playerId: player.id,
 *   withdrawnAfterRound: 5,
 *   reason: 'medical',
 *   withdrawnAt: new Date(),
 *   withdrawnBy: 'Arbiter Name',
 * };
 * 
 * const result = processWithdrawal(
 *   player,
 *   withdrawalData,
 *   upcomingGames,
 *   currentRoundGame
 * );
 * 
 * // Update player: withdrawn = true
 * // Update all affected games (forfeit wins to opponents)
 * ```
 * 
 * Example 4: Assign BYE (Fixed)
 * 
 * ```typescript
 * import { assignBye } from '@/lib/phase4a';
 * 
 * const playerForBye = assignBye(activePlayers, allGames);
 * 
 * if (playerForBye) {
 *   // Create BYE game
 *   // Award +1 point to playerForBye
 *   // Mark player.receivedBye = true
 * }
 * ```
 */


/**
 * Phase 4A: Forfeit Handling
 * FIDE Rules: Articles 5.1, 6.7, 6.8, C.2
 * 
 * Handles:
 * - No-show detection
 * - Default time calculation
 * - Forfeit win assignment
 * - BYE eligibility updates
 */

import { Game, Player } from '@/types';
import {
  ForfeitData,
  ForfeitResult,
  ForfeitReason,
  ForfeitWinner,
  ForfeitCheckResult,
  DefaultTimeSettings,
  GameTimeInfo,
} from './types';

// ============================================================================
// DEFAULT TIME CONSTANTS
// ============================================================================

export const DEFAULT_SETTINGS: DefaultTimeSettings = {
  defaultTimeMinutes: 30,  // FIDE 6.7 standard
  gracePeriodMinutes: 0,   // No grace period by default
};

// ============================================================================
// FORFEIT DETECTION
// ============================================================================

/**
 * Check if a player should be forfeited based on arrival time
 * FIDE 6.7 - Default time
 */
export function checkDefaultTime(
  scheduledStart: Date,
  whiteArrival: Date | null,
  blackArrival: Date | null,
  currentTime: Date,
  settings: DefaultTimeSettings = DEFAULT_SETTINGS
): ForfeitCheckResult | null {
  const defaultDeadline = new Date(
    scheduledStart.getTime() + 
    (settings.defaultTimeMinutes + settings.gracePeriodMinutes) * 60000
  );
  
  // If current time hasn't passed default deadline yet, no forfeit
  if (currentTime < defaultDeadline) {
    return null;
  }
  
  const whiteArrived = whiteArrival !== null;
  const blackArrived = blackArrival !== null;
  
  // Both arrived - no forfeit
  if (whiteArrived && blackArrived) {
    return null;
  }
  
  // Neither arrived - double forfeit (rare, arbiter decides)
  if (!whiteArrived && !blackArrived) {
    // Usually give to white by default, but arbiter should decide
    const minutesLate = Math.floor(
      (currentTime.getTime() - defaultDeadline.getTime()) / 60000
    );
    
    return {
      shouldForfeit: true,
      player: 'white', // Default, but should be arbiter decision
      reason: 'no_show',
      minutesLate,
    };
  }
  
  // One player didn't arrive
  if (!whiteArrived) {
    const minutesLate = Math.floor(
      (currentTime.getTime() - defaultDeadline.getTime()) / 60000
    );
    
    return {
      shouldForfeit: true,
      player: 'white',
      reason: whiteArrival ? 'late_arrival' : 'no_show',
      minutesLate,
    };
  }
  
  if (!blackArrived) {
    const minutesLate = Math.floor(
      (currentTime.getTime() - defaultDeadline.getTime()) / 60000
    );
    
    return {
      shouldForfeit: true,
      player: 'black',
      reason: blackArrival ? 'late_arrival' : 'no_show',
      minutesLate,
    };
  }
  
  return null;
}

/**
 * Check if game should be forfeited based on time info
 */
export function shouldForfeitGame(
  gameTime: GameTimeInfo,
  currentTime: Date,
  settings: DefaultTimeSettings = DEFAULT_SETTINGS
): ForfeitCheckResult | null {
  return checkDefaultTime(
    gameTime.scheduledStart,
    gameTime.whiteArrivalTime || null,
    gameTime.blackArrivalTime || null,
    currentTime,
    settings
  );
}

// ============================================================================
// FORFEIT EXECUTION
// ============================================================================

/**
 * Process a forfeit win
 * FIDE 5.1 - Game won by forfeit
 */
export function processForfeit(
  game: Game,
  winner: ForfeitWinner,
  reason: ForfeitReason,
  declaredBy?: string,
  notes?: string
): ForfeitData {
  const now = new Date();
  
  return {
    gameId: game.id,
    winner,
    reason,
    declaredAt: now,
    declaredBy,
    notes,
  };
}

/**
 * Calculate forfeit result with all details
 */
export function calculateForfeitResult(
  game: Game,
  whitePlayer: Player,
  blackPlayer: Player,
  forfeitData: ForfeitData
): ForfeitResult {
  const winner = forfeitData.winner === 'white' ? whitePlayer : blackPlayer;
  const loser = forfeitData.winner === 'white' ? blackPlayer : whitePlayer;
  
  // Forfeit = +1 point, +0 bounty for winner
  const pointsAwarded = 1;
  const bountyTransfer = 0; // No bounty transfer on forfeit
  
  return {
    game: {
      ...game,
      result: forfeitData.winner === 'white' ? 'white' : 'black',
      completed: true,
      bountyTransfer: 0,
      sheriffUsage: {
        white: false,
        black: false,
      },
    },
    winner,
    loser,
    bountyTransfer,
    pointsAwarded,
    forfeitData,
  };
}

// ============================================================================
// NO-SHOW HANDLING
// ============================================================================

/**
 * Handle a no-show player
 * Automatically awards forfeit win to opponent
 */
export function handleNoShow(
  game: Game,
  noShowPlayer: 'white' | 'black',
  whitePlayer: Player,
  blackPlayer: Player,
  declaredBy?: string
): ForfeitResult {
  const winner: ForfeitWinner = noShowPlayer === 'white' ? 'black' : 'white';
  
  const forfeitData = processForfeit(
    game,
    winner,
    'no_show',
    declaredBy,
    `${noShowPlayer === 'white' ? 'White' : 'Black'} player did not show up`
  );
  
  return calculateForfeitResult(game, whitePlayer, blackPlayer, forfeitData);
}

/**
 * Handle late arrival forfeit
 * Player arrived but after default time
 */
export function handleLateArrival(
  game: Game,
  latePlayer: 'white' | 'black',
  minutesLate: number,
  whitePlayer: Player,
  blackPlayer: Player,
  declaredBy?: string
): ForfeitResult {
  const winner: ForfeitWinner = latePlayer === 'white' ? 'black' : 'white';
  
  const forfeitData = processForfeit(
    game,
    winner,
    'late_arrival',
    declaredBy,
    `${latePlayer === 'white' ? 'White' : 'Black'} player arrived ${minutesLate} minutes late`
  );
  
  return calculateForfeitResult(game, whitePlayer, blackPlayer, forfeitData);
}

/**
 * Handle double no-show (both players absent)
 * Arbiter must decide the result
 */
export function handleDoubleNoShow(
  game: Game,
  whitePlayer: Player,
  blackPlayer: Player,
  arbiterDecision: ForfeitWinner,
  declaredBy?: string
): ForfeitResult {
  const forfeitData = processForfeit(
    game,
    arbiterDecision,
    'no_show',
    declaredBy,
    'Both players did not show up. Arbiter decision.'
  );
  
  return calculateForfeitResult(game, whitePlayer, blackPlayer, forfeitData);
}

// ============================================================================
// BYE ELIGIBILITY UPDATE
// ============================================================================

/**
 * Check if player can receive BYE after forfeit win
 * FIDE C.2 - Players with forfeit wins cannot receive BYE
 */
export function canReceiveByeAfterForfeit(
  player: Player,
  receivedForfeitWin: boolean
): boolean {
  // Already has BYE = cannot receive another
  if (player.receivedBye) {
    return false;
  }
  
  // Received forfeit win = cannot receive BYE (FIDE C.2)
  if (receivedForfeitWin) {
    return false;
  }
  
  return true;
}

// ============================================================================
// FORFEIT VALIDATION
// ============================================================================

/**
 * Validate forfeit request
 */
export function validateForfeitRequest(
  game: Game,
  winner: ForfeitWinner,
  reason: ForfeitReason
): { valid: boolean; error?: string } {
  // Game already completed
  if (game.completed) {
    return {
      valid: false,
      error: 'Game is already completed',
    };
  }
  
  // Invalid winner
  if (winner !== 'white' && winner !== 'black') {
    return {
      valid: false,
      error: 'Invalid winner specified',
    };
  }
  
  // Valid reasons
  const validReasons: ForfeitReason[] = [
    'no_show',
    'late_arrival',
    'withdrawal',
    'arbiter_decision',
    'other',
  ];
  
  if (!validReasons.includes(reason)) {
    return {
      valid: false,
      error: 'Invalid forfeit reason',
    };
  }
  
  return { valid: true };
}

// ============================================================================
// FORFEIT STATISTICS
// ============================================================================

/**
 * Get forfeit statistics for a tournament
 */
export interface ForfeitStats {
  totalForfeits: number;
  noShows: number;
  lateArrivals: number;
  withdrawals: number;
  arbiterDecisions: number;
  byRound: Map<number, number>;
}

export function calculateForfeitStats(games: Game[]): ForfeitStats {
  const stats: ForfeitStats = {
    totalForfeits: 0,
    noShows: 0,
    lateArrivals: 0,
    withdrawals: 0,
    arbiterDecisions: 0,
    byRound: new Map(),
  };
  
  for (const game of games) {
    // This would need to check the forfeit column in the database
    // For now, this is a placeholder
  }
  
  return stats;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format forfeit reason for display
 */
export function formatForfeitReason(reason: ForfeitReason): string {
  const reasons: Record<ForfeitReason, string> = {
    no_show: 'No-show',
    late_arrival: 'Late arrival',
    withdrawal: 'Player withdrawal',
    arbiter_decision: 'Arbiter decision',
    time_forfeit: 'Time forfeit',
    other: 'Other',
  };
  
  return reasons[reason] || 'Unknown';
}

/**
 * Get time until default time
 */
export function getTimeUntilDefault(
  scheduledStart: Date,
  currentTime: Date,
  settings: DefaultTimeSettings = DEFAULT_SETTINGS
): number {
  const defaultDeadline = new Date(
    scheduledStart.getTime() + settings.defaultTimeMinutes * 60000
  );
  
  const minutesUntil = Math.floor(
    (defaultDeadline.getTime() - currentTime.getTime()) / 60000
  );
  
  return Math.max(0, minutesUntil);
}


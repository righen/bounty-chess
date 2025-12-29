/**
 * Phase 4A: Late Entry Handling
 * FIDE Rules: C.04.2 Article C (Page 115)
 * 
 * Handles:
 * - Players arriving after Round 1
 * - Temporary Pairing Number (TPN) assignment
 * - Initial rank/rating integration
 * - Missed rounds tracking
 */

import { Player } from '@/types';
import {
  LateEntryPlayer,
  LateEntryRequest,
  LateEntryResult,
} from './types';

// ============================================================================
// TPN ASSIGNMENT
// ============================================================================

/**
 * Calculate Temporary Pairing Number for late entry
 * FIDE C.04.2-C: Late entries receive TPN based on their initial rank
 * 
 * Algorithm:
 * 1. If has rating/rank: Insert based on that
 * 2. If no rating: Assign lowest TPN
 */
export function calculateTPN(
  initialRank: number | undefined,
  existingPlayers: Player[]
): number {
  if (existingPlayers.length === 0) {
    return 1;
  }
  
  // Get all existing TPNs
  const existingTPNs = existingPlayers.map((p, index) => index + 1);
  const maxTPN = Math.max(...existingTPNs);
  
  // If no rank provided, assign lowest TPN (highest number)
  if (initialRank === undefined) {
    return maxTPN + 1;
  }
  
  // Find position based on rank
  // Lower rank number = higher strength = lower TPN
  const playersWithRank = existingPlayers.filter(p => p.id !== undefined);
  
  // Sort by rank (assuming id is used as rank for now)
  playersWithRank.sort((a, b) => {
    // This would use actual rating if available
    return a.id - b.id;
  });
  
  // Find where to insert
  let tpn = 1;
  for (const player of playersWithRank) {
    if (initialRank < player.id) {
      break;
    }
    tpn++;
  }
  
  return tpn;
}

/**
 * Reassign TPNs after late entry
 * All players with TPN >= new player's TPN get incremented
 */
export function reassignTPNs(
  players: Player[],
  newPlayerTPN: number
): Player[] {
  return players.map((player, index) => {
    const currentTPN = index + 1;
    if (currentTPN >= newPlayerTPN) {
      return {
        ...player,
        // Would need to update TPN field if we add it to Player type
      };
    }
    return player;
  });
}

// ============================================================================
// LATE ENTRY VALIDATION
// ============================================================================

/**
 * Validate late entry request
 */
export function validateLateEntry(
  request: LateEntryRequest,
  currentRound: number,
  allowLateEntries: boolean,
  lateEntryDeadline?: number
): { valid: boolean; error?: string } {
  // Late entries not allowed
  if (!allowLateEntries) {
    return {
      valid: false,
      error: 'Late entries are not allowed in this tournament',
    };
  }
  
  // Entry round must be current or past
  if (request.entryRound > currentRound) {
    return {
      valid: false,
      error: `Cannot enter for future round. Current round is ${currentRound}`,
    };
  }
  
  // Entry round must be > 1 to be considered late
  if (request.entryRound <= 1) {
    return {
      valid: false,
      error: 'Entry round must be greater than 1 for late entries',
    };
  }
  
  // Check deadline
  if (lateEntryDeadline && currentRound > lateEntryDeadline) {
    return {
      valid: false,
      error: `Late entry deadline was Round ${lateEntryDeadline}`,
    };
  }
  
  // Validate player data
  if (!request.player.name || !request.player.surname) {
    return {
      valid: false,
      error: 'Player name and surname are required',
    };
  }
  
  return { valid: true };
}

// ============================================================================
// LATE ENTRY PROCESSING
// ============================================================================

/**
 * Process a late entry request
 */
export function processLateEntry(
  request: LateEntryRequest,
  existingPlayers: Player[],
  currentRound: number
): LateEntryResult {
  // Calculate missed rounds
  const missedRounds: number[] = [];
  for (let r = 1; r < request.entryRound; r++) {
    missedRounds.push(r);
  }
  
  // Calculate TPN
  const tpn = calculateTPN(request.initialRank, existingPlayers);
  
  // Create late entry player
  const latePlayer: LateEntryPlayer = {
    ...request.player,
    id: 0, // Will be assigned by database
    entryRound: request.entryRound,
    temporaryPairingNumber: tpn,
    initialRank: request.initialRank,
    missedRounds,
    bounty: 20, // Default bounty
    wins: 0,
    draws: 0,
    losses: 0,
    age: request.player.age || 0,
    gender: request.player.gender || 'M',
    criminalStatus: 'normal',
    hasSheriffBadge: true,
    colorHistory: [],
    opponentIds: [],
  };
  
  return {
    success: true,
    player: latePlayer,
    tpnAssigned: tpn,
  };
}

// ============================================================================
// PAIRING INTEGRATION
// ============================================================================

/**
 * Prepare late entry player for pairing
 * Late entries start pairing from their entry round
 */
export function prepareLateEntryForPairing(
  latePlayer: LateEntryPlayer,
  currentRound: number
): Player {
  // Late player should not be paired for missed rounds
  if (currentRound < latePlayer.entryRound) {
    throw new Error(`Cannot pair late entry before entry round ${latePlayer.entryRound}`);
  }
  
  // Return as regular player for pairing
  return {
    ...latePlayer,
    // Color history is empty (no games played yet)
    // Score is 0 (no points yet)
  };
}

/**
 * Check if player is eligible for pairing in a round
 */
export function canPairInRound(
  player: LateEntryPlayer,
  roundNumber: number
): boolean {
  // Can only pair from entry round onwards
  return roundNumber >= player.entryRound;
}

// ============================================================================
// LATE ENTRY SCORE ADJUSTMENT
// ============================================================================

/**
 * Some tournaments award points for missed rounds (e.g., 0.5 per missed round)
 * This is tournament-specific, not standard FIDE
 */
export function calculateMissedRoundPoints(
  missedRounds: number,
  pointsPerMissedRound: number = 0
): number {
  return missedRounds * pointsPerMissedRound;
}

// ============================================================================
// LATE ENTRY STATISTICS
// ============================================================================

export interface LateEntryStats {
  totalLateEntries: number;
  byRound: Map<number, number>;
  averageEntryRound: number;
}

export function calculateLateEntryStats(players: Player[]): LateEntryStats {
  const lateEntries = players.filter((p: any) => p.entryRound > 1);
  
  const byRound = new Map<number, number>();
  let totalEntryRound = 0;
  
  for (const player of lateEntries) {
    const entryRound = (player as any).entryRound;
    byRound.set(entryRound, (byRound.get(entryRound) || 0) + 1);
    totalEntryRound += entryRound;
  }
  
  return {
    totalLateEntries: lateEntries.length,
    byRound,
    averageEntryRound: lateEntries.length > 0 
      ? totalEntryRound / lateEntries.length 
      : 0,
  };
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Format late entry info for display
 */
export function formatLateEntryInfo(player: LateEntryPlayer): string {
  return `Entered Round ${player.entryRound} (Missed ${player.missedRounds.length} rounds)`;
}

/**
 * Get late entry badge color
 */
export function getLateEntryBadgeColor(roundsMissed: number): string {
  if (roundsMissed <= 1) return 'blue';
  if (roundsMissed <= 3) return 'yellow';
  return 'red';
}


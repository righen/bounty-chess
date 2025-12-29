/**
 * FIDE Swiss Pairing System - Float Tracking Utilities
 * Rule A.4 - Floaters and floats
 */

import { Player } from '@/types';
import { BracketPlayer, FloatHistory } from './types';
import { calculatePlayerPoints } from './psd-utils';

// ============================================================================
// FLOAT HISTORY INITIALIZATION
// ============================================================================

/**
 * Initialize float history from player's game history
 * Rule A.4.b - Track downfloats and upfloats
 */
export function initializeFloatHistory(
  player: Player,
  allGames: { roundNumber: number; whitePlayerId: number; blackPlayerId: number; whiteScore: number; blackScore: number }[]
): FloatHistory {
  const history: FloatHistory = {
    downfloats: [],
    upfloats: [],
  };
  
  // Need to analyze each round to determine if player floated
  const playerGames = allGames.filter(
    g => g.whitePlayerId === player.id || g.blackPlayerId === player.id
  );
  
  for (const game of playerGames) {
    const isWhite = game.whitePlayerId === player.id;
    const playerScore = isWhite ? game.whiteScore : game.blackScore;
    const opponentScore = isWhite ? game.blackScore : game.whiteScore;
    
    if (playerScore > opponentScore) {
      // Player had higher score -> downfloat
      history.downfloats.push(game.roundNumber);
    } else if (playerScore < opponentScore) {
      // Player had lower score -> upfloat
      history.upfloats.push(game.roundNumber);
    }
    // Equal scores = no float
  }
  
  return history;
}

/**
 * Check if player had downfloat in specific round
 */
export function hadDownfloatInRound(player: BracketPlayer, roundNumber: number): boolean {
  return player.floatHistory.downfloats.includes(roundNumber);
}

/**
 * Check if player had upfloat in specific round
 */
export function hadUpfloatInRound(player: BracketPlayer, roundNumber: number): boolean {
  return player.floatHistory.upfloats.includes(roundNumber);
}

// ============================================================================
// FLOAT PROTECTION CHECKS (Rules C.12-C.15)
// ============================================================================

/**
 * Check if player is protected from floating
 * Rules C.12-C.15 - Minimize repeated floats
 */
export interface FloatProtection {
  protectedFromDownfloat: boolean;
  protectedFromUpfloat: boolean;
  protectionStrength: number; // 0 = no protection, 1 = previous round, 2 = two rounds ago
  lastDownfloatRound: number | null;
  lastUpfloatRound: number | null;
}

export function getFloatProtection(
  player: BracketPlayer,
  currentRound: number
): FloatProtection {
  const prevRound = currentRound - 1;
  const twoRoundsAgo = currentRound - 2;
  
  const hadDownfloatPrev = hadDownfloatInRound(player, prevRound);
  const hadUpfloatPrev = hadUpfloatInRound(player, prevRound);
  const hadDownfloatTwoAgo = hadDownfloatInRound(player, twoRoundsAgo);
  const hadUpfloatTwoAgo = hadUpfloatInRound(player, twoRoundsAgo);
  
  let protectionStrength = 0;
  if (hadDownfloatPrev || hadUpfloatPrev) protectionStrength = 1;
  else if (hadDownfloatTwoAgo || hadUpfloatTwoAgo) protectionStrength = 2;
  
  const downfloats = player.floatHistory.downfloats;
  const upfloats = player.floatHistory.upfloats;
  
  return {
    protectedFromDownfloat: hadDownfloatPrev || hadDownfloatTwoAgo,
    protectedFromUpfloat: hadUpfloatPrev || hadUpfloatTwoAgo,
    protectionStrength,
    lastDownfloatRound: downfloats.length > 0 ? downfloats[downfloats.length - 1] : null,
    lastUpfloatRound: upfloats.length > 0 ? upfloats[upfloats.length - 1] : null,
  };
}

// ============================================================================
// FLOAT PENALTY CALCULATION
// ============================================================================

/**
 * Calculate penalty for making a player float (for optimization)
 * Higher penalty = worse to make this player float
 */
export function calculateFloatPenalty(
  player: BracketPlayer,
  currentRound: number,
  isDownfloat: boolean
): number {
  const protection = getFloatProtection(player, currentRound);
  let penalty = 0;
  
  if (isDownfloat) {
    if (hadDownfloatInRound(player, currentRound - 1)) {
      penalty += 100; // C.12 - Previous round downfloat
    } else if (hadDownfloatInRound(player, currentRound - 2)) {
      penalty += 50; // C.14 - Two rounds ago downfloat
    }
  } else {
    if (hadUpfloatInRound(player, currentRound - 1)) {
      penalty += 100; // C.13 - Previous round upfloat
    } else if (hadUpfloatInRound(player, currentRound - 2)) {
      penalty += 50; // C.15 - Two rounds ago upfloat
    }
  }
  
  return penalty;
}

// ============================================================================
// UNPLAYED ROUND HANDLING
// ============================================================================

/**
 * Check if player did not play in a specific round
 * Rule A.4.b - Unplayed round = downfloat
 */
export function didNotPlayRound(player: Player, roundNumber: number): boolean {
  // Check if player has a game for this round
  // This would need to be checked against actual game records
  // For now, we can check if the color history has a gap
  return false; // Placeholder - implement based on actual game records
}

/**
 * Add downfloat for unplayed round
 * Rule A.4.b - Any unplayed round receives downfloat
 */
export function addUnplayedRoundDownfloat(
  floatHistory: FloatHistory,
  roundNumber: number
): FloatHistory {
  if (!floatHistory.downfloats.includes(roundNumber)) {
    return {
      ...floatHistory,
      downfloats: [...floatHistory.downfloats, roundNumber],
    };
  }
  return floatHistory;
}

// ============================================================================
// DOUBLE FLOATER DETECTION
// ============================================================================

/**
 * Check if player is a double floater (MDP who must float again)
 * This happens when MDP cannot be paired in current bracket
 */
export function isDoubleFloater(
  player: BracketPlayer,
  currentRound: number
): boolean {
  // Player is double floater if they floated in previous round
  // AND will float again in current round
  const prevRound = currentRound - 1;
  return hadDownfloatInRound(player, prevRound);
}

/**
 * Calculate score difference for double floater (Rules C.16-C.19)
 * Protected players who float again should minimize their score difference
 */
export function calculateProtectedFloaterScoreDiff(
  floater: BracketPlayer,
  opponentScore: number
): number {
  const floaterScore = calculatePlayerPoints(floater);
  return Math.abs(floaterScore - opponentScore);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Count total floats for a player
 */
export function countTotalFloats(player: BracketPlayer): number {
  return player.floatHistory.downfloats.length + player.floatHistory.upfloats.length;
}

/**
 * Get most recent float round for a player
 */
export function getMostRecentFloatRound(player: BracketPlayer): number | null {
  const allFloats = [
    ...player.floatHistory.downfloats,
    ...player.floatHistory.upfloats,
  ].sort((a, b) => b - a);
  
  return allFloats.length > 0 ? allFloats[0] : null;
}

/**
 * Format float history for display
 */
export function formatFloatHistory(floatHistory: FloatHistory): string {
  const down = floatHistory.downfloats.length > 0 
    ? `D[${floatHistory.downfloats.join(',')}]` 
    : '';
  const up = floatHistory.upfloats.length > 0 
    ? `U[${floatHistory.upfloats.join(',')}]` 
    : '';
  
  if (!down && !up) return 'No floats';
  return [down, up].filter(Boolean).join(' ');
}


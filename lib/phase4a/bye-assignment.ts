/**
 * Phase 4A: BYE Assignment (Fixed)
 * FIDE Rules: Article 2.1, C.2
 * 
 * Fixes:
 * - Add games played counter (priority 2.1.3)
 * - Forfeit win eligibility check (C.2)
 * - Proper sorting priority
 */

import { Player } from '@/types';
import { ByeEligibility, ByeAssignmentCriteria, PlayerWithExtendedInfo } from './types';

// ============================================================================
// GAMES PLAYED CALCULATION
// ============================================================================

/**
 * Count games actually played (excludes BYE and forfeit wins received)
 * Used for BYE assignment priority per FIDE 2.1.3
 */
export function countGamesPlayed(player: Player): number {
  // Filter out BYE from color history
  const gamesPlayed = player.colorHistory.filter(c => c !== 'BYE').length;
  
  // If we have received_forfeit_win flag, subtract those
  // (Forfeits received count as "scoring without playing")
  const forfeitWinsReceived = (player as any).receivedForfeitWin ? 1 : 0;
  
  return Math.max(0, gamesPlayed - forfeitWinsReceived);
}

/**
 * Get games played from database (more accurate)
 */
export function getGamesPlayedFromDB(
  playerId: number,
  games: Array<{whitePlayerId: number; blackPlayerId: number; completed: boolean; forfeit?: boolean}>
): number {
  let count = 0;
  
  for (const game of games) {
    // Skip incomplete games
    if (!game.completed) continue;
    
    // Skip if player not in game
    if (game.whitePlayerId !== playerId && game.blackPlayerId !== playerId) {
      continue;
    }
    
    // Skip forfeits
    if (game.forfeit) continue;
    
    // Skip BYE (blackPlayerId = 0)
    if (game.blackPlayerId === 0) continue;
    
    count++;
  }
  
  return count;
}

// ============================================================================
// BYE ELIGIBILITY (FIXED)
// ============================================================================

/**
 * Check if player can receive BYE
 * FIDE C.2 - Enhanced with forfeit win check
 */
export function canReceiveBye(player: PlayerWithExtendedInfo): boolean {
  // Check if player has BYE in color history
  const hasBye = player.colorHistory.includes('BYE');
  if (hasBye) {
    return false;
  }
  
  // Received forfeit win (NEW - FIDE C.2)
  if (player.receivedForfeitWin) {
    return false;
  }
  
  // Player is withdrawn
  if (player.withdrawn) {
    return false;
  }
  
  return true;
}

/**
 * Get BYE eligibility with reason
 */
export function getByeEligibility(player: PlayerWithExtendedInfo, gamesPlayed: number): ByeEligibility {
  const hasBye = player.colorHistory.includes('BYE');
  if (hasBye) {
    return {
      playerId: player.id,
      eligible: false,
      reason: 'Already received BYE',
      priority: Infinity,
    };
  }
  
  if (player.receivedForfeitWin) {
    return {
      playerId: player.id,
      eligible: false,
      reason: 'Received forfeit win (FIDE C.2)',
      priority: Infinity,
    };
  }
  
  if (player.withdrawn) {
    return {
      playerId: player.id,
      eligible: false,
      reason: 'Player withdrawn',
      priority: Infinity,
    };
  }
  
  // Calculate priority (lower = higher priority for BYE)
  const score = player.wins + (player.draws * 0.5);
  const priority = (score * 10000) - (gamesPlayed * 100) - (1000 - player.id);
  
  return {
    playerId: player.id,
    eligible: true,
    priority,
  };
}

// ============================================================================
// BYE ASSIGNMENT (FIXED WITH GAMES PLAYED)
// ============================================================================

/**
 * Assign BYE with correct FIDE priority
 * 
 * FIDE 2.1 Priority:
 * 1. Leaves legal pairing for all teams ✓
 * 2. Lowest score ✓
 * 3. Highest number of games played (FIXED!)
 * 4. Highest TPN ✓
 */
export function assignBye(
  players: PlayerWithExtendedInfo[],
  games: Array<{whitePlayerId: number; blackPlayerId: number; completed: boolean; forfeit?: boolean}>
): PlayerWithExtendedInfo | null {
  // Filter eligible players
  const eligible = players.filter(p => canReceiveBye(p));
  
  if (eligible.length === 0) {
    return null;
  }
  
  // Calculate criteria for each player
  const criteria: Array<{ player: PlayerWithExtendedInfo; criteria: ByeAssignmentCriteria }> = eligible.map(p => ({
    player: p,
    criteria: {
      score: p.wins + (p.draws * 0.5),
      gamesPlayed: getGamesPlayedFromDB(p.id, games),
      tpn: p.id,
    },
  }));
  
  // Sort by FIDE priority
  criteria.sort((a, b) => {
    // 1. Lowest score
    if (a.criteria.score !== b.criteria.score) {
      return a.criteria.score - b.criteria.score;
    }
    
    // 2. Highest games played (FIXED!)
    if (a.criteria.gamesPlayed !== b.criteria.gamesPlayed) {
      return b.criteria.gamesPlayed - a.criteria.gamesPlayed; // Higher first
    }
    
    // 3. Highest TPN (actually higher ID for tie-break)
    return b.criteria.tpn - a.criteria.tpn;
  });
  
  return criteria[0]?.player || null;
}

/**
 * Assign BYE with simple algorithm (for testing)
 */
export function assignByeSimple(players: PlayerWithExtendedInfo[]): PlayerWithExtendedInfo | null {
  const eligible = players
    .filter(p => canReceiveBye(p))
    .sort((a, b) => {
      const scoreA = a.wins + (a.draws * 0.5);
      const scoreB = b.wins + (b.draws * 0.5);
      
      if (scoreA !== scoreB) return scoreA - scoreB;
      return b.id - a.id;
    });
  
  return eligible[0] || null;
}

// ============================================================================
// BYE VALIDATION
// ============================================================================

/**
 * Validate BYE assignment
 */
export function validateByeAssignment(
  player: PlayerWithExtendedInfo,
  allPlayers: PlayerWithExtendedInfo[]
): { valid: boolean; error?: string } {
  if (!canReceiveBye(player)) {
    return {
      valid: false,
      error: 'Player is not eligible for BYE',
    };
  }
  
  // Check if there are other players with lower priority
  const betterCandidates = allPlayers.filter(p => {
    if (!canReceiveBye(p)) return false;
    if (p.id === player.id) return false;
    
    const pScore = p.wins + (p.draws * 0.5);
    const playerScore = player.wins + (player.draws * 0.5);
    
    return pScore < playerScore;
  });
  
  if (betterCandidates.length > 0) {
    return {
      valid: false,
      error: `There are ${betterCandidates.length} player(s) with lower score who should receive BYE first`,
    };
  }
  
  return { valid: true };
}

// ============================================================================
// BYE STATISTICS
// ============================================================================

export interface ByeStats {
  totalByes: number;
  byRound: Map<number, number>;
  playersWithBye: number;
  averageByeRound: number;
}

export function calculateByeStats(
  players: Player[],
  games: Array<{roundNumber: number; blackPlayerId: number; completed: boolean}>
): ByeStats {
  const byeGames = games.filter(g => g.blackPlayerId === 0 && g.completed);
  const byRound = new Map<number, number>();
  let totalByeRound = 0;
  
  for (const game of byeGames) {
    byRound.set(game.roundNumber, (byRound.get(game.roundNumber) || 0) + 1);
    totalByeRound += game.roundNumber;
  }
  
  const playersWithBye = players.filter(p => p.colorHistory.includes('BYE')).length;
  
  return {
    totalByes: byeGames.length,
    byRound,
    playersWithBye,
    averageByeRound: byeGames.length > 0 ? totalByeRound / byeGames.length : 0,
  };
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Format BYE eligibility for display
 */
export function formatByeEligibility(eligibility: ByeEligibility): string {
  if (!eligibility.eligible) {
    return `Not eligible: ${eligibility.reason}`;
  }
  
  return `Eligible (Priority: ${eligibility.priority.toFixed(0)})`;
}

/**
 * Get top BYE candidates (for UI display)
 */
export function getTopByeCandidates(
  players: PlayerWithExtendedInfo[],
  games: Array<{whitePlayerId: number; blackPlayerId: number; completed: boolean; forfeit?: boolean}>,
  limit: number = 5
): Array<{ player: PlayerWithExtendedInfo; criteria: ByeAssignmentCriteria; rank: number }> {
  const eligible = players.filter(p => canReceiveBye(p));
  
  const criteria = eligible.map(p => ({
    player: p,
    criteria: {
      score: p.wins + (p.draws * 0.5),
      gamesPlayed: getGamesPlayedFromDB(p.id, games),
      tpn: p.id,
    },
  }));
  
  criteria.sort((a, b) => {
    if (a.criteria.score !== b.criteria.score) {
      return a.criteria.score - b.criteria.score;
    }
    if (a.criteria.gamesPlayed !== b.criteria.gamesPlayed) {
      return b.criteria.gamesPlayed - a.criteria.gamesPlayed;
    }
    return b.criteria.tpn - a.criteria.tpn;
  });
  
  return criteria.slice(0, limit).map((c, index) => ({
    ...c,
    rank: index + 1,
  }));
}


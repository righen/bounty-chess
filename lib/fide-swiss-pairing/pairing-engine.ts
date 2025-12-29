/**
 * FIDE Swiss Pairing System - Main Pairing Engine
 * Rule A.9 - Complete round-pairing algorithm
 * 
 * This is the core entry point for generating FIDE-compliant Swiss pairings
 */

import { Player, Game } from '@/types';
import {
  BracketPlayer,
  Bracket,
  PairingConstraints,
  PairingResult,
  FloatHistory,
} from './types';
import { getColorPreference } from './color-utils';
import { initializeFloatHistory } from './float-utils';
import { groupPlayersByScore, getScoresDescending, calculatePlayerPoints } from './psd-utils';
import { findBestPairing } from './bracket-pairing';

// ============================================================================
// MAIN PAIRING FUNCTION
// ============================================================================

/**
 * Generate FIDE-compliant Swiss pairing for a round
 * 
 * @param players - All active players in the tournament
 * @param roundNumber - Current round number (1-based)
 * @param totalRounds - Total rounds in tournament
 * @param constraints - Pairing constraints (played opponents, BYEs, etc.)
 * @param initialColor - Color determined by lot before Round 1
 * @returns Pairing result with games or error
 */
export function pairRound(
  players: Player[],
  roundNumber: number,
  totalRounds: number,
  constraints?: Partial<PairingConstraints>,
  initialColor: 'W' | 'B' = 'W'
): PairingResult {
  // Initialize constraints if not provided
  const pairingConstraints = initializeConstraints(players, constraints);
  
  // Convert players to BracketPlayers
  const bracketPlayers = players.map(p => toBracketPlayer(p, roundNumber, totalRounds));
  
  // Group players by score
  const scoreGroups = groupPlayersByScore(bracketPlayers);
  const scores = getScoresDescending(scoreGroups);
  
  // Check if pairing is possible
  if (scores.length === 0) {
    return {
      games: [],
      success: false,
      method: 'impossible',
    };
  }
  
  // Try normal pairing process
  try {
    const result = normalPairingProcess(
      scoreGroups,
      scores,
      pairingConstraints,
      initialColor
    );
    
    if (result.success) {
      return result;
    }
  } catch (error) {
    console.error('Normal pairing failed:', error);
  }
  
  // If normal process fails, try PPB/CLB process
  // TODO: Implement PPB/CLB process (A.9)
  
  return {
    games: [],
    success: false,
    method: 'impossible',
  };
}

// ============================================================================
// NORMAL PAIRING PROCESS
// ============================================================================

/**
 * Normal pairing process - pair brackets from top to bottom
 * Rule A.9 - Standard process
 */
function normalPairingProcess(
  scoreGroups: Map<number, BracketPlayer[]>,
  scores: number[],
  constraints: PairingConstraints,
  initialColor: 'W' | 'B'
): PairingResult {
  const allGames: Game[] = [];
  let downfloaters: BracketPlayer[] = [];
  let bracketsProcessed = 0;
  let transpositionsTriedTotal = 0;
  let exchangesTriedTotal = 0;
  let candidatesEvaluated = 0;
  
  // Process each scoregroup from highest to lowest
  for (const score of scores) {
    const residentPlayers = scoreGroups.get(score) || [];
    
    // Build bracket (residents + downfloaters from previous)
    const bracket: Bracket = {
      residentScore: score,
      residentPlayers,
      mdps: downfloaters,
      isHomogeneous: downfloaters.length === 0,
      isHeterogeneous: downfloaters.length > 0,
    };
    
    // Find best pairing for this bracket
    const candidate = findBestPairing(bracket, constraints, initialColor);
    
    if (!candidate) {
      // Cannot pair this bracket - pairing fails
      return {
        games: [],
        success: false,
        method: 'normal',
      };
    }
    
    // Convert pairs to games
    const bracketGames = candidatePairsToGames(candidate.pairs, bracketsProcessed + 1);
    allGames.push(...bracketGames);
    
    // Update constraints with new pairs
    updateConstraints(constraints, candidate.pairs);
    
    // Set downfloaters for next bracket
    downfloaters = candidate.downfloaters;
    
    bracketsProcessed++;
    candidatesEvaluated += 1; // Simplified - actual count would be higher
  }
  
  // Handle remaining downfloaters (should be at most 1 for BYE)
  if (downfloaters.length === 1) {
    // Assign BYE
    const byePlayer = downfloaters[0];
    
    // Check if player can receive BYE (C.2)
    if (canReceiveBYE(byePlayer, constraints)) {
      const byeGame = createBYEGame(byePlayer, bracketsProcessed);
      allGames.push(byeGame);
      
      // Update constraints
      constraints.receivedBye.add(byePlayer.id);
    } else {
      // Player cannot receive BYE - pairing fails
      return {
        games: [],
        success: false,
        method: 'normal',
      };
    }
  } else if (downfloaters.length > 1) {
    // More than 1 unpaired - should not happen in valid pairing
    return {
      games: [],
      success: false,
      method: 'normal',
    };
  }
  
  return {
    games: allGames,
    success: true,
    method: 'normal',
    diagnostics: {
      brackets: bracketsProcessed,
      transpositions: transpositionsTriedTotal,
      exchanges: exchangesTriedTotal,
      candidatesEvaluated,
    },
  };
}

// ============================================================================
// PLAYER CONVERSION
// ============================================================================

/**
 * Convert Player to BracketPlayer with all necessary metadata
 */
function toBracketPlayer(
  player: Player,
  currentRound: number,
  totalRounds: number
): BracketPlayer {
  // Calculate player score from wins and draws
  const playerScore = player.wins + (player.draws * 0.5);
  
  // Calculate if player is topscorer
  const maxPossibleScore = totalRounds;
  const isTopscorer = (currentRound === totalRounds) && 
                      (playerScore > maxPossibleScore * 0.5);
  
  // Get color preference
  const colorPreference = getColorPreference(player);
  
  // Initialize float history (simplified - would need game records)
  const floatHistory: FloatHistory = {
    downfloats: [],
    upfloats: [],
  };
  
  return {
    ...player,
    bsn: 0, // Will be assigned during subgroup division
    colorPreference,
    floatHistory,
    isTopscorer,
  };
}

// ============================================================================
// CONSTRAINT MANAGEMENT
// ============================================================================

/**
 * Initialize pairing constraints from players and partial constraints
 */
function initializeConstraints(
  players: Player[],
  partial?: Partial<PairingConstraints>
): PairingConstraints {
  const playedOpponents = partial?.playedOpponents || new Map<number, Set<number>>();
  
  // Build opponent map from player data if not provided
  if (playedOpponents.size === 0) {
    for (const player of players) {
      playedOpponents.set(player.id, new Set(player.opponentIds));
    }
  }
  
  return {
    playedOpponents,
    receivedBye: partial?.receivedBye || new Set<number>(),
    receivedForfeitWin: partial?.receivedForfeitWin || new Set<number>(),
  };
}

/**
 * Update constraints after pairing
 */
function updateConstraints(
  constraints: PairingConstraints,
  pairs: Array<{ whitePlayer: BracketPlayer; blackPlayer: BracketPlayer }>
): void {
  for (const pair of pairs) {
    const whiteId = pair.whitePlayer.id;
    const blackId = pair.blackPlayer.id;
    
    // Add to played opponents
    if (!constraints.playedOpponents.has(whiteId)) {
      constraints.playedOpponents.set(whiteId, new Set());
    }
    if (!constraints.playedOpponents.has(blackId)) {
      constraints.playedOpponents.set(blackId, new Set());
    }
    
    constraints.playedOpponents.get(whiteId)!.add(blackId);
    constraints.playedOpponents.get(blackId)!.add(whiteId);
  }
}

/**
 * Check if player can receive BYE
 * Rule C.2 - One BYE only
 */
function canReceiveBYE(player: BracketPlayer, constraints: PairingConstraints): boolean {
  // Cannot receive BYE if already had one
  if (constraints.receivedBye.has(player.id)) {
    return false;
  }
  
  // Cannot receive BYE if had forfeit win
  if (constraints.receivedForfeitWin.has(player.id)) {
    return false;
  }
  
  return true;
}

// ============================================================================
// GAME CREATION
// ============================================================================

/**
 * Convert candidate pairs to Game objects
 */
function candidatePairsToGames(
  pairs: Array<{ whitePlayer: BracketPlayer; blackPlayer: BracketPlayer }>,
  roundNumber: number
): Game[] {
  return pairs.map((pair, index) => ({
    id: `R${roundNumber}-${pair.whitePlayer.id}-${pair.blackPlayer.id}`,
    roundNumber,
    whitePlayerId: pair.whitePlayer.id,
    blackPlayerId: pair.blackPlayer.id,
    result: null,
    sheriffUsage: {
      white: false,
      black: false,
    },
    bountyTransfer: 0,
    completed: false,
  }));
}

/**
 * Create BYE game
 */
function createBYEGame(player: BracketPlayer, roundNumber: number): Game {
  return {
    id: `R${roundNumber}-${player.id}-BYE`,
    roundNumber,
    whitePlayerId: player.id,
    blackPlayerId: 0, // 0 indicates BYE
    result: 'white', // BYE = automatic win
    sheriffUsage: {
      white: false,
      black: false,
    },
    bountyTransfer: 0,
    completed: true, // BYE is automatically completed
  };
}

// ============================================================================
// ROUND 1 PAIRING (Special Case)
// ============================================================================

/**
 * Generate Round 1 pairing (alphabetical top-half vs bottom-half)
 * Rule: Round 1 uses alphabetical order if no ratings
 */
export function pairRound1Alphabetical(
  players: Player[],
  initialColor: 'W' | 'B' = 'W'
): PairingResult {
  // Sort alphabetically by surname, then name
  const sorted = [...players].sort((a, b) => {
    const surnameCompare = a.surname.localeCompare(b.surname);
    if (surnameCompare !== 0) return surnameCompare;
    return a.name.localeCompare(b.name);
  });
  
  const games: Game[] = [];
  const halfPoint = Math.ceil(sorted.length / 2);
  
  // Pair top half with bottom half
  for (let i = 0; i < halfPoint; i++) {
    const player1 = sorted[i];
    const player2Index = i + halfPoint;
    
    if (player2Index < sorted.length) {
      const player2 = sorted[player2Index];
      
      // Top half gets initial color, bottom half gets opposite
      const player1IsWhite = initialColor === 'W';
      
      games.push({
        id: `R1-${player1.id}-${player2.id}`,
        roundNumber: 1,
        whitePlayerId: player1IsWhite ? player1.id : player2.id,
        blackPlayerId: player1IsWhite ? player2.id : player1.id,
        result: null,
        sheriffUsage: { white: false, black: false },
        bountyTransfer: 0,
        completed: false,
      });
    } else {
      // Odd number - last player gets BYE
      games.push(createBYEGame(toBracketPlayer(player1, 1, 9), 1));
    }
  }
  
  return {
    games,
    success: true,
    method: 'normal',
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick pairing function with defaults
 */
export function quickPair(
  players: Player[],
  roundNumber: number
): Game[] {
  if (roundNumber === 1) {
    const result = pairRound1Alphabetical(players);
    return result.games;
  }
  
  const result = pairRound(players, roundNumber, 9);
  if (result.success) {
    return result.games;
  }
  
  return [];
}

/**
 * Validate pairing result
 */
export function validatePairing(result: PairingResult, players: Player[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!result.success) {
    errors.push('Pairing failed');
    return { valid: false, errors };
  }
  
  // Check all players paired (except at most 1 BYE)
  const pairedIds = new Set<number>();
  let byeCount = 0;
  
  for (const game of result.games) {
    pairedIds.add(game.whitePlayerId);
    if (game.blackPlayerId === 0) {
      byeCount++;
    } else {
      pairedIds.add(game.blackPlayerId);
    }
  }
  
  if (byeCount > 1) {
    errors.push(`Multiple BYEs detected: ${byeCount}`);
  }
  
  if (pairedIds.size !== players.length) {
    errors.push(`Not all players paired: ${pairedIds.size}/${players.length}`);
  }
  
  // Check no repeat opponents
  // TODO: Implement
  
  return {
    valid: errors.length === 0,
    errors,
  };
}


/**
 * FIDE Swiss Pairing System - PSD (Pairing Score Difference) Utilities
 * Rule A.8 - PSD calculation and comparison
 */

import { Pair, BracketPlayer, ScoreDifference, PairingScoreDifference } from './types';

// ============================================================================
// PSD CALCULATION
// ============================================================================

/**
 * Calculate score difference for a pair
 * Rule A.8 - SD = |score1 - score2|
 */
export function calculatePairScoreDifference(pair: Pair): ScoreDifference {
  const points1 = calculatePlayerPoints(pair.whitePlayer);
  const points2 = calculatePlayerPoints(pair.blackPlayer);
  
  return {
    value: Math.abs(points1 - points2),
    isPair: true,
  };
}

/**
 * Calculate score difference for a downfloater
 * Rule A.8 - SD = FloaterScore - (MinBracketScore - 1)
 */
export function calculateDownfloaterScoreDifference(
  floater: BracketPlayer,
  minBracketScore: number
): ScoreDifference {
  const floaterScore = calculatePlayerPoints(floater);
  const artificialValue = minBracketScore - 1;
  
  return {
    value: floaterScore - artificialValue,
    isPair: false,
    playerId: floater.id,
  };
}

/**
 * Calculate complete PSD for a candidate pairing
 * Rule A.8 - PSD is list of SDs sorted highest to lowest
 */
export function calculatePSD(
  pairs: Pair[],
  downfloaters: BracketPlayer[],
  minBracketScore: number
): PairingScoreDifference {
  const psd: PairingScoreDifference = [];
  
  // Add SDs from pairs
  for (const pair of pairs) {
    psd.push(calculatePairScoreDifference(pair));
  }
  
  // Add SDs from downfloaters
  for (const floater of downfloaters) {
    psd.push(calculateDownfloaterScoreDifference(floater, minBracketScore));
  }
  
  // Sort highest to lowest
  psd.sort((a, b) => b.value - a.value);
  
  return psd;
}

// ============================================================================
// PSD COMPARISON
// ============================================================================

/**
 * Compare two PSDs lexicographically
 * Rule A.8 - Compare element by element, first difference determines winner
 * 
 * @returns -1 if psd1 < psd2 (psd1 is better)
 * @returns 1 if psd1 > psd2 (psd2 is better)
 * @returns 0 if psd1 === psd2 (equal quality)
 */
export function comparePSD(
  psd1: PairingScoreDifference,
  psd2: PairingScoreDifference
): number {
  // PSDs must have same length for comparison to be meaningful
  if (psd1.length !== psd2.length) {
    throw new Error('Cannot compare PSDs of different lengths');
  }
  
  // Compare element by element
  for (let i = 0; i < psd1.length; i++) {
    const value1 = psd1[i].value;
    const value2 = psd2[i].value;
    
    if (value1 < value2) return -1; // psd1 is better (smaller SD)
    if (value1 > value2) return 1;  // psd2 is better
    // If equal, continue to next element
  }
  
  // All elements equal
  return 0;
}

/**
 * Alternative comparison using alphabetical transformation
 * Rule A.8 comment - Transform to letters and compare
 */
export function psdToAlphabetical(psd: PairingScoreDifference): string {
  return psd.map(sd => {
    const value = sd.value;
    // A=0, B=0.5, C=1, D=1.5, E=2, F=2.5, ...
    const index = Math.floor(value * 2);
    return String.fromCharCode(65 + index); // 65 = 'A'
  }).join('');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate total points for a player (wins + draws/2)
 */
export function calculatePlayerPoints(player: BracketPlayer): number {
  return player.wins + (player.draws * 0.5);
}

/**
 * Get minimum score in a bracket
 */
export function getMinBracketScore(players: BracketPlayer[]): number {
  if (players.length === 0) return 0;
  
  let minScore = Infinity;
  for (const player of players) {
    const score = calculatePlayerPoints(player);
    if (score < minScore) {
      minScore = score;
    }
  }
  
  return minScore;
}

/**
 * Sum all score differences in a PSD (for debugging/analysis)
 */
export function sumPSD(psd: PairingScoreDifference): number {
  return psd.reduce((sum, sd) => sum + sd.value, 0);
}

/**
 * Format PSD for display
 */
export function formatPSD(psd: PairingScoreDifference): string {
  return '[' + psd.map(sd => sd.value.toFixed(1)).join(', ') + ']';
}

/**
 * Check if PSD indicates perfect bracket (all SDs = 0)
 */
export function isPerfectPSD(psd: PairingScoreDifference): boolean {
  return psd.every(sd => sd.value === 0);
}

// ============================================================================
// SCORE GROUPING
// ============================================================================

/**
 * Group players by score
 * Returns Map<score, players[]>
 */
export function groupPlayersByScore(players: BracketPlayer[]): Map<number, BracketPlayer[]> {
  const groups = new Map<number, BracketPlayer[]>();
  
  for (const player of players) {
    const score = calculatePlayerPoints(player);
    const group = groups.get(score) || [];
    group.push(player);
    groups.set(score, group);
  }
  
  return groups;
}

/**
 * Get scores in descending order
 */
export function getScoresDescending(scoreGroups: Map<number, BracketPlayer[]>): number[] {
  return Array.from(scoreGroups.keys()).sort((a, b) => b - a);
}


/**
 * FIDE Swiss Pairing System - Exchange Generation
 * Rule D.2 - Exchanges in homogeneous brackets (S1 ↔ S2)
 * Rule D.3 - MDP-Exchanges in heterogeneous brackets (S1 ↔ Limbo)
 * 
 * Exchanges swap players between subgroups to find better pairings
 */

import { BracketPlayer, Exchange, MDPExchange } from './types';

// ============================================================================
// RESIDENT EXCHANGE (D.2) - Homogeneous Brackets
// ============================================================================

/**
 * Generate all resident exchanges in priority order
 * Rule D.2 - Exchange between original S1 and original S2
 * 
 * Priority (descending):
 * a. Smallest number of exchanged BSNs
 * b. Smallest sum difference
 * c. Highest different BSN from S1→S2
 * d. Lowest different BSN from S2→S1
 */
export function generateResidentExchanges(
  s1: BracketPlayer[],
  s2: BracketPlayer[]
): Exchange[] {
  const exchanges: Exchange[] = [];
  
  // Generate exchanges of different sizes (1, 2, 3, ... up to min size)
  const maxSize = Math.min(s1.length, s2.length);
  
  for (let size = 1; size <= maxSize; size++) {
    const sizeExchanges = generateExchangesOfSize(s1, s2, size);
    exchanges.push(...sizeExchanges);
  }
  
  // Sort by priority rules
  exchanges.sort((a, b) => compareResidentExchanges(a, b, s1, s2));
  
  return exchanges;
}

/**
 * Generate exchanges of a specific size
 */
function generateExchangesOfSize(
  s1: BracketPlayer[],
  s2: BracketPlayer[],
  size: number
): Exchange[] {
  const exchanges: Exchange[] = [];
  
  // Get all combinations of 'size' players from S1
  const s1Combinations = combinations(s1.map(p => p.bsn), size);
  
  // Get all combinations of 'size' players from S2
  const s2Combinations = combinations(s2.map(p => p.bsn), size);
  
  // Create exchange for each pair of combinations
  for (const s1Indices of s1Combinations) {
    for (const s2Indices of s2Combinations) {
      exchanges.push({
        s1Indices,
        s2Indices,
      });
    }
  }
  
  return exchanges;
}

/**
 * Compare two resident exchanges by priority rules (D.2)
 */
function compareResidentExchanges(
  ex1: Exchange,
  ex2: Exchange,
  s1: BracketPlayer[],
  s2: BracketPlayer[]
): number {
  // a. Smallest number of exchanged BSNs
  if (ex1.s1Indices.length !== ex2.s1Indices.length) {
    return ex1.s1Indices.length - ex2.s1Indices.length;
  }
  
  // b. Smallest sum difference
  const diff1 = Math.abs(sum(ex2.s2Indices) - sum(ex1.s1Indices));
  const diff2 = Math.abs(sum(ex2.s2Indices) - sum(ex2.s1Indices));
  
  if (diff1 !== diff2) {
    return diff1 - diff2;
  }
  
  // c. Highest different BSN from S1→S2
  const maxS1_1 = Math.max(...ex1.s1Indices);
  const maxS1_2 = Math.max(...ex2.s1Indices);
  
  if (maxS1_1 !== maxS1_2) {
    return maxS1_2 - maxS1_1; // Higher is better, so reverse
  }
  
  // d. Lowest different BSN from S2→S1
  const minS2_1 = Math.min(...ex1.s2Indices);
  const minS2_2 = Math.min(...ex2.s2Indices);
  
  return minS2_1 - minS2_2; // Lower is better
}

// ============================================================================
// MDP EXCHANGE (D.3) - Heterogeneous Brackets
// ============================================================================

/**
 * Generate all MDP exchanges in priority order
 * Rule D.3 - Exchange between original S1 and original Limbo
 * 
 * Priority (descending):
 * a. Highest different score in new S1
 * b. Lowest lexicographic BSN (sorted ascending)
 */
export function generateMDPExchanges(
  s1: BracketPlayer[],
  limbo: BracketPlayer[]
): MDPExchange[] {
  if (limbo.length === 0) {
    return [];
  }
  
  const exchanges: MDPExchange[] = [];
  
  // Generate exchanges of different sizes
  const maxSize = Math.min(s1.length, limbo.length);
  
  for (let size = 1; size <= maxSize; size++) {
    const sizeExchanges = generateMDPExchangesOfSize(s1, limbo, size);
    exchanges.push(...sizeExchanges);
  }
  
  // Sort by priority rules
  exchanges.sort((a, b) => compareMDPExchanges(a, b, s1, limbo));
  
  return exchanges;
}

/**
 * Generate MDP exchanges of a specific size
 */
function generateMDPExchangesOfSize(
  s1: BracketPlayer[],
  limbo: BracketPlayer[],
  size: number
): MDPExchange[] {
  const exchanges: MDPExchange[] = [];
  
  // Get all combinations from S1 and Limbo
  const s1Combinations = combinations(s1.map(p => p.bsn), size);
  const limboCombinations = combinations(limbo.map(p => p.bsn), size);
  
  // Create exchange for each pair
  for (const s1Indices of s1Combinations) {
    for (const limboIndices of limboCombinations) {
      exchanges.push({
        s1Indices,
        limboIndices,
      });
    }
  }
  
  return exchanges;
}

/**
 * Compare two MDP exchanges by priority rules (D.3)
 */
function compareMDPExchanges(
  ex1: MDPExchange,
  ex2: MDPExchange,
  s1: BracketPlayer[],
  limbo: BracketPlayer[]
): number {
  // Calculate new S1 for each exchange
  const newS1_1 = getNewS1AfterMDPExchange(s1, limbo, ex1);
  const newS1_2 = getNewS1AfterMDPExchange(s1, limbo, ex2);
  
  // a. Highest different score in new S1
  const maxScore1 = Math.max(...newS1_1.map(p => calculatePlayerScore(p)));
  const maxScore2 = Math.max(...newS1_2.map(p => calculatePlayerScore(p)));
  
  if (maxScore1 !== maxScore2) {
    return maxScore2 - maxScore1; // Higher is better, so reverse
  }
  
  // b. Lowest lexicographic BSN (sorted ascending)
  const bsns1 = newS1_1.map(p => p.bsn).sort((a, b) => a - b);
  const bsns2 = newS1_2.map(p => p.bsn).sort((a, b) => a - b);
  
  return compareLexicographic(bsns1, bsns2);
}

/**
 * Get new S1 after applying MDP exchange
 */
function getNewS1AfterMDPExchange(
  s1: BracketPlayer[],
  limbo: BracketPlayer[],
  exchange: MDPExchange
): BracketPlayer[] {
  const newS1 = s1.filter(p => !exchange.s1Indices.includes(p.bsn));
  const movedFromLimbo = limbo.filter(p => exchange.limboIndices.includes(p.bsn));
  
  return [...newS1, ...movedFromLimbo].sort((a, b) => a.bsn - b.bsn);
}

// ============================================================================
// EXCHANGE APPLICATION
// ============================================================================

/**
 * Apply resident exchange to S1 and S2
 * Creates new S1 and S2 with swapped players
 */
export function applyResidentExchange(
  s1: BracketPlayer[],
  s2: BracketPlayer[],
  exchange: Exchange
): { newS1: BracketPlayer[]; newS2: BracketPlayer[] } {
  // Remove exchanged players from original subgroups
  const newS1Base = s1.filter(p => !exchange.s1Indices.includes(p.bsn));
  const newS2Base = s2.filter(p => !exchange.s2Indices.includes(p.bsn));
  
  // Get players to move
  const movedToS2 = s1.filter(p => exchange.s1Indices.includes(p.bsn));
  const movedToS1 = s2.filter(p => exchange.s2Indices.includes(p.bsn));
  
  // Create new subgroups
  const newS1 = [...newS1Base, ...movedToS1];
  const newS2 = [...newS2Base, ...movedToS2];
  
  // Sort by BSN (Rule A.2)
  newS1.sort((a, b) => a.bsn - b.bsn);
  newS2.sort((a, b) => a.bsn - b.bsn);
  
  return { newS1, newS2 };
}

/**
 * Apply MDP exchange to S1 and Limbo
 */
export function applyMDPExchange(
  s1: BracketPlayer[],
  limbo: BracketPlayer[],
  exchange: MDPExchange
): { newS1: BracketPlayer[]; newLimbo: BracketPlayer[] } {
  // Remove exchanged players
  const newS1Base = s1.filter(p => !exchange.s1Indices.includes(p.bsn));
  const newLimboBase = limbo.filter(p => !exchange.limboIndices.includes(p.bsn));
  
  // Get players to move
  const movedToLimbo = s1.filter(p => exchange.s1Indices.includes(p.bsn));
  const movedToS1 = limbo.filter(p => exchange.limboIndices.includes(p.bsn));
  
  // Create new subgroups
  const newS1 = [...newS1Base, ...movedToS1];
  const newLimbo = [...newLimboBase, ...movedToLimbo];
  
  // Sort by BSN
  newS1.sort((a, b) => a.bsn - b.bsn);
  newLimbo.sort((a, b) => a.bsn - b.bsn);
  
  return { newS1, newLimbo };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate all combinations of k elements from array
 */
function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  if (k === arr.length) return [arr];
  
  const result: T[][] = [];
  
  // Include first element
  const withFirst = combinations(arr.slice(1), k - 1);
  for (const combo of withFirst) {
    result.push([arr[0], ...combo]);
  }
  
  // Exclude first element
  const withoutFirst = combinations(arr.slice(1), k);
  result.push(...withoutFirst);
  
  return result;
}

/**
 * Sum array of numbers
 */
function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

/**
 * Calculate player score (wins + draws/2)
 */
function calculatePlayerScore(player: BracketPlayer): number {
  return player.wins + (player.draws * 0.5);
}

/**
 * Compare arrays lexicographically
 */
function compareLexicographic(a: number[], b: number[]): number {
  const minLength = Math.min(a.length, b.length);
  
  for (let i = 0; i < minLength; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  
  return a.length - b.length;
}

// ============================================================================
// EXCHANGE COUNTING
// ============================================================================

/**
 * Count total number of resident exchanges
 */
export function countResidentExchanges(s1Size: number, s2Size: number): number {
  const maxSize = Math.min(s1Size, s2Size);
  let total = 0;
  
  for (let size = 1; size <= maxSize; size++) {
    const s1Combos = binomialCoefficient(s1Size, size);
    const s2Combos = binomialCoefficient(s2Size, size);
    total += s1Combos * s2Combos;
  }
  
  return total;
}

/**
 * Count total number of MDP exchanges
 */
export function countMDPExchanges(s1Size: number, limboSize: number): number {
  return countResidentExchanges(s1Size, limboSize);
}

/**
 * Binomial coefficient (n choose k)
 */
function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - i + 1) / i;
  }
  
  return Math.round(result);
}

// ============================================================================
// EXCHANGE FORMATTING
// ============================================================================

/**
 * Format resident exchange for display
 */
export function formatResidentExchange(exchange: Exchange): string {
  return `S1[${exchange.s1Indices.join(',')}] ↔ S2[${exchange.s2Indices.join(',')}]`;
}

/**
 * Format MDP exchange for display
 */
export function formatMDPExchange(exchange: MDPExchange): string {
  return `S1[${exchange.s1Indices.join(',')}] ↔ Limbo[${exchange.limboIndices.join(',')}]`;
}

/**
 * Describe exchange effect
 */
export function describeExchangeEffect(
  exchange: Exchange,
  s1: BracketPlayer[],
  s2: BracketPlayer[]
): string {
  const { newS1, newS2 } = applyResidentExchange(s1, s2, exchange);
  
  const movedToS2Names = s1
    .filter(p => exchange.s1Indices.includes(p.bsn))
    .map(p => `${p.name} ${p.surname}`)
    .join(', ');
  
  const movedToS1Names = s2
    .filter(p => exchange.s2Indices.includes(p.bsn))
    .map(p => `${p.name} ${p.surname}`)
    .join(', ');
  
  return `Move to S2: ${movedToS2Names} | Move to S1: ${movedToS1Names}`;
}


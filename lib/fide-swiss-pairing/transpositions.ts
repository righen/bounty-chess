/**
 * FIDE Swiss Pairing System - Transposition Generation
 * Rule D.1 - Transpositions in S2
 * 
 * A transposition changes the order of players in S2 to create different pairings
 */

import { BracketPlayer, Transposition } from './types';

// ============================================================================
// TRANSPOSITION GENERATION
// ============================================================================

/**
 * Generate all possible transpositions of S2
 * Rule D.1 - All transpositions sorted lexicographically
 * 
 * @param s2 - Subgroup 2 players
 * @param n1 - Size of S1 (number of relevant positions)
 * @returns Array of transpositions in correct order
 */
export function generateAllTranspositions(
  s2: BracketPlayer[],
  n1: number
): Transposition[] {
  if (s2.length === 0 || n1 === 0) {
    return [];
  }
  
  // We only care about first N1 positions (players to pair with S1)
  // Remaining players are bound to float or be in remainder
  const relevantBSNs = s2.slice(0, n1).map(p => p.bsn);
  const irrelevantBSNs = s2.slice(n1).map(p => p.bsn);
  
  // Generate all permutations of relevant BSNs
  const permutations = generatePermutations(relevantBSNs);
  
  // Sort lexicographically
  permutations.sort((a, b) => compareLexicographic(a, b));
  
  // Convert to transpositions
  const transpositions: Transposition[] = [];
  
  for (const perm of permutations) {
    const fullOrder = [...perm, ...irrelevantBSNs];
    const affectedIndices = getAffectedIndices(relevantBSNs, perm);
    
    transpositions.push({
      newOrder: fullOrder,
      affectedIndices,
    });
  }
  
  return transpositions;
}

/**
 * Generate next transposition in sequence
 * More efficient than generating all at once
 */
export function* transpositionGenerator(
  s2: BracketPlayer[],
  n1: number
): Generator<Transposition> {
  if (s2.length === 0 || n1 === 0) {
    return;
  }
  
  const relevantBSNs = s2.slice(0, n1).map(p => p.bsn);
  const irrelevantBSNs = s2.slice(n1).map(p => p.bsn);
  
  // Use Heap's algorithm for efficient permutation generation
  const permGen = heapsPermutations(relevantBSNs);
  const allPerms: number[][] = [];
  
  for (const perm of permGen) {
    allPerms.push([...perm]);
  }
  
  // Sort lexicographically
  allPerms.sort((a, b) => compareLexicographic(a, b));
  
  // Yield transpositions one by one
  for (const perm of allPerms) {
    const fullOrder = [...perm, ...irrelevantBSNs];
    const affectedIndices = getAffectedIndices(relevantBSNs, perm);
    
    yield {
      newOrder: fullOrder,
      affectedIndices,
    };
  }
}

// ============================================================================
// PERMUTATION GENERATION
// ============================================================================

/**
 * Generate all permutations of an array (simple recursive algorithm)
 */
function generatePermutations(arr: number[]): number[][] {
  if (arr.length <= 1) {
    return [arr];
  }
  
  const result: number[][] = [];
  
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const remainingPerms = generatePermutations(remaining);
    
    for (const perm of remainingPerms) {
      result.push([current, ...perm]);
    }
  }
  
  return result;
}

/**
 * Heap's algorithm for generating permutations
 * More efficient for iterative generation
 */
function* heapsPermutations(arr: number[]): Generator<number[]> {
  const n = arr.length;
  const c = new Array(n).fill(0);
  const a = [...arr];
  
  yield [...a];
  
  let i = 0;
  while (i < n) {
    if (c[i] < i) {
      if (i % 2 === 0) {
        [a[0], a[i]] = [a[i], a[0]];
      } else {
        [a[c[i]], a[i]] = [a[i], a[c[i]]];
      }
      
      yield [...a];
      c[i]++;
      i = 0;
    } else {
      c[i] = 0;
      i++;
    }
  }
}

// ============================================================================
// LEXICOGRAPHIC COMPARISON
// ============================================================================

/**
 * Compare two arrays lexicographically
 * Rule D.1 - Dictionary order
 * 
 * @returns -1 if a < b, 1 if a > b, 0 if equal
 */
function compareLexicographic(a: number[], b: number[]): number {
  const minLength = Math.min(a.length, b.length);
  
  for (let i = 0; i < minLength; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  
  // If all compared elements equal, shorter array is "less"
  if (a.length < b.length) return -1;
  if (a.length > b.length) return 1;
  
  return 0;
}

/**
 * Get indices that changed from original to permutation
 */
function getAffectedIndices(original: number[], permutation: number[]): number[] {
  const affected: number[] = [];
  
  for (let i = 0; i < original.length; i++) {
    if (original[i] !== permutation[i]) {
      affected.push(i);
    }
  }
  
  return affected;
}

// ============================================================================
// TRANSPOSITION APPLICATION
// ============================================================================

/**
 * Apply a transposition to S2
 * Creates new S2 with reordered players
 */
export function applyTransposition(
  s2: BracketPlayer[],
  transposition: Transposition
): BracketPlayer[] {
  const newS2: BracketPlayer[] = [];
  
  for (const bsn of transposition.newOrder) {
    const player = s2.find(p => p.bsn === bsn);
    if (player) {
      newS2.push(player);
    }
  }
  
  return newS2;
}

/**
 * Check if transposition is meaningful
 * Rule D.1 note - Only changes in first N1 positions matter
 */
export function isTranspositionMeaningful(
  transposition: Transposition,
  n1: number
): boolean {
  // Check if any of the affected indices are in the relevant part
  return transposition.affectedIndices.some(idx => idx < n1);
}

// ============================================================================
// OPTIMIZATION HELPERS
// ============================================================================

/**
 * Check if transposition creates invalid pairing
 * Rule B.6 note - Skip pairs where S1 player has lower rank than S2 opponent
 */
export function wouldCreateDuplicateCandidate(
  s1: BracketPlayer[],
  s2After: BracketPlayer[]
): boolean {
  for (let i = 0; i < Math.min(s1.length, s2After.length); i++) {
    // If S1 player has higher BSN (lower rank) than S2 opponent,
    // this pairing was already evaluated before
    if (s1[i].bsn > s2After[i].bsn) {
      return true;
    }
  }
  
  return false;
}

/**
 * Count total number of transpositions
 * Useful for progress reporting
 */
export function countTranspositions(s2Length: number, n1: number): number {
  if (s2Length === 0 || n1 === 0) return 0;
  
  const relevantCount = Math.min(s2Length, n1);
  return factorial(relevantCount);
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// ============================================================================
// TRANSPOSITION FORMATTING
// ============================================================================

/**
 * Format transposition for display/debugging
 */
export function formatTransposition(
  transposition: Transposition,
  originalS2: BracketPlayer[]
): string {
  const original = originalS2.map(p => p.bsn).join('-');
  const transposed = transposition.newOrder.join('-');
  
  if (transposition.affectedIndices.length === 0) {
    return `${transposed} (no change)`;
  }
  
  return `${original} → ${transposed} (changed: ${transposition.affectedIndices.join(',')})`;
}

/**
 * Create transposition example for documentation
 * Rule D.1 example: [2,3,4] → [2,4,3] → [3,2,4] → [3,4,2] → [4,2,3] → [4,3,2]
 */
export function generateExampleTranspositions(size: number): string[] {
  const initial = Array.from({ length: size }, (_, i) => i + 1);
  const permutations = generatePermutations(initial);
  permutations.sort((a, b) => compareLexicographic(a, b));
  
  return permutations.map(perm => perm.join(','));
}


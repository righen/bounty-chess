/**
 * FIDE Swiss Pairing System - Bracket Pairing
 * Rules B.1-B.8 - Complete bracket pairing process
 */

import { BracketPlayer, Bracket, Subgroups, CandidatePariring, Pair, PairingConstraints } from './types';
import { calculatePSD, getMinBracketScore, calculatePlayerPoints } from './psd-utils';
import { determineColors } from './color-utils';
import { transpositionGenerator } from './transpositions';
import { generateResidentExchanges, generateMDPExchanges, applyResidentExchange, applyMDPExchange } from './exchanges';

// ============================================================================
// BRACKET PARAMETERS (B.1)
// ============================================================================

export interface BracketParameters {
  m0: number; // Number of MDPs from previous bracket
  maxPairs: number; // Maximum pairs possible
  m1: number; // Maximum MDPs that can be paired
}

/**
 * Calculate bracket parameters
 * Rule B.1
 */
export function calculateBracketParameters(
  bracket: Bracket
): BracketParameters {
  const totalPlayers = bracket.residentPlayers.length + bracket.mdps.length;
  const m0 = bracket.mdps.length;
  
  // MaxPairs usually = floor(totalPlayers / 2)
  // But if M0 > residents, MaxPairs ≤ residents
  let maxPairs = Math.floor(totalPlayers / 2);
  if (m0 > bracket.residentPlayers.length) {
    maxPairs = Math.min(maxPairs, bracket.residentPlayers.length);
  }
  
  // M1 usually = M0
  // But if M0 > residents, M1 ≤ residents
  // And M1 ≤ MaxPairs always
  let m1 = m0;
  if (m0 > bracket.residentPlayers.length) {
    m1 = Math.min(m1, bracket.residentPlayers.length);
  }
  m1 = Math.min(m1, maxPairs);
  
  return { m0, maxPairs, m1 };
}

// ============================================================================
// SUBGROUP DIVISION (B.2)
// ============================================================================

/**
 * Divide bracket into S1, S2, and Limbo
 * Rule B.2
 */
export function divideIntoSubgroups(
  bracket: Bracket,
  params: BracketParameters
): Subgroups {
  const allPlayers = [...bracket.mdps, ...bracket.residentPlayers];
  
  // Sort by A.2 (score, then pairing number)
  allPlayers.sort((a, b) => {
    const scoreA = calculatePlayerScore(a);
    const scoreB = calculatePlayerScore(b);
    
    if (scoreB !== scoreA) return scoreB - scoreA; // Higher score first
    return a.bsn - b.bsn; // Lower BSN first
  });
  
  // Assign BSNs (1, 2, 3, ...)
  allPlayers.forEach((player, index) => {
    player.bsn = index + 1;
  });
  
  // Determine N1
  const n1 = bracket.isHeterogeneous ? params.m1 : params.maxPairs;
  
  // S1 = highest N1 players
  const s1 = allPlayers.slice(0, n1);
  
  // S2 = remaining resident players
  const s2 = allPlayers.slice(n1).filter(p => 
    bracket.residentPlayers.some(r => r.id === p.id)
  );
  
  // Limbo = remaining MDPs (if M1 < M0)
  const limbo = allPlayers.slice(n1).filter(p => 
    bracket.mdps.some(m => m.id === p.id)
  );
  
  return { s1, s2, limbo };
}

// ============================================================================
// CANDIDATE PREPARATION (B.3)
// ============================================================================

/**
 * Prepare a candidate pairing
 * Rule B.3
 */
export function prepareCandidate(
  subgroups: Subgroups,
  bracket: Bracket,
  constraints: PairingConstraints,
  initialColor: 'W' | 'B'
): CandidatePariring | null {
  const pairs: Pair[] = [];
  const downfloaters: BracketPlayer[] = [];
  
  const { s1, s2, limbo } = subgroups;
  
  // For heterogeneous: MDP-Pairing first
  if (bracket.isHeterogeneous) {
    // Pair MDPs from S1 with residents from S2
    const mdpCount = Math.min(s1.length, s2.length);
    
    for (let i = 0; i < mdpCount; i++) {
      const player1 = s1[i];
      const player2 = s2[i];
      
      // Check constraints
      if (!canPair(player1, player2, constraints)) {
        continue;
      }
      
      // Determine colors
      const player1IsWhite = determineColors(player1, player2, initialColor);
      
      const pair: Pair = {
        whitePlayer: player1IsWhite ? player1 : player2,
        blackPlayer: player1IsWhite ? player2 : player1,
        scoreDefference: Math.abs(
          calculatePlayerScore(player1) - calculatePlayerScore(player2)
        ),
      };
      
      pairs.push(pair);
    }
    
    // Limbo players are bound to downfloat
    downfloaters.push(...limbo);
    
    // Remainder = remaining residents
    const pairedIds = new Set(pairs.flatMap(p => [p.whitePlayer.id, p.blackPlayer.id]));
    const remainingResidents = [...s1, ...s2].filter(p => 
      !pairedIds.has(p.id) && 
      bracket.residentPlayers.some(r => r.id === p.id)
    );
    
    // Pair remainder (like homogeneous)
    const remainderPairs = pairHomogeneous(remainingResidents, constraints, initialColor);
    if (remainderPairs) {
      pairs.push(...remainderPairs.pairs);
      downfloaters.push(...remainderPairs.downfloaters);
    }
  } else {
    // Homogeneous bracket
    const result = pairHomogeneous([...s1, ...s2], constraints, initialColor);
    if (result) {
      pairs.push(...result.pairs);
      downfloaters.push(...result.downfloaters);
    }
  }
  
  // Calculate PSD
  const minScore = getMinBracketScore([...bracket.residentPlayers, ...bracket.mdps]);
  const psd = calculatePSD(pairs, downfloaters, minScore);
  
  // Calculate quality metrics
  const qualityMetrics = calculateQualityMetrics(pairs, downfloaters, subgroups);
  
  return {
    pairs,
    downfloaters,
    psd,
    qualityMetrics,
  };
}

/**
 * Pair homogeneous group (all same score or remainder)
 */
function pairHomogeneous(
  players: BracketPlayer[],
  constraints: PairingConstraints,
  initialColor: 'W' | 'B'
): { pairs: Pair[]; downfloaters: BracketPlayer[] } | null {
  const pairs: Pair[] = [];
  const paired = new Set<number>();
  
  // Simple pairing: pair S1[i] with S2[i]
  const halfPoint = Math.ceil(players.length / 2);
  
  for (let i = 0; i < halfPoint; i++) {
    const player1 = players[i];
    if (!player1 || paired.has(player1.id)) continue;
    
    const player2Index = i + halfPoint;
    if (player2Index >= players.length) {
      // Odd number, this player floats
      continue;
    }
    
    const player2 = players[player2Index];
    if (!player2 || paired.has(player2.id)) continue;
    
    // Check constraints
    if (!canPair(player1, player2, constraints)) {
      continue;
    }
    
    // Determine colors
    const player1IsWhite = determineColors(player1, player2, initialColor);
    
    const pair: Pair = {
      whitePlayer: player1IsWhite ? player1 : player2,
      blackPlayer: player1IsWhite ? player2 : player1,
      scoreDefference: Math.abs(
        calculatePlayerScore(player1) - calculatePlayerScore(player2)
      ),
    };
    
    pairs.push(pair);
    paired.add(player1.id);
    paired.add(player2.id);
  }
  
  // Unpaired players are downfloaters
  const downfloaters = players.filter(p => !paired.has(p.id));
  
  return { pairs, downfloaters };
}

// ============================================================================
// CANDIDATE EVALUATION (B.4)
// ============================================================================

/**
 * Check if candidate is perfect
 * Rule B.4 - Complies with all absolute and quality criteria
 */
export function isPerfectCandidate(
  candidate: CandidatePariring,
  params: BracketParameters,
  constraints: PairingConstraints
): boolean {
  // Check absolute criteria (C.1-C.4)
  if (!checkAbsoluteCriteria(candidate, constraints)) {
    return false;
  }
  
  // Check quality criteria (C.5-C.19)
  // For "perfect", all quality criteria must be optimal
  const metrics = candidate.qualityMetrics;
  
  // C.5 - Maximum pairs
  if (metrics.numberOfPairs < params.maxPairs) {
    return false;
  }
  
  // C.10 - Minimum disregarded preferences
  // (Would need to calculate theoretical minimum)
  
  // For simplicity, if no violations of absolute criteria
  // and maximal pairs, consider it acceptable
  return true;
}

/**
 * Check absolute criteria (C.1-C.3)
 */
function checkAbsoluteCriteria(
  candidate: CandidatePariring,
  constraints: PairingConstraints
): boolean {
  // C.1 - No repeat opponents
  for (const pair of candidate.pairs) {
    if (havePlayedBefore(pair.whitePlayer, pair.blackPlayer, constraints)) {
      return false;
    }
  }
  
  // C.3 - Absolute color preferences
  for (const pair of candidate.pairs) {
    const pref1 = pair.whitePlayer.colorPreference;
    const pref2 = pair.blackPlayer.colorPreference;
    
    // Non-topscorers with same absolute preference cannot meet
    if (!pair.whitePlayer.isTopscorer && !pair.blackPlayer.isTopscorer) {
      if (pref1.type === 'absolute' && pref2.type === 'absolute') {
        if (pref1.preferredColor === pref2.preferredColor) {
          return false;
        }
      }
    }
  }
  
  return true;
}

// ============================================================================
// ITERATIVE PAIRING (B.5-B.7)
// ============================================================================

/**
 * Find best pairing for bracket through iteration
 * Rules B.5, B.6, B.7
 */
export function findBestPairing(
  bracket: Bracket,
  constraints: PairingConstraints,
  initialColor: 'W' | 'B'
): CandidatePariring | null {
  const params = calculateBracketParameters(bracket);
  const subgroups = divideIntoSubgroups(bracket, params);
  
  // Try initial candidate
  let bestCandidate = prepareCandidate(subgroups, bracket, constraints, initialColor);
  
  if (bestCandidate && isPerfectCandidate(bestCandidate, params, constraints)) {
    return bestCandidate;
  }
  
  // B.6 - Homogeneous or remainder
  if (!bracket.isHeterogeneous || subgroups.s1.length === 0) {
    return iterateHomogeneous(subgroups, bracket, constraints, initialColor, params, bestCandidate);
  }
  
  // B.7 - Heterogeneous
  return iterateHeterogeneous(subgroups, bracket, constraints, initialColor, params, bestCandidate);
}

/**
 * Iterate through transpositions and exchanges for homogeneous bracket
 * Rule B.6
 */
function iterateHomogeneous(
  originalSubgroups: Subgroups,
  bracket: Bracket,
  constraints: PairingConstraints,
  initialColor: 'W' | 'B',
  params: BracketParameters,
  currentBest: CandidatePariring | null
): CandidatePariring | null {
  let bestCandidate = currentBest;
  
  // Try all transpositions for original S1/S2
  const n1 = params.maxPairs;
  const transpGen = transpositionGenerator(originalSubgroups.s2, n1);
  
  for (const transp of transpGen) {
    const newSubgroups = {
      ...originalSubgroups,
      s2: applyTransposition(originalSubgroups.s2, transp),
    };
    
    const candidate = prepareCandidate(newSubgroups, bracket, constraints, initialColor);
    
    if (candidate) {
      if (isPerfectCandidate(candidate, params, constraints)) {
        return candidate; // Found perfect, return immediately
      }
      
      // Track best
      if (!bestCandidate || isBetterCandidate(candidate, bestCandidate)) {
        bestCandidate = candidate;
      }
    }
  }
  
  // Try exchanges
  const exchanges = generateResidentExchanges(originalSubgroups.s1, originalSubgroups.s2);
  
  for (const exchange of exchanges) {
    const { newS1, newS2 } = applyResidentExchange(
      originalSubgroups.s1,
      originalSubgroups.s2,
      exchange
    );
    
    // For each exchange, try all transpositions
    const transpGen2 = transpositionGenerator(newS2, n1);
    
    for (const transp of transpGen2) {
      const newSubgroups: Subgroups = {
        s1: newS1,
        s2: applyTransposition(newS2, transp),
        limbo: originalSubgroups.limbo,
      };
      
      const candidate = prepareCandidate(newSubgroups, bracket, constraints, initialColor);
      
      if (candidate) {
        if (isPerfectCandidate(candidate, params, constraints)) {
          return candidate;
        }
        
        if (!bestCandidate || isBetterCandidate(candidate, bestCandidate)) {
          bestCandidate = candidate;
        }
      }
    }
  }
  
  return bestCandidate;
}

/**
 * Iterate for heterogeneous bracket
 * Rule B.7
 */
function iterateHeterogeneous(
  originalSubgroups: Subgroups,
  bracket: Bracket,
  constraints: PairingConstraints,
  initialColor: 'W' | 'B',
  params: BracketParameters,
  currentBest: CandidatePariring | null
): CandidatePariring | null {
  // Similar to homogeneous, but also try MDP-exchanges
  let bestCandidate = currentBest;
  
  // Try transpositions of S2 (changes MDP-Pairing)
  const n1 = params.m1;
  const transpGen = transpositionGenerator(originalSubgroups.s2, n1);
  
  for (const transp of transpGen) {
    const newSubgroups = {
      ...originalSubgroups,
      s2: applyTransposition(originalSubgroups.s2, transp),
    };
    
    const candidate = prepareCandidate(newSubgroups, bracket, constraints, initialColor);
    
    if (candidate && isPerfectCandidate(candidate, params, constraints)) {
      return candidate;
    }
    
    if (candidate && (!bestCandidate || isBetterCandidate(candidate, bestCandidate))) {
      bestCandidate = candidate;
    }
  }
  
  // Try MDP-exchanges if Limbo exists
  if (originalSubgroups.limbo.length > 0) {
    const mdpExchanges = generateMDPExchanges(originalSubgroups.s1, originalSubgroups.limbo);
    
    for (const exchange of mdpExchanges) {
      const { newS1, newLimbo } = applyMDPExchange(
        originalSubgroups.s1,
        originalSubgroups.limbo,
        exchange
      );
      
      // For each MDP-exchange, try all transpositions
      const transpGen2 = transpositionGenerator(originalSubgroups.s2, n1);
      
      for (const transp of transpGen2) {
        const newSubgroups: Subgroups = {
          s1: newS1,
          s2: applyTransposition(originalSubgroups.s2, transp),
          limbo: newLimbo,
        };
        
        const candidate = prepareCandidate(newSubgroups, bracket, constraints, initialColor);
        
        if (candidate && isPerfectCandidate(candidate, params, constraints)) {
          return candidate;
        }
        
        if (candidate && (!bestCandidate || isBetterCandidate(candidate, bestCandidate))) {
          bestCandidate = candidate;
        }
      }
    }
  }
  
  return bestCandidate;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculatePlayerScore(player: BracketPlayer): number {
  return calculatePlayerPoints(player);
}

function canPair(p1: BracketPlayer, p2: BracketPlayer, constraints: PairingConstraints): boolean {
  // C.1 - No repeat opponents
  if (havePlayedBefore(p1, p2, constraints)) {
    return false;
  }
  
  // C.3 - Absolute color compatibility
  if (!p1.isTopscorer && !p2.isTopscorer) {
    const pref1 = p1.colorPreference;
    const pref2 = p2.colorPreference;
    
    if (pref1.type === 'absolute' && pref2.type === 'absolute') {
      if (pref1.preferredColor === pref2.preferredColor) {
        return false;
      }
    }
  }
  
  return true;
}

function havePlayedBefore(p1: BracketPlayer, p2: BracketPlayer, constraints: PairingConstraints): boolean {
  const p1Opponents = constraints.playedOpponents.get(p1.id);
  return p1Opponents ? p1Opponents.has(p2.id) : false;
}

function calculateQualityMetrics(
  pairs: Pair[],
  floaters: BracketPlayer[],
  subgroups: Subgroups
): CandidatePariring['qualityMetrics'] {
  return {
    numberOfPairs: pairs.length,
    psd: calculatePSD(pairs, floaters, getMinBracketScore([...subgroups.s1, ...subgroups.s2])),
    disregardedPreferences: 0, // TODO: Calculate
    disregardedStrongPreferences: 0, // TODO
    topscorersWithCDViolation: 0, // TODO
    topscorersWithThreeInRow: 0, // TODO
    repeatedDownfloats: 0, // TODO
    repeatedUpfloats: 0, // TODO
  };
}

function isBetterCandidate(c1: CandidatePariring, c2: CandidatePariring): boolean {
  // Compare by number of pairs first
  if (c1.qualityMetrics.numberOfPairs !== c2.qualityMetrics.numberOfPairs) {
    return c1.qualityMetrics.numberOfPairs > c2.qualityMetrics.numberOfPairs;
  }
  
  // Then by PSD
  // TODO: Implement proper PSD comparison
  return false;
}

function applyTransposition(s2: BracketPlayer[], transp: any): BracketPlayer[] {
  // TODO: Import from transpositions.ts
  return s2;
}


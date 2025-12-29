/**
 * FIDE Swiss Pairing System - Color Utilities
 * Handles color preference calculation and allocation
 */

import { Player } from '@/types';
import { Color, ColorPreference, ColorPreferenceType, BracketPlayer } from './types';

// ============================================================================
// COLOR DIFFERENCE CALCULATION
// ============================================================================

/**
 * Calculate color difference (Whites - Blacks)
 * Rule C.04.2:D.5 - Only played games count
 */
export function calculateColorDifference(colorHistory: Color[]): number {
  let whites = 0;
  let blacks = 0;
  
  for (const color of colorHistory) {
    if (color === 'W') whites++;
    else if (color === 'B') blacks++;
    // BYE doesn't count
  }
  
  return whites - blacks;
}

// ============================================================================
// COLOR PREFERENCE DETERMINATION
// ============================================================================

/**
 * Determine color preference for a player
 * Rule A.6 - Color preferences
 */
export function getColorPreference(player: Player): ColorPreference {
  const playedGames = player.colorHistory.filter(c => c !== 'BYE');
  
  // No games played - no preference (A.6.d)
  if (playedGames.length === 0) {
    return {
      type: 'none',
      preferredColor: null,
      colorDifference: 0,
      lastColor: null,
      lastTwoColors: [null, null],
    };
  }
  
  const cd = calculateColorDifference(player.colorHistory);
  const lastColor = playedGames[playedGames.length - 1] || null;
  const secondLastColor = playedGames[playedGames.length - 2] || null;
  
  // ABSOLUTE PREFERENCE (A.6.a)
  // Condition 1: CD > +1 or CD < -1
  if (cd > 1) {
    return {
      type: 'absolute',
      preferredColor: 'B',
      colorDifference: cd,
      lastColor,
      lastTwoColors: [secondLastColor, lastColor],
    };
  }
  
  if (cd < -1) {
    return {
      type: 'absolute',
      preferredColor: 'W',
      colorDifference: cd,
      lastColor,
      lastTwoColors: [secondLastColor, lastColor],
    };
  }
  
  // Condition 2: Same color last 2 games
  if (playedGames.length >= 2 && lastColor === secondLastColor) {
    return {
      type: 'absolute',
      preferredColor: lastColor === 'W' ? 'B' : 'W',
      colorDifference: cd,
      lastColor,
      lastTwoColors: [secondLastColor, lastColor],
    };
  }
  
  // STRONG PREFERENCE (A.6.b)
  if (cd === 1) {
    return {
      type: 'strong',
      preferredColor: 'B',
      colorDifference: cd,
      lastColor,
      lastTwoColors: [secondLastColor, lastColor],
    };
  }
  
  if (cd === -1) {
    return {
      type: 'strong',
      preferredColor: 'W',
      colorDifference: cd,
      lastColor,
      lastTwoColors: [secondLastColor, lastColor],
    };
  }
  
  // MILD PREFERENCE (A.6.c)
  if (cd === 0 && lastColor) {
    return {
      type: 'mild',
      preferredColor: lastColor === 'W' ? 'B' : 'W',
      colorDifference: cd,
      lastColor,
      lastTwoColors: [secondLastColor, lastColor],
    };
  }
  
  // Default: no preference
  return {
    type: 'none',
    preferredColor: null,
    colorDifference: cd,
    lastColor,
    lastTwoColors: [secondLastColor, lastColor],
  };
}

// ============================================================================
// COLOR COMPATIBILITY
// ============================================================================

/**
 * Check if two players can be paired without violating absolute color preferences
 * Rule C.3 - Non-topscorers with same absolute preference SHALL NOT meet
 */
export function areColorCompatible(
  player1: BracketPlayer,
  player2: BracketPlayer
): boolean {
  const pref1 = player1.colorPreference;
  const pref2 = player2.colorPreference;
  
  // If either is topscorer, color incompatibility is allowed
  if (player1.isTopscorer || player2.isTopscorer) {
    return true;
  }
  
  // If both have absolute preferences for same color, incompatible
  if (
    pref1.type === 'absolute' &&
    pref2.type === 'absolute' &&
    pref1.preferredColor === pref2.preferredColor
  ) {
    return false;
  }
  
  return true;
}

// ============================================================================
// COLOR ALLOCATION
// ============================================================================

/**
 * Determine colors for a pair
 * Rule E - Color allocation rules (5 priorities)
 * @returns true if player1 should be white, false if player2 should be white
 */
export function determineColors(
  player1: BracketPlayer,
  player2: BracketPlayer,
  initialColor: 'W' | 'B'
): boolean {
  const pref1 = player1.colorPreference;
  const pref2 = player2.colorPreference;
  
  // E.1 - Grant both preferences
  if (pref1.preferredColor && pref2.preferredColor) {
    if (pref1.preferredColor === 'W' && pref2.preferredColor === 'B') {
      return true; // player1 white, player2 black
    }
    if (pref1.preferredColor === 'B' && pref2.preferredColor === 'W') {
      return false; // player2 white, player1 black
    }
  }
  
  // E.2 - Grant stronger preference
  const strength1 = getPreferenceStrength(pref1.type);
  const strength2 = getPreferenceStrength(pref2.type);
  
  if (strength1 > strength2 && pref1.preferredColor) {
    return pref1.preferredColor === 'W';
  }
  
  if (strength2 > strength1 && pref2.preferredColor) {
    return pref2.preferredColor === 'B';
  }
  
  // If both absolute (topscorers), grant wider color difference
  if (pref1.type === 'absolute' && pref2.type === 'absolute') {
    const absDiff1 = Math.abs(pref1.colorDifference);
    const absDiff2 = Math.abs(pref2.colorDifference);
    
    if (absDiff1 > absDiff2 && pref1.preferredColor) {
      return pref1.preferredColor === 'W';
    }
    if (absDiff2 > absDiff1 && pref2.preferredColor) {
      return pref2.preferredColor === 'B';
    }
  }
  
  // E.3 - Alternate from most recent common color
  // Find most recent round where one had W and other had B
  const result = findMostRecentAlternation(player1, player2);
  if (result !== null) {
    return result;
  }
  
  // E.4 - Grant higher ranked player's preference
  if (player1.bsn < player2.bsn && pref1.preferredColor) {
    return pref1.preferredColor === 'W';
  }
  if (player2.bsn < player1.bsn && pref2.preferredColor) {
    return pref2.preferredColor === 'B';
  }
  
  // E.5 - Use initial-color with pairing number
  // Odd pairing number gets initial color, even gets opposite
  const player1PairingNumber = player1.id;
  const isOdd = player1PairingNumber % 2 === 1;
  
  if (isOdd) {
    return initialColor === 'W';
  } else {
    return initialColor === 'B';
  }
}

/**
 * Get numerical strength of preference type
 */
function getPreferenceStrength(type: ColorPreferenceType): number {
  switch (type) {
    case 'absolute': return 3;
    case 'strong': return 2;
    case 'mild': return 1;
    case 'none': return 0;
  }
}

/**
 * Find most recent round where players had opposite colors
 * Rule E.3 with C.04.2:D.5 (skip unplayed games)
 */
function findMostRecentAlternation(
  player1: BracketPlayer,
  player2: BracketPlayer
): boolean | null {
  const history1 = player1.colorHistory.filter(c => c !== 'BYE');
  const history2 = player2.colorHistory.filter(c => c !== 'BYE');
  
  const minLength = Math.min(history1.length, history2.length);
  
  // Search from most recent to oldest
  for (let i = minLength - 1; i >= 0; i--) {
    const color1 = history1[history1.length - 1 - i];
    const color2 = history2[history2.length - 1 - i];
    
    if (color1 === 'W' && color2 === 'B') {
      // Player1 had white, alternate -> player1 gets black
      return false;
    }
    if (color1 === 'B' && color2 === 'W') {
      // Player1 had black, alternate -> player1 gets white
      return true;
    }
  }
  
  return null;
}

// ============================================================================
// COLOR PREFERENCE COUNTING
// ============================================================================

/**
 * Count color preferences in a group of players
 */
export interface PreferenceCount {
  whitePreference: number;
  blackPreference: number;
  noPreference: number;
  absoluteWhite: number;
  absoluteBlack: number;
  strongWhite: number;
  strongBlack: number;
  mildWhite: number;
  mildBlack: number;
}

export function countColorPreferences(players: BracketPlayer[]): PreferenceCount {
  const count: PreferenceCount = {
    whitePreference: 0,
    blackPreference: 0,
    noPreference: 0,
    absoluteWhite: 0,
    absoluteBlack: 0,
    strongWhite: 0,
    strongBlack: 0,
    mildWhite: 0,
    mildBlack: 0,
  };
  
  for (const player of players) {
    const pref = player.colorPreference;
    
    if (pref.preferredColor === 'W') {
      count.whitePreference++;
      if (pref.type === 'absolute') count.absoluteWhite++;
      else if (pref.type === 'strong') count.strongWhite++;
      else if (pref.type === 'mild') count.mildWhite++;
    } else if (pref.preferredColor === 'B') {
      count.blackPreference++;
      if (pref.type === 'absolute') count.absoluteBlack++;
      else if (pref.type === 'strong') count.strongBlack++;
      else if (pref.type === 'mild') count.mildBlack++;
    } else {
      count.noPreference++;
    }
  }
  
  return count;
}

/**
 * Calculate theoretical minimum disregarded preferences
 * Rule C.10 formula: x = max(0, MaxPairs - n - a)
 */
export function calculateMinimumDisregardedPreferences(
  maxPairs: number,
  minorityColorCount: number,
  noPreferenceCount: number
): number {
  return Math.max(0, maxPairs - minorityColorCount - noPreferenceCount);
}


/**
 * FIDE Swiss Pairing System
 * Complete implementation of FIDE Handbook C.04 (Dutch System - Baku 2016)
 * 
 * @module fide-swiss-pairing
 * @author Bounty Chess Tournament System
 * @version 1.0.0
 */

// ============================================================================
// MAIN API
// ============================================================================

export {
  pairRound,
  pairRound1Alphabetical,
  quickPair,
  validatePairing,
} from './pairing-engine';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  Color,
  ColorPreference,
  ColorPreferenceType,
  BracketPlayer,
  Bracket,
  Subgroups,
  Pair,
  FloatHistory,
  PairingScoreDifference,
  CandidatePariring,
  PairingConstraints,
  PairingResult,
  Transposition,
  Exchange,
  MDPExchange,
} from './types';

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

// Color utilities
export {
  getColorPreference,
  determineColors,
  calculateColorDifference,
  areColorCompatible,
  countColorPreferences,
  calculateMinimumDisregardedPreferences,
} from './color-utils';

// PSD utilities
export {
  calculatePSD,
  comparePSD,
  calculatePlayerPoints,
  getMinBracketScore,
  formatPSD,
  isPerfectPSD,
  groupPlayersByScore,
  getScoresDescending,
} from './psd-utils';

// Float utilities
export {
  initializeFloatHistory,
  hadDownfloatInRound,
  hadUpfloatInRound,
  getFloatProtection,
  calculateFloatPenalty,
  isDoubleFloater,
  countTotalFloats,
  formatFloatHistory,
} from './float-utils';

// Transposition utilities
export {
  generateAllTranspositions,
  transpositionGenerator,
  applyTransposition,
  isTranspositionMeaningful,
  countTranspositions,
  formatTransposition,
  generateExampleTranspositions,
} from './transpositions';

// Exchange utilities
export {
  generateResidentExchanges,
  generateMDPExchanges,
  applyResidentExchange,
  applyMDPExchange,
  countResidentExchanges,
  countMDPExchanges,
  formatResidentExchange,
  formatMDPExchange,
  describeExchangeEffect,
} from './exchanges';

// Bracket pairing utilities
export {
  calculateBracketParameters,
  divideIntoSubgroups,
  prepareCandidate,
  isPerfectCandidate,
  findBestPairing,
} from './bracket-pairing';

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '1.0.0';
export const FIDE_RULES_VERSION = 'C.04 (Baku 2016)';
export const SYSTEM_NAME = 'Dutch System';

// ============================================================================
// QUICK START EXAMPLE
// ============================================================================

/**
 * Quick Start Example:
 * 
 * ```typescript
 * import { pairRound } from './lib/fide-swiss-pairing';
 * 
 * const players = [...]; // Your Player[] array
 * const roundNumber = 5;
 * const totalRounds = 9;
 * 
 * const result = pairRound(players, roundNumber, totalRounds);
 * 
 * if (result.success) {
 *   console.log(`Generated ${result.games.length} games`);
 *   // Use result.games in your tournament
 * } else {
 *   console.error('Pairing failed:', result.method);
 * }
 * ```
 * 
 * For Round 1 (alphabetical pairing):
 * 
 * ```typescript
 * import { pairRound1Alphabetical } from './lib/fide-swiss-pairing';
 * 
 * const result = pairRound1Alphabetical(players);
 * ```
 */


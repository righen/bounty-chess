/**
 * FIDE Swiss Pairing System - Type Definitions
 * Based on FIDE Handbook C.04 (Dutch System - Baku 2016)
 */

import { Player, Game } from '@/types';

// ============================================================================
// COLOR TYPES
// ============================================================================

export type Color = 'W' | 'B' | 'BYE';

export type ColorPreferenceType = 'absolute' | 'strong' | 'mild' | 'none';

export interface ColorPreference {
  type: ColorPreferenceType;
  preferredColor: 'W' | 'B' | null;
  colorDifference: number; // Whites - Blacks
  lastColor: Color | null;
  lastTwoColors: [Color | null, Color | null]; // [second-last, last]
}

// ============================================================================
// FLOAT TRACKING
// ============================================================================

export interface FloatHistory {
  downfloats: number[]; // Round numbers where player floated down
  upfloats: number[]; // Round numbers where player floated up
}

// ============================================================================
// PAIRING TYPES
// ============================================================================

export interface BracketPlayer extends Player {
  bsn: number; // Bracket Sequence Number
  colorPreference: ColorPreference;
  floatHistory: FloatHistory;
  isTopscorer: boolean;
}

export interface Pair {
  whitePlayer: BracketPlayer;
  blackPlayer: BracketPlayer;
  scoreDefference: number;
}

export interface Bracket {
  residentScore: number;
  residentPlayers: BracketPlayer[];
  mdps: BracketPlayer[]; // Moved-Down Players from previous bracket
  isHomogeneous: boolean;
  isHeterogeneous: boolean;
}

export interface Subgroups {
  s1: BracketPlayer[];
  s2: BracketPlayer[];
  limbo: BracketPlayer[];
}

// ============================================================================
// PAIRING SCORE DIFFERENCE (PSD)
// ============================================================================

export interface ScoreDifference {
  value: number;
  isPair: boolean; // true if from pair, false if from downfloater
  playerId?: number;
}

export type PairingScoreDifference = ScoreDifference[];

// ============================================================================
// CANDIDATE PAIRING
// ============================================================================

export interface CandidatePariring {
  pairs: Pair[];
  downfloaters: BracketPlayer[];
  psd: PairingScoreDifference;
  
  // Quality metrics for comparison
  qualityMetrics: {
    numberOfPairs: number;
    psd: PairingScoreDifference;
    disregardedPreferences: number;
    disregardedStrongPreferences: number;
    topscorersWithCDViolation: number;
    topscorersWithThreeInRow: number;
    repeatedDownfloats: number;
    repeatedUpfloats: number;
  };
}

// ============================================================================
// PAIRING CONSTRAINTS
// ============================================================================

export interface PairingConstraints {
  playedOpponents: Map<number, Set<number>>; // player ID -> opponent IDs
  receivedBye: Set<number>; // player IDs who received BYE
  receivedForfeitWin: Set<number>; // player IDs who received forfeit win
}

// ============================================================================
// PAIRING RESULT
// ============================================================================

export interface PairingResult {
  games: Game[];
  success: boolean;
  method: 'normal' | 'ppb-clb' | 'impossible';
  diagnostics?: {
    brackets: number;
    transpositions: number;
    exchanges: number;
    candidatesEvaluated: number;
  };
}

// ============================================================================
// TRANSPOSITION / EXCHANGE
// ============================================================================

export interface Transposition {
  newOrder: number[]; // New BSN order for S2
  affectedIndices: number[]; // Which positions changed
}

export interface Exchange {
  s1Indices: number[]; // BSNs moving from S1 to S2
  s2Indices: number[]; // BSNs moving from S2 to S1
}

export interface MDPExchange {
  s1Indices: number[]; // BSNs moving from S1 to Limbo
  limboIndices: number[]; // BSNs moving from Limbo to S1
}


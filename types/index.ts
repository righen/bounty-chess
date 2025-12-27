export type Gender = 'M' | 'F';

export type CriminalStatus = 'normal' | 'angry' | 'mad';

export type GameResult = 'white' | 'black' | 'draw';

export interface Player {
  id: number;
  name: string;
  surname: string;
  birthdate: string; // DD/MM/YYYY
  currentAddress: string;
  meal: string;
  paymentProof: string;
  transferName: string;
  
  // Calculated fields
  age: number;
  gender: Gender;
  
  // Game state
  bounty: number;
  hasSheriffBadge: boolean;
  criminalStatus: CriminalStatus;
  wins: number;
  losses: number;
  draws: number;
  
  // Pairing tracking
  opponentIds: number[];
}

export interface SheriffUsage {
  white: boolean;
  black: boolean;
}

export interface Game {
  id: string;
  roundNumber: number;
  whitePlayerId: number;
  blackPlayerId: number;
  result: GameResult | null;
  sheriffUsage: SheriffUsage;
  bountyTransfer: number; // Amount transferred from loser to winner
  completed: boolean;
}

export interface Round {
  number: number;
  games: Game[];
  completed: boolean;
}

export interface TournamentState {
  players: Player[];
  rounds: Round[];
  currentRound: number;
  totalRounds: number;
  tournamentStarted: boolean;
}


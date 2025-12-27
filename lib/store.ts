import { TournamentState, Player, Round, Game, GameResult, SheriffUsage } from '@/types';
import { generateSwissPairings } from './pairing';
import { calculateBountyTransfer } from './bounty';

const STORAGE_KEY = 'bounty-tournament-state';

/**
 * Load tournament state from localStorage
 */
export function loadTournamentState(): TournamentState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading tournament state:', error);
    return null;
  }
}

/**
 * Save tournament state to localStorage
 */
export function saveTournamentState(state: TournamentState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving tournament state:', error);
  }
}

/**
 * Initialize new tournament with players
 */
export function initializeTournament(players: Player[]): TournamentState {
  return {
    players,
    rounds: [],
    currentRound: 0,
    totalRounds: 9,
    tournamentStarted: false,
  };
}

/**
 * Start a new round
 */
export function startNewRound(state: TournamentState): TournamentState {
  const newRoundNumber = state.currentRound + 1;
  
  // Generate pairings
  const games = generateSwissPairings(state.players, newRoundNumber);
  
  const newRound: Round = {
    number: newRoundNumber,
    games,
    completed: false,
  };
  
  return {
    ...state,
    rounds: [...state.rounds, newRound],
    currentRound: newRoundNumber,
  };
}

/**
 * Submit game result
 */
export function submitGameResult(
  state: TournamentState,
  gameId: string,
  result: GameResult,
  sheriffUsage: SheriffUsage
): TournamentState {
  const roundIndex = state.rounds.findIndex(r => 
    r.games.some(g => g.id === gameId)
  );
  
  if (roundIndex === -1) {
    throw new Error('Game not found');
  }
  
  const round = state.rounds[roundIndex];
  const gameIndex = round.games.findIndex(g => g.id === gameId);
  const game = round.games[gameIndex];
  
  // Get players
  const whitePlayer = state.players.find(p => p.id === game.whitePlayerId);
  const blackPlayer = game.blackPlayerId === 0 ? null : state.players.find(p => p.id === game.blackPlayerId);
  
  // Handle BYE game (blackPlayerId === 0)
  if (game.blackPlayerId === 0) {
    if (!whitePlayer) {
      throw new Error('Player not found');
    }
    
    // Bye game is already marked as completed with white win
    // Just update the player's wins
    const updatedPlayers = state.players.map(p => {
      if (p.id === whitePlayer.id) {
        return {
          ...p,
          wins: p.wins + 1,
        };
      }
      return p;
    });
    
    const updatedRounds = [...state.rounds];
    updatedRounds[roundIndex] = {
      ...round,
      games: round.games,
      completed: round.games.every(g => g.completed),
    };
    
    const newState = {
      ...state,
      players: updatedPlayers,
      rounds: updatedRounds,
    };
    
    saveTournamentState(newState);
    return newState;
  }
  
  if (!whitePlayer || !blackPlayer) {
    throw new Error('Players not found');
  }
  
  // Calculate bounty transfer
  let bountyCalc;
  if (result === 'draw') {
    bountyCalc = {
      bountyTransfer: 0,
      winnerBountyChange: 0,
      loserBountyChange: 0,
      winnerCriminalStatus: whitePlayer.criminalStatus,
      loserCriminalStatus: blackPlayer.criminalStatus,
    };
  } else {
    const winner = result === 'white' ? whitePlayer : blackPlayer;
    const loser = result === 'white' ? blackPlayer : whitePlayer;
    
    bountyCalc = calculateBountyTransfer(
      winner,
      loser,
      sheriffUsage,
      round.number,
      result
    );
  }
  
  // Update game
  const updatedGame: Game = {
    ...game,
    result,
    sheriffUsage,
    bountyTransfer: bountyCalc.bountyTransfer,
    completed: true,
  };
  
  // Update players
  const updatedPlayers = state.players.map(p => {
    if (p.id === whitePlayer.id) {
      const updates: Partial<Player> = {
        opponentIds: [...p.opponentIds, blackPlayer.id],
      };
      
      if (result === 'white') {
        updates.wins = p.wins + 1;
        updates.bounty = p.bounty + bountyCalc.winnerBountyChange;
        updates.criminalStatus = bountyCalc.winnerCriminalStatus;
      } else if (result === 'black') {
        updates.losses = p.losses + 1;
        updates.bounty = p.bounty + bountyCalc.loserBountyChange;
        updates.criminalStatus = bountyCalc.loserCriminalStatus;
      } else {
        updates.draws = p.draws + 1;
      }
      
      // Remove sheriff badge if used
      if (sheriffUsage.white && p.hasSheriffBadge) {
        updates.hasSheriffBadge = false;
      }
      
      return { ...p, ...updates };
    }
    
    if (p.id === blackPlayer.id) {
      const updates: Partial<Player> = {
        opponentIds: [...p.opponentIds, whitePlayer.id],
      };
      
      if (result === 'black') {
        updates.wins = p.wins + 1;
        updates.bounty = p.bounty + bountyCalc.winnerBountyChange;
        updates.criminalStatus = bountyCalc.winnerCriminalStatus;
      } else if (result === 'white') {
        updates.losses = p.losses + 1;
        updates.bounty = p.bounty + bountyCalc.loserBountyChange;
        updates.criminalStatus = bountyCalc.loserCriminalStatus;
      } else {
        updates.draws = p.draws + 1;
      }
      
      // Remove sheriff badge if used
      if (sheriffUsage.black && p.hasSheriffBadge) {
        updates.hasSheriffBadge = false;
      }
      
      return { ...p, ...updates };
    }
    
    return p;
  });
  
  // Update round
  const updatedGames = [...round.games];
  updatedGames[gameIndex] = updatedGame;
  
  const updatedRound: Round = {
    ...round,
    games: updatedGames,
    completed: updatedGames.every(g => g.completed),
  };
  
  const updatedRounds = [...state.rounds];
  updatedRounds[roundIndex] = updatedRound;
  
  const newState = {
    ...state,
    players: updatedPlayers,
    rounds: updatedRounds,
  };
  
  saveTournamentState(newState);
  return newState;
}

/**
 * Export tournament data as JSON
 */
export function exportTournamentData(state: TournamentState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Import tournament data from JSON
 */
export function importTournamentData(jsonData: string): TournamentState {
  return JSON.parse(jsonData);
}

/**
 * Clear tournament data
 */
export function clearTournamentData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}


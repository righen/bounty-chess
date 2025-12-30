import { supabase } from './supabase';
import { calculateBountyTransfer, BountyCalculationResult } from './bounty';
import { Player } from '@/types';
import { Game } from './tournament-rounds';
import { getTournamentRegistrations, RegistrationWithPlayer } from './registration-store';

export interface GameResultInput {
  result: 'white_win' | 'black_win' | 'draw' | 'forfeit_white' | 'forfeit_black';
  whiteSheriffUsed: boolean;
  blackSheriffUsed: boolean;
  notes?: string;
}

/**
 * Submit game result and update all related data
 */
export async function submitGameResult(
  tournamentId: string,
  gameId: string,
  input: GameResultInput
): Promise<void> {
  try {
    // 1. Get game and players
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;
    if (!game) throw new Error('Game not found');

    // 2. Get player registrations
    const registrations = await getTournamentRegistrations(tournamentId);
    const whiteReg = registrations.find(r => r.player_id === game.white_player_id);
    const blackReg = game.black_player_id
      ? registrations.find(r => r.player_id === game.black_player_id)
      : null;

    if (!whiteReg) throw new Error('White player not found');
    if (!blackReg && game.black_player_id) throw new Error('Black player not found');

    // 3. Convert registrations to Player format for bounty calculation
    const whitePlayer = registrationToPlayer(whiteReg);
    const blackPlayer = blackReg ? registrationToPlayer(blackReg) : null;

    // 4. Handle BYE games
    if (!blackPlayer || game.black_player_id === null) {
      // BYE game - auto win for white
      await supabase
        .from('games')
        .update({
          result: 'bye',
          completed: true,
          entered_at: new Date().toISOString(),
        })
        .eq('id', gameId);

      // Update white player registration
      const regAny = whiteReg as any;
      await supabase
        .from('tournament_registrations')
        .update({
          wins: (regAny.wins || 0) + 1,
          color_history: [...(regAny.color_history || []), 'BYE'],
          updated_at: new Date().toISOString(),
        })
        .eq('id', whiteReg.id);

      return;
    }

    // 5. Convert result to GameResult format
    let gameResult: 'white' | 'black' | 'draw';
    if (input.result === 'white_win' || input.result === 'forfeit_white') {
      gameResult = 'white';
    } else if (input.result === 'black_win' || input.result === 'forfeit_black') {
      gameResult = 'black';
    } else {
      gameResult = 'draw';
    }

    // 6. Calculate bounty transfer
    let bountyCalc: BountyCalculationResult;
    if (gameResult === 'draw') {
      bountyCalc = {
        bountyTransfer: 0,
        winnerBountyChange: 0,
        loserBountyChange: 0,
        winnerCriminalStatus: whitePlayer.criminalStatus,
        loserCriminalStatus: blackPlayer.criminalStatus,
      };
    } else {
      const winner = gameResult === 'white' ? whitePlayer : blackPlayer;
      const loser = gameResult === 'white' ? blackPlayer : whitePlayer;

      bountyCalc = calculateBountyTransfer(
        winner,
        loser,
        {
          white: input.whiteSheriffUsed,
          black: input.blackSheriffUsed,
        },
        game.round_number,
        gameResult
      );
    }

    // 7. Update game
    await supabase
      .from('games')
      .update({
        result: input.result,
        white_sheriff_used: input.whiteSheriffUsed,
        black_sheriff_used: input.blackSheriffUsed,
        bounty_transferred: bountyCalc.bountyTransfer,
        completed: true,
        entered_at: new Date().toISOString(),
        result_notes: input.notes || null,
      })
      .eq('id', gameId);

    // 8. Update white player registration
    const whiteRegAny = whiteReg as any;
    const whiteUpdates: any = {
      color_history: [...(whiteRegAny.color_history || []), 'W'],
      opponent_ids: [...new Set([...(whiteRegAny.opponent_ids || []), blackPlayer.id])],
      updated_at: new Date().toISOString(),
    };

    if (gameResult === 'white') {
      whiteUpdates.wins = (whiteRegAny.wins || 0) + 1;
      whiteUpdates.current_bounty = (whiteRegAny.current_bounty || 0) + bountyCalc.winnerBountyChange;
      whiteUpdates.criminal_status = bountyCalc.winnerCriminalStatus;
      if (input.whiteSheriffUsed) {
        whiteUpdates.has_sheriff_badge = false;
      }
    } else if (gameResult === 'black') {
      whiteUpdates.losses = (whiteRegAny.losses || 0) + 1;
      whiteUpdates.current_bounty = (whiteRegAny.current_bounty || 0) + bountyCalc.loserBountyChange;
      whiteUpdates.criminal_status = bountyCalc.loserCriminalStatus;
      if (input.whiteSheriffUsed) {
        whiteUpdates.has_sheriff_badge = false;
      }
    } else {
      whiteUpdates.draws = (whiteRegAny.draws || 0) + 1;
    }

    await supabase
      .from('tournament_registrations')
      .update(whiteUpdates)
      .eq('id', whiteReg.id);

    // 9. Update black player registration
    if (blackReg) {
      const blackRegAny = blackReg as any;
      const blackUpdates: any = {
        color_history: [...(blackRegAny.color_history || []), 'B'],
        opponent_ids: [...new Set([...(blackRegAny.opponent_ids || []), whitePlayer.id])],
        updated_at: new Date().toISOString(),
      };

      if (gameResult === 'black') {
        blackUpdates.wins = (blackRegAny.wins || 0) + 1;
        blackUpdates.current_bounty = (blackRegAny.current_bounty || 0) + bountyCalc.winnerBountyChange;
        blackUpdates.criminal_status = bountyCalc.winnerCriminalStatus;
        if (input.blackSheriffUsed) {
          blackUpdates.has_sheriff_badge = false;
        }
      } else if (gameResult === 'white') {
        blackUpdates.losses = (blackRegAny.losses || 0) + 1;
        blackUpdates.current_bounty = (blackRegAny.current_bounty || 0) + bountyCalc.loserBountyChange;
        blackUpdates.criminal_status = bountyCalc.loserCriminalStatus;
        if (input.blackSheriffUsed) {
          blackUpdates.has_sheriff_badge = false;
        }
      } else {
        blackUpdates.draws = (blackRegAny.draws || 0) + 1;
      }

      await supabase
        .from('tournament_registrations')
        .update(blackUpdates)
        .eq('id', blackReg.id);
    }

    // 10. Check if round is complete and update if needed
    await checkAndCompleteRound(tournamentId, game.round_number);
  } catch (error) {
    console.error('Error submitting game result:', error);
    throw error;
  }
}

/**
 * Convert RegistrationWithPlayer to Player format
 */
function registrationToPlayer(reg: RegistrationWithPlayer): Player {
  const regAny = reg as any;
  return {
    id: reg.player_id,
    name: reg.player.name,
    surname: reg.player.surname,
    birthdate: reg.player.birthdate || '',
    currentAddress: reg.player.phone || '',
    meal: '',
    paymentProof: '',
    transferName: '',
    age: reg.player.age || 0,
    gender: (reg.player.gender as 'M' | 'F') || 'M',
    bounty: regAny.current_bounty || 0,
    hasSheriffBadge: regAny.has_sheriff_badge || false,
    criminalStatus: (regAny.criminal_status as 'normal' | 'angry' | 'mad') || 'normal',
    wins: regAny.wins || 0,
    losses: regAny.losses || 0,
    draws: regAny.draws || 0,
    opponentIds: regAny.opponent_ids || [],
    colorHistory: (regAny.color_history as ('W' | 'B' | 'BYE')[]) || [],
  };
}

/**
 * Check if round is complete and mark it if so
 */
async function checkAndCompleteRound(tournamentId: string, roundNumber: number): Promise<void> {
  const { data: games, error } = await supabase
    .from('games')
    .select('completed')
    .eq('tournament_id', tournamentId)
    .eq('round_number', roundNumber);

  if (error) {
    console.error('Error checking round completion:', error);
    return;
  }

  const allCompleted = games?.every(g => g.completed) || false;

  if (allCompleted) {
    await supabase
      .from('rounds')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('tournament_id', tournamentId)
      .eq('round_number', roundNumber);
  }
}

/**
 * Get game with player details for result entry
 */
export async function getGameForResultEntry(gameId: string): Promise<{
  game: Game;
  whitePlayer: RegistrationWithPlayer;
  blackPlayer: RegistrationWithPlayer | null;
} | null> {
  try {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) return null;

    const registrations = await getTournamentRegistrations(game.tournament_id);
    const whitePlayer = registrations.find(r => r.player_id === game.white_player_id);
    const blackPlayer = game.black_player_id
      ? registrations.find(r => r.player_id === game.black_player_id)
      : null;

    if (!whitePlayer) return null;

    return {
      game: game as Game,
      whitePlayer,
      blackPlayer: blackPlayer || null,
    };
  } catch (error) {
    console.error('Error getting game for result entry:', error);
    return null;
  }
}


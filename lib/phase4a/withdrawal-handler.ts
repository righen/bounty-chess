/**
 * Phase 4A: Player Withdrawal Handling
 * FIDE Rules: C.04.2 Article C (Implicit)
 * 
 * Handles:
 * - Mid-tournament withdrawals
 * - Affected game resolution
 * - Opponent forfeit wins
 * - Stop future pairings
 */

import { Game, Player } from '@/types';
import {
  WithdrawalData,
  WithdrawnPlayer,
  WithdrawalResult,
  WithdrawalReason,
} from './types';
import { ForfeitResult, handleNoShow } from './forfeit-handler';

// ============================================================================
// WITHDRAWAL VALIDATION
// ============================================================================

/**
 * Validate withdrawal request
 */
export function validateWithdrawal(
  player: Player,
  currentRound: number,
  withdrawalRound: number
): { valid: boolean; error?: string } {
  // Already withdrawn
  if ((player as any).withdrawn) {
    return {
      valid: false,
      error: 'Player is already withdrawn',
    };
  }
  
  // Withdrawal round must be current or past
  if (withdrawalRound > currentRound) {
    return {
      valid: false,
      error: 'Cannot withdraw from future round',
    };
  }
  
  // Withdrawal round must be >= 1
  if (withdrawalRound < 1) {
    return {
      valid: false,
      error: 'Invalid withdrawal round',
    };
  }
  
  return { valid: true };
}

// ============================================================================
// WITHDRAWAL PROCESSING
// ============================================================================

/**
 * Process player withdrawal
 * Marks player as withdrawn and handles all affected games
 */
export function processWithdrawal(
  player: Player,
  withdrawalData: WithdrawalData,
  upcomingGames: Game[],
  currentRoundGame: Game | null
): WithdrawalResult {
  // Create withdrawn player
  const withdrawnPlayer: WithdrawnPlayer = {
    ...player,
    withdrawn: true,
    withdrawnAfterRound: withdrawalData.withdrawnAfterRound,
    withdrawalReason: withdrawalData.reason,
  };
  
  const affectedGames: Game[] = [];
  
  // Handle current round game (if exists and not completed)
  if (currentRoundGame && !currentRoundGame.completed) {
    affectedGames.push({
      ...currentRoundGame,
      completed: true,
      result: currentRoundGame.whitePlayerId === player.id ? 'black' : 'white',
      bountyTransfer: 0,
      sheriffUsage: {
        white: false,
        black: false,
      },
    });
  }
  
  // Mark all future games as forfeits
  for (const game of upcomingGames) {
    if (!game.completed) {
      affectedGames.push({
        ...game,
        completed: true,
        result: game.whitePlayerId === player.id ? 'black' : 'white',
        bountyTransfer: 0,
        sheriffUsage: {
          white: false,
          black: false,
        },
      });
    }
  }
  
  return {
    success: true,
    player: withdrawnPlayer,
    affectedGames,
  };
}

/**
 * Handle withdrawal before round starts
 * Simpler case - no current game to forfeit
 */
export function processWithdrawalBeforeRound(
  player: Player,
  withdrawalData: WithdrawalData
): WithdrawalResult {
  return processWithdrawal(player, withdrawalData, [], null);
}

/**
 * Handle withdrawal during round
 * Must forfeit current game
 */
export function processWithdrawalDuringRound(
  player: Player,
  withdrawalData: WithdrawalData,
  currentGame: Game,
  upcomingGames: Game[]
): WithdrawalResult {
  return processWithdrawal(player, withdrawalData, upcomingGames, currentGame);
}

// ============================================================================
// AFFECTED GAMES RESOLUTION
// ============================================================================

/**
 * Resolve all games affected by withdrawal
 * Awards forfeit wins to opponents
 */
export function resolveWithdrawalGames(
  withdrawnPlayer: Player,
  games: Game[]
): Game[] {
  return games.map(game => {
    // Skip completed games
    if (game.completed) {
      return game;
    }
    
    // Determine winner (opponent of withdrawn player)
    const winner = game.whitePlayerId === withdrawnPlayer.id ? 'black' : 'white';
    
    return {
      ...game,
      completed: true,
      result: winner,
      bountyTransfer: 0, // No bounty on withdrawal forfeit
      sheriffUsage: {
        white: false,
        black: false,
      },
    };
  });
}

// ============================================================================
// PAIRING INTEGRATION
// ============================================================================

/**
 * Filter out withdrawn players from pairing
 */
export function filterWithdrawnPlayers(players: Player[]): Player[] {
  return players.filter(p => !(p as any).withdrawn);
}

/**
 * Check if player is withdrawn
 */
export function isPlayerWithdrawn(player: Player): boolean {
  return (player as any).withdrawn === true;
}

/**
 * Get active players for pairing (excludes withdrawn)
 */
export function getActivePlayers(players: Player[]): Player[] {
  return filterWithdrawnPlayers(players);
}

// ============================================================================
// WITHDRAWAL STATISTICS
// ============================================================================

export interface WithdrawalStats {
  totalWithdrawals: number;
  byRound: Map<number, number>;
  byReason: Map<WithdrawalReason, number>;
  averageWithdrawalRound: number;
}

export function calculateWithdrawalStats(players: Player[]): WithdrawalStats {
  const withdrawn = players.filter(p => (p as any).withdrawn);
  
  const byRound = new Map<number, number>();
  const byReason = new Map<WithdrawalReason, number>();
  let totalWithdrawalRound = 0;
  
  for (const player of withdrawn) {
    const withdrawalRound = (player as any).withdrawnAfterRound;
    const reason: WithdrawalReason = (player as any).withdrawalReason || 'other';
    
    byRound.set(withdrawalRound, (byRound.get(withdrawalRound) || 0) + 1);
    byReason.set(reason, (byReason.get(reason) || 0) + 1);
    totalWithdrawalRound += withdrawalRound;
  }
  
  return {
    totalWithdrawals: withdrawn.length,
    byRound,
    byReason,
    averageWithdrawalRound: withdrawn.length > 0 
      ? totalWithdrawalRound / withdrawn.length 
      : 0,
  };
}

// ============================================================================
// WITHDRAWAL REASONS
// ============================================================================

/**
 * Format withdrawal reason for display
 */
export function formatWithdrawalReason(reason: WithdrawalReason): string {
  const reasons: Record<WithdrawalReason, string> = {
    personal: 'Personal reasons',
    medical: 'Medical reasons',
    disqualification: 'Disqualified',
    no_show_multiple: 'Multiple no-shows',
    other: 'Other',
  };
  
  return reasons[reason] || 'Unknown';
}

/**
 * Get withdrawal reason severity (for UI color coding)
 */
export function getWithdrawalSeverity(reason: WithdrawalReason): 'low' | 'medium' | 'high' {
  switch (reason) {
    case 'personal':
    case 'medical':
      return 'low';
    case 'no_show_multiple':
      return 'medium';
    case 'disqualification':
      return 'high';
    default:
      return 'low';
  }
}

// ============================================================================
// REFUND / PRIZE ELIGIBILITY
// ============================================================================

/**
 * Check if withdrawn player is eligible for prize
 * Usually requires completing a minimum percentage of rounds
 */
export function isEligibleForPrize(
  withdrawnPlayer: WithdrawnPlayer,
  totalRounds: number,
  minimumRoundsRequired: number = Math.ceil(totalRounds * 0.5)
): boolean {
  // Must complete at least 50% of rounds (standard rule)
  return withdrawnPlayer.withdrawnAfterRound >= minimumRoundsRequired;
}

/**
 * Check if withdrawn player is eligible for entry fee refund
 * Usually only if withdrawal is before tournament starts or in Round 1
 */
export function isEligibleForRefund(
  withdrawnPlayer: WithdrawnPlayer,
  refundDeadlineRound: number = 1
): boolean {
  return withdrawnPlayer.withdrawnAfterRound <= refundDeadlineRound;
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Format withdrawal info for display
 */
export function formatWithdrawalInfo(player: WithdrawnPlayer): string {
  return `Withdrawn after Round ${player.withdrawnAfterRound} (${formatWithdrawalReason(player.withdrawalReason as WithdrawalReason)})`;
}

/**
 * Get withdrawal badge color based on reason
 */
export function getWithdrawalBadgeColor(reason: WithdrawalReason): string {
  const severity = getWithdrawalSeverity(reason);
  
  switch (severity) {
    case 'low':
      return 'gray';
    case 'medium':
      return 'yellow';
    case 'high':
      return 'red';
  }
}

/**
 * Create withdrawal notification message
 */
export function createWithdrawalNotification(
  player: WithdrawnPlayer,
  affectedOpponents: Player[]
): string {
  const opponentNames = affectedOpponents
    .map(p => `${p.name} ${p.surname}`)
    .join(', ');
  
  return `${player.name} ${player.surname} has withdrawn after Round ${player.withdrawnAfterRound}. ` +
    (affectedOpponents.length > 0 
      ? `Forfeit wins awarded to: ${opponentNames}.`
      : '');
}


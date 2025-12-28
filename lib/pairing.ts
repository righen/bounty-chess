import { Player, Game } from '@/types';

/**
 * Generate Swiss pairings based on bounty amounts
 * - Highest bounties play each other (modified Swiss - by bounty, not points)
 * - No repeat opponents (standard Swiss rule)
 * - Handle odd number of players with a bye
 * - Player with bye gets automatic win (1-0) but no bounty gain
 */
export function generateSwissPairings(
  players: Player[],
  roundNumber: number
): Game[] {
  const games: Game[] = [];
  
  // For Round 1, sort alphabetically (by surname, then name)
  // For subsequent rounds, sort by bounty (highest first), then by wins
  const sortedPlayers = [...players].sort((a, b) => {
    if (roundNumber === 1) {
      // Alphabetical by surname, then name
      const surnameCompare = a.surname.localeCompare(b.surname);
      if (surnameCompare !== 0) return surnameCompare;
      return a.name.localeCompare(b.name);
    } else {
      // By bounty, then wins
      if (b.bounty !== a.bounty) {
        return b.bounty - a.bounty;
      }
      return b.wins - a.wins;
    }
  });

  const paired = new Set<number>();
  
  for (let i = 0; i < sortedPlayers.length; i++) {
    const player1 = sortedPlayers[i];
    
    // Skip if already paired
    if (paired.has(player1.id)) continue;
    
    // Find best opponent
    let opponent: Player | null = null;
    
    for (let j = i + 1; j < sortedPlayers.length; j++) {
      const player2 = sortedPlayers[j];
      
      // Skip if already paired
      if (paired.has(player2.id)) continue;
      
      // Skip if they've played before
      if (player1.opponentIds.includes(player2.id)) continue;
      
      opponent = player2;
      break;
    }
    
    // If no valid opponent found, try to find any unpaired player they haven't faced
    if (!opponent) {
      for (const player2 of sortedPlayers) {
        if (paired.has(player2.id)) continue;
        if (player2.id === player1.id) continue;
        if (player1.opponentIds.includes(player2.id)) continue;
        
        opponent = player2;
        break;
      }
    }
    
    // If still no opponent, player gets a BYE
    if (!opponent) {
      // Create a bye game (blackPlayerId = 0 indicates bye)
      games.push({
        id: `R${roundNumber}-${player1.id}-BYE`,
        roundNumber,
        whitePlayerId: player1.id,
        blackPlayerId: 0, // 0 indicates BYE
        result: 'white', // Automatic win for bye player
        sheriffUsage: {
          white: false,
          black: false,
        },
        bountyTransfer: 0, // No bounty gained from bye
        completed: true, // Bye games are auto-completed
      });
      paired.add(player1.id);
      continue;
    }
    
    // Create game
    paired.add(player1.id);
    paired.add(opponent.id);
    
    games.push({
      id: `R${roundNumber}-${player1.id}-${opponent.id}`,
      roundNumber,
      whitePlayerId: player1.id,
      blackPlayerId: opponent.id,
      result: null,
      sheriffUsage: {
        white: false,
        black: false,
      },
      bountyTransfer: 0,
      completed: false,
    });
  }
  
  return games;
}

/**
 * Validate that all pairings are legal
 */
export function validatePairings(games: Game[], players: Player[]): string[] {
  const errors: string[] = [];
  const playerMap = new Map(players.map(p => [p.id, p]));
  
  for (const game of games) {
    const white = playerMap.get(game.whitePlayerId);
    const black = playerMap.get(game.blackPlayerId);
    
    if (!white) {
      errors.push(`White player ${game.whitePlayerId} not found`);
      continue;
    }
    
    if (!black) {
      errors.push(`Black player ${game.blackPlayerId} not found`);
      continue;
    }
    
    // Check if they've played before
    if (white.opponentIds.includes(black.id)) {
      errors.push(`${white.name} and ${black.name} have already played`);
    }
  }
  
  return errors;
}

/**
 * Get player's current standing
 */
export function getPlayerStanding(player: Player): string {
  const totalGames = player.wins + player.losses + player.draws;
  return `${player.wins}-${player.losses}-${player.draws} (${totalGames} games)`;
}


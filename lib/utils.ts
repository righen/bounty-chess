import { Player, Gender } from '@/types';

/**
 * Calculate age from birthdate string (DD/MM/YYYY)
 */
export function calculateAge(birthdate: string): number {
  if (!birthdate) return 0;
  
  const parts = birthdate.split('/');
  if (parts.length !== 3) return 0;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);
  
  const birth = new Date(year, month, day);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Determine gender from first name (basic heuristic)
 * Can be overridden manually if needed
 */
export function guessGender(name: string): Gender {
  const femaleSuffixes = ['a', 'e', 'ah', 'ia', 'ya'];
  const femaleNames = ['meryl', 'loganatha', 'shanaya'];
  
  const lowerName = name.toLowerCase();
  
  if (femaleNames.includes(lowerName)) return 'F';
  
  for (const suffix of femaleSuffixes) {
    if (lowerName.endsWith(suffix)) return 'F';
  }
  
  return 'M';
}

/**
 * Parse CSV data into players
 */
export function parseCSV(csvText: string): Omit<Player, 'age' | 'gender' | 'bounty' | 'hasSheriffBadge' | 'criminalStatus' | 'wins' | 'losses' | 'draws' | 'opponentIds'>[] {
  // Handle both \n and \r\n line endings, and normalize spaces
  const lines = csvText.trim().split(/\r?\n/);
  const players: Omit<Player, 'age' | 'gender' | 'bounty' | 'hasSheriffBadge' | 'criminalStatus' | 'wins' | 'losses' | 'draws' | 'opponentIds'>[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma
    const fields = line.split(',').map(f => f.trim());
    
    // Need at least 8 fields (Transfer Name can be empty)
    if (fields.length < 8) continue;
    
    // Skip if first field is not a number (invalid ID)
    const id = parseInt(fields[0], 10);
    if (isNaN(id)) continue;
    
    players.push({
      id,
      name: fields[1] || '',
      surname: fields[2] || '',
      birthdate: fields[3] || '',
      currentAddress: fields[4] || '',
      meal: fields[5] || '',
      paymentProof: fields[6] || '',
      transferName: fields[7] || '',
    });
  }
  
  return players;
}

/**
 * Initialize players with game state
 */
export function initializePlayers(rawPlayers: Omit<Player, 'age' | 'gender' | 'bounty' | 'hasSheriffBadge' | 'criminalStatus' | 'wins' | 'losses' | 'draws' | 'opponentIds'>[]): Player[] {
  return rawPlayers.map(p => ({
    ...p,
    age: calculateAge(p.birthdate),
    gender: guessGender(p.name),
    bounty: 20,
    hasSheriffBadge: true,
    criminalStatus: 'normal' as const,
    wins: 0,
    losses: 0,
    draws: 0,
    opponentIds: [],
  }));
}

/**
 * Format bounty for display
 */
export function formatBounty(bounty: number): string {
  return `${bounty} ₱`;
}

export function getAgeCategory(age: number): { label: string; color: string; badgeClass: string } {
  if (age < 10) {
    return { label: 'U10', color: 'bg-blue-600 text-white', badgeClass: 'badge-accent' };
  } else if (age < 12) {
    return { label: 'U12', color: 'bg-cyan-600 text-white', badgeClass: 'badge-accent' };
  } else if (age < 16) {
    return { label: 'U16', color: 'bg-green-600 text-white', badgeClass: 'badge-success' };
  } else if (age < 18) {
    return { label: 'U18', color: 'bg-yellow-600 text-white', badgeClass: 'badge-warning' };
  } else {
    return { label: 'Adult', color: 'bg-gray-600 text-white', badgeClass: 'badge-primary' };
  }
}

/**
 * Get criminal status badge color
 */
export function getCriminalStatusColor(status: string): string {
  switch (status) {
    case 'normal':
      return 'bg-green-500';
    case 'angry':
      return 'bg-orange-500';
    case 'mad':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}


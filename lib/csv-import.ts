import { PlayerPoolInput } from './player-pool-store';
import { bulkImportPlayersToPool } from './player-pool-store';

/**
 * Parse date from DD/MM/YYYY format
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Handle DD/MM/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      
      if (day && month >= 0 && year) {
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
        }
      }
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
  }
  
  return null;
}

/**
 * Calculate age from birthdate
 */
function calculateAge(birthdate: string | null): number | null {
  if (!birthdate) return null;
  
  try {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
}

/**
 * Parse CSV file content and convert to PlayerPoolInput[]
 */
export function parseTournamentPlayersCSV(csvContent: string): PlayerPoolInput[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Find column indices
  const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
  const surnameIndex = headers.findIndex(h => h.toLowerCase() === 'surname');
  const birthdateIndex = headers.findIndex(h => h.toLowerCase().includes('birth'));
  const addressIndex = headers.findIndex(h => h.toLowerCase().includes('address'));
  const mealIndex = headers.findIndex(h => h.toLowerCase() === 'meal');

  if (nameIndex === -1 || surnameIndex === -1) {
    throw new Error('CSV must have "Name" and "Surname" columns');
  }

  const players: PlayerPoolInput[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV with quoted fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add last value

    const name = values[nameIndex]?.trim();
    const surname = values[surnameIndex]?.trim();

    if (!name || !surname) {
      continue; // Skip rows without name/surname
    }

    // Parse birthdate
    const birthdateStr = birthdateIndex >= 0 ? values[birthdateIndex]?.trim() : '';
    const birthdate = parseDate(birthdateStr);
    const age = calculateAge(birthdate);

    // Parse address (current_address column)
    const address = addressIndex >= 0 ? values[addressIndex]?.trim() : '';

    // Parse meal preference (we'll store in notes)
    const meal = mealIndex >= 0 ? values[mealIndex]?.trim() : '';
    const notes = meal ? `Meal preference: ${meal}` : '';

    const player: PlayerPoolInput = {
      name,
      surname,
      birthdate: birthdate || undefined,
      age: age || undefined,
      phone: address || undefined, // Using address field as phone/contact
      notes: notes || undefined,
      active: true,
      banned: false,
    };

    players.push(player);
  }

  return players;
}

/**
 * Import players from CSV file
 */
export async function importTournamentPlayersCSV(
  csvContent: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  try {
    const players = parseTournamentPlayersCSV(csvContent);
    
    if (players.length === 0) {
      return { success: 0, failed: 0, errors: ['No valid players found in CSV'] };
    }

    const result = await bulkImportPlayersToPool(players);
    
    return {
      success: result.success,
      failed: result.failed,
      errors: [],
    };
  } catch (error: any) {
    console.error('Error importing CSV:', error);
    return {
      success: 0,
      failed: 0,
      errors: [error.message || 'Failed to import CSV'],
    };
  }
}

/**
 * Load CSV file from public folder
 */
export async function loadCSVFromPublic(filename: string): Promise<string> {
  try {
    const response = await fetch(`/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load CSV file: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
}


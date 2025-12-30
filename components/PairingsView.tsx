'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { getRoundGames, Game } from '@/lib/tournament-rounds';
import { getTournamentRegistrations, RegistrationWithPlayer } from '@/lib/registration-store';
import { supabase } from '@/lib/supabase';
import ResultEntryDialog from './ResultEntryDialog';

interface PairingsViewProps {
  tournamentId: string;
  roundNumber: number;
}

export default function PairingsView({ tournamentId, roundNumber }: PairingsViewProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationWithPlayer[]>([]);
  const [playerNameCache, setPlayerNameCache] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tournamentId, roundNumber]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesData, registrationsData] = await Promise.all([
        getRoundGames(tournamentId, roundNumber),
        getTournamentRegistrations(tournamentId),
      ]);
      
      // Remove duplicate games - keep only the first occurrence of each unique pairing
      const uniqueGames = new Map<string, Game>();
      const seenPairings = new Set<string>();
      
      for (const game of gamesData) {
        // Create a unique key for each pairing (order-independent)
        const pairingKey = game.black_player_id === 0 || !game.black_player_id
          ? `BYE-${game.white_player_id}`
          : `${Math.min(game.white_player_id, game.black_player_id)}-${Math.max(game.white_player_id, game.black_player_id)}`;
        
        // Keep the first game we see for each pairing (prefer completed games if multiple exist)
        if (!seenPairings.has(pairingKey)) {
          seenPairings.add(pairingKey);
          uniqueGames.set(game.id, game);
        } else {
          // If we already have this pairing, check if the existing one is incomplete and this one is complete
          const existingGame = Array.from(uniqueGames.values()).find(g => {
            const existingKey = g.black_player_id === 0 || !g.black_player_id
              ? `BYE-${g.white_player_id}`
              : `${Math.min(g.white_player_id, g.black_player_id)}-${Math.max(g.white_player_id, g.black_player_id)}`;
            return existingKey === pairingKey;
          });
          
          if (existingGame && !existingGame.completed && game.completed) {
            // Replace incomplete game with completed one
            uniqueGames.delete(existingGame.id);
            uniqueGames.set(game.id, game);
          }
        }
      }
      
      // Sort games by ID to maintain consistent order
      const deduplicatedGames = Array.from(uniqueGames.values()).sort((a, b) => {
        // Sort by white player ID, then black player ID for consistent ordering
        if (a.white_player_id !== b.white_player_id) {
          return a.white_player_id - b.white_player_id;
        }
        const aBlack = a.black_player_id || 0;
        const bBlack = b.black_player_id || 0;
        return aBlack - bBlack;
      });
      
      setGames(deduplicatedGames);
      setRegistrations(registrationsData);
      
      // Build player name cache from registrations
      const cache = new Map<number, string>();
      registrationsData.forEach(reg => {
        const regAny = reg as any;
        const playerId = regAny.player_pool_id || regAny.player_id;
        if (playerId) {
          if (reg.player && reg.player.name && reg.player.surname) {
            cache.set(playerId, `${reg.player.name} ${reg.player.surname}`);
          } else if (regAny.player_name && regAny.player_surname) {
            cache.set(playerId, `${regAny.player_name} ${regAny.player_surname}`);
          }
        }
      });
      
      // For any player IDs in games that aren't in cache, try to query old players table
      const missingPlayerIds = new Set<number>();
      gamesData.forEach(game => {
        if (game.white_player_id && !cache.has(game.white_player_id)) {
          missingPlayerIds.add(game.white_player_id);
        }
        if (game.black_player_id && !cache.has(game.black_player_id)) {
          missingPlayerIds.add(game.black_player_id);
        }
      });
      
      if (missingPlayerIds.size > 0) {
        // Query old players table as fallback
        const { data: oldPlayers } = await supabase
          .from('players')
          .select('id, name, surname')
          .in('id', Array.from(missingPlayerIds));
        
        if (oldPlayers) {
          oldPlayers.forEach(p => {
            cache.set(p.id, `${p.name} ${p.surname}`);
          });
        }
      }
      
      setPlayerNameCache(cache);
    } catch (error) {
      console.error('Error loading pairings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResultDialog = (gameId: string) => {
    setSelectedGameId(gameId);
    setResultDialogOpen(true);
  };

  const handleCloseResultDialog = () => {
    setResultDialogOpen(false);
    setSelectedGameId(null);
  };

  const handleResultSubmitted = () => {
    loadData();
  };

  const getPlayerName = (playerId: number): string => {
    if (!playerId || playerId === 0) return 'BYE';
    
    // Check cache first
    if (playerNameCache.has(playerId)) {
      return playerNameCache.get(playerId)!;
    }
    
    // Try to find in registrations
    const reg = registrations.find(r => {
      const regAny = r as any;
      return (regAny.player_pool_id === playerId) || (regAny.player_id === playerId);
    });
    
    if (reg) {
      // Found registration - use player data or fallback to name/surname fields
      if (reg.player && reg.player.name && reg.player.surname) {
        const name = `${reg.player.name} ${reg.player.surname}`;
        playerNameCache.set(playerId, name);
        return name;
      }
      const regAny = reg as any;
      if (regAny.player_name && regAny.player_surname) {
        const name = `${regAny.player_name} ${regAny.player_surname}`;
        playerNameCache.set(playerId, name);
        return name;
      }
    }
    
    // Not found - return placeholder
    return `Player ${playerId}`;
  };

  const getPlayerBounty = (playerId: number): number => {
    const reg = registrations.find(r => {
      const regAny = r as any;
      return (regAny.player_pool_id === playerId) || (regAny.player_id === playerId);
    });
    if (!reg) return 0;
    const regAny = reg as any;
    return regAny.current_bounty || regAny.initial_bounty || 0;
  };

  const formatBounty = (amount: number): string => {
    if (amount === 0) return ''; // Don't show 0₱
    return `${amount}₱`;
  };

  const getResultLabel = (result: string | null): string => {
    if (!result) return 'Pending';
    switch (result) {
      case 'white_win':
        return '1-0';
      case 'black_win':
        return '0-1';
      case 'draw':
        return '½-½';
      case 'forfeit_white':
        return '+/-';
      case 'forfeit_black':
        return '-/+';
      case 'bye':
        return 'BYE';
      default:
        return result;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (games.length === 0) {
    return (
      <Alert severity="info">
        No pairings generated for Round {roundNumber} yet.
      </Alert>
    );
  }

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Round {roundNumber} Pairings ({games.length} games)
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
        >
          Print
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>Board</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>White</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>Result</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>Black</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map((game, index) => {
              const isBye = !game.black_player_id || game.black_player_id === 0;
              const isCompleted = game.completed;
              const boardNumber = game.board_number || index + 1; // Use board_number if available, otherwise use index + 1

              return (
                <TableRow
                  key={game.id}
                  sx={{
                    bgcolor: isCompleted ? 'success.light' : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:nth-of-type(even)': {
                      bgcolor: isCompleted ? 'success.light' : 'action.hover',
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                      {boardNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {getPlayerName(game.white_player_id)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {isBye ? (
                      <Chip label="BYE" color="info" size="small" />
                    ) : (
                      <Chip
                        label={getResultLabel(game.result)}
                        color={isCompleted ? 'success' : 'default'}
                        size="small"
                        variant={isCompleted ? 'filled' : 'outlined'}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {isBye ? (
                      <Typography variant="body2" color="text.secondary">
                        BYE
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getPlayerName(game.black_player_id!)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenResultDialog(game.id)}
                      color={isCompleted ? 'default' : 'primary'}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <ResultEntryDialog
        open={resultDialogOpen}
        gameId={selectedGameId}
        tournamentId={tournamentId}
        onClose={handleCloseResultDialog}
        onSuccess={handleResultSubmitted}
      />
    </>
  );
}


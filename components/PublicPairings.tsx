'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import { supabase } from '@/lib/supabase';

interface Game {
  id: string;
  round_number: number;
  white_player_id: string | null;
  black_player_id: string | null;
  result: string | null;
  white_player: {
    id: string;
    name: string;
    surname: string;
  } | null;
  black_player: {
    id: string;
    name: string;
    surname: string;
  } | null;
}

interface PublicPairingsProps {
  currentRound: number;
  tournamentId?: string; // Optional - if provided, filter by tournament
}

export default function PublicPairings({ currentRound, tournamentId }: PublicPairingsProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentRound === 0) {
      setLoading(false);
      return;
    }

    loadGames();

    // Subscribe to real-time updates
    const gamesSubscription = supabase
      .channel('public-games-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `round_number=eq.${currentRound}`,
        },
        () => {
          loadGames();
        }
      )
      .subscribe();

    return () => {
      gamesSubscription.unsubscribe();
    };
  }, [currentRound]);

  const loadGames = async () => {
    try {
      setLoading(true);

      console.log(`🎮 Loading games for Round ${currentRound}...`);

      // Load games first - filter by tournament if provided
      let gamesQuery = supabase
        .from('games')
        .select('*')
        .eq('round_number', currentRound);
      
      // Filter by tournament using game ID pattern
      if (tournamentId) {
        gamesQuery = gamesQuery.like('id', `game-${tournamentId}-%`);
      }
      
      const { data: gamesData, error: gamesError } = await gamesQuery.order('id');

      if (gamesError) {
        console.error('❌ Error loading games:', gamesError);
        throw gamesError;
      }

      console.log(`✅ Loaded ${gamesData?.length || 0} games`);

      // Load all players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, name, surname');

      if (playersError) {
        console.error('❌ Error loading players:', playersError);
        throw playersError;
      }

      console.log(`✅ Loaded ${playersData?.length || 0} players`);

      // Map player IDs to player objects
      const playersMap = new Map(playersData?.map(p => [p.id, p]) || []);

      // Enrich games with player data
      const enrichedGames = (gamesData || []).map(game => ({
        ...game,
        white_player: game.white_player_id ? playersMap.get(game.white_player_id) || null : null,
        black_player: game.black_player_id ? playersMap.get(game.black_player_id) || null : null,
      }));

      // Sort games in pairing order (BYE games last, then by white player surname + name)
      enrichedGames.sort((a, b) => {
        // BYE games go last
        const aIsBye = a.black_player_id === null || a.black_player_id === '0';
        const bIsBye = b.black_player_id === null || b.black_player_id === '0';
        
        if (aIsBye && !bIsBye) return 1;
        if (!aIsBye && bIsBye) return -1;
        
        // Sort by white player surname, then name
        const aWhite = a.white_player;
        const bWhite = b.white_player;
        
        if (!aWhite || !bWhite) return 0;
        
        const surnameCompare = aWhite.surname.localeCompare(bWhite.surname);
        if (surnameCompare !== 0) return surnameCompare;
        
        return aWhite.name.localeCompare(bWhite.name);
      });

      console.log(`✅ Enriched and sorted ${enrichedGames.length} games`);
      setGames(enrichedGames as any);
    } catch (err) {
      console.error('❌ Error loading games:', err);
    } finally {
      setLoading(false);
    }
  };

  if (currentRound === 0) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📋 Current Round Pairings
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            Tournament has not started yet. Check back soon!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getResultChip = (result: string | null, side: 'white' | 'black') => {
    if (!result) {
      return <Chip label="Pending" size="small" color="default" />;
    }

    if (result === 'draw') {
      return <Chip label="½-½" size="small" color="info" />;
    }

    if ((result === 'white' && side === 'white') || (result === 'black' && side === 'black')) {
      return <Chip label="1-0" size="small" color="success" />;
    }

    return <Chip label="0-1" size="small" color="error" />;
  };

  const completedGames = games.filter((g) => g.result !== null).length;
  const totalGames = games.length;
  const progress = totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0;

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📋 Round {currentRound} Pairings
          </Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              {completedGames} / {totalGames} games completed
            </Typography>
            <Typography variant="h6" color={progress === 100 ? 'success.main' : 'primary.main'}>
              {progress}%
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Typography align="center" sx={{ py: 4 }} color="text.secondary">
            Loading pairings...
          </Typography>
        ) : games.length === 0 ? (
          <Typography align="center" sx={{ py: 4 }} color="text.secondary">
            No pairings available yet
          </Typography>
        ) : (
          <>
            {/* Desktop View */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        Board
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>White</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        Result
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Black</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {games.map((game, index) => (
                      <TableRow key={game.id} hover>
                        <TableCell align="center">
                          <Chip label={index + 1} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          {game.white_player ? (
                            <Typography sx={{ fontWeight: 500 }}>
                              {game.white_player.name} {game.white_player.surname}
                            </Typography>
                          ) : (
                            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              BYE
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {game.result === null
                              ? '—'
                              : game.result === 'draw'
                              ? '½-½'
                              : game.result === 'white'
                              ? '1-0'
                              : '0-1'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {game.black_player ? (
                            <Typography sx={{ fontWeight: 500 }}>
                              {game.black_player.name} {game.black_player.surname}
                            </Typography>
                          ) : (
                            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              BYE
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {game.result === null ? (
                            <Chip label="⏳ In Progress" size="small" color="warning" />
                          ) : (
                            <Chip label="✓ Complete" size="small" color="success" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Mobile View */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <Stack spacing={2}>
                {games.map((game, index) => (
                  <Card variant="outlined" key={game.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip label={`Board ${index + 1}`} size="small" color="primary" />
                        {game.result === null ? (
                          <Chip label="⏳ In Progress" size="small" color="warning" />
                        ) : (
                          <Chip label="✓ Complete" size="small" color="success" />
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            White
                          </Typography>
                          <Typography sx={{ fontWeight: 500 }}>
                            {game.white_player
                              ? `${game.white_player.name} ${game.white_player.surname}`
                              : 'BYE'}
                          </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ mx: 2, fontWeight: 'bold' }}>
                          {game.result === null
                            ? '—'
                            : game.result === 'draw'
                            ? '½-½'
                            : game.result === 'white'
                            ? '1-0'
                            : '0-1'}
                        </Typography>
                        <Box sx={{ flex: 1, textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary">
                            Black
                          </Typography>
                          <Typography sx={{ fontWeight: 500 }}>
                            {game.black_player
                              ? `${game.black_player.name} ${game.black_player.surname}`
                              : 'BYE'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}


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
import ResultEntryDialog from './ResultEntryDialog';

interface PairingsViewProps {
  tournamentId: string;
  roundNumber: number;
}

export default function PairingsView({ tournamentId, roundNumber }: PairingsViewProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationWithPlayer[]>([]);
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
      setGames(gamesData);
      setRegistrations(registrationsData);
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
    const reg = registrations.find(r => (r.player_id || r.player_pool_id) === playerId);
    if (!reg) return `Player ${playerId}`;
    return `${reg.player.name} ${reg.player.surname}`;
  };

  const getPlayerBounty = (playerId: number): number => {
    const reg = registrations.find(r => (r.player_id || r.player_pool_id) === playerId);
    if (!reg) return 0;
    const regAny = reg as any;
    return regAny.current_bounty || 0;
  };

  const formatBounty = (amount: number): string => {
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Board</TableCell>
              <TableCell>White</TableCell>
              <TableCell>Pesos</TableCell>
              <TableCell align="center">Result</TableCell>
              <TableCell>Black</TableCell>
              <TableCell>Pesos</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map((game) => {
              const isBye = !game.black_player_id;
              const isCompleted = game.completed;

              return (
                <TableRow
                  key={game.id}
                  sx={{
                    bgcolor: isCompleted ? 'success.light' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {game.board_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {getPlayerName(game.white_player_id)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatBounty(getPlayerBounty(game.white_player_id))}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {isBye ? (
                      <Chip label="BYE" color="info" />
                    ) : (
                      <Chip
                        label={getResultLabel(game.result)}
                        color={isCompleted ? 'success' : 'default'}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {isBye ? (
                      <Typography variant="body2" color="text.secondary">
                        BYE
                      </Typography>
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {getPlayerName(game.black_player_id!)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {!isBye && (
                      <Chip
                        label={formatBounty(getPlayerBounty(game.black_player_id!))}
                        size="small"
                        color="primary"
                      />
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


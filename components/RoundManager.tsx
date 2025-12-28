'use client';

import { TournamentState, Game } from '@/types';
import { submitGameResult } from '@/lib/store';
import GameCard from './GameCard';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

interface RoundManagerProps {
  state: TournamentState;
  onStateUpdate: (state: TournamentState) => void;
  onBackToLeaderboard: () => void;
}

export default function RoundManager({ state, onStateUpdate, onBackToLeaderboard }: RoundManagerProps) {
  const currentRound = state.rounds[state.currentRound - 1];

  if (!currentRound) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <Card elevation={3}>
          <CardContent sx={{ py: 6 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              No Active Round
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<BackIcon />}
              onClick={onBackToLeaderboard}
              sx={{ mt: 2 }}
            >
              Back to Leaderboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const handleGameResult = (game: Game, result: 'white' | 'black' | 'draw', sheriffWhite: boolean, sheriffBlack: boolean) => {
    const newState = submitGameResult(state, game.id, result, {
      white: sheriffWhite,
      black: sheriffBlack,
    });
    onStateUpdate(newState);
  };

  const completedGames = currentRound.games.filter(g => g.completed).length;
  const totalGames = currentRound.games.length;
  const progress = (completedGames / totalGames) * 100;
  const byeGames = currentRound.games.filter(g => g.blackPlayerId === 0);
  const regularGames = currentRound.games.filter(g => g.blackPlayerId !== 0);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            ♟️ Round {currentRound.number}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {completedGames} of {totalGames} games completed
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="info"
          startIcon={<BackIcon />}
          onClick={onBackToLeaderboard}
        >
          Back to Leaderboard
        </Button>
      </Box>

      {/* Progress bar */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 10, borderRadius: 5 }}
          color="secondary"
        />
      </Box>

      {/* Round Complete Message */}
      {currentRound.completed && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            ✓ Round {currentRound.number} Complete! Go back to leaderboard to start the next round.
          </Typography>
        </Alert>
      )}

      {/* Bye notification */}
      {byeGames.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            🎯 Players with BYE (automatic win, no bounty gain):
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {byeGames.map(game => {
              const player = state.players.find(p => p.id === game.whitePlayerId);
              if (!player) return null;
              return (
                <Chip 
                  key={game.id}
                  label={`${player.name} ${player.surname} (ID: ${player.id})`}
                  color="info"
                  size="small"
                />
              );
            })}
          </Stack>
        </Alert>
      )}

      {/* Games grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 2, mb: 4 }}>
        {regularGames.map(game => {
          const whitePlayer = state.players.find(p => p.id === game.whitePlayerId);
          const blackPlayer = state.players.find(p => p.id === game.blackPlayerId);

          if (!whitePlayer || !blackPlayer) return null;

          return (
            <GameCard
              key={game.id}
              game={game}
              whitePlayer={whitePlayer}
              blackPlayer={blackPlayer}
              roundNumber={currentRound.number}
              onSubmitResult={handleGameResult}
            />
          );
        })}
      </Box>

      {/* Printable pairings */}
      <Card elevation={3} sx={{ '@media print': { boxShadow: 'none' } }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, '@media print': { mb: 4 } }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', '@media print': { fontSize: '2rem' } }}>
                Round {currentRound.number} - Pairings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Total Games: {regularGames.length} • BYEs: {byeGames.length}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              sx={{ '@media print': { display: 'none' } }}
            >
              Print Pairings
            </Button>
          </Box>

          {/* Table format for easy reading */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Board</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>⬜ White Player</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>⬛ Black Player</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {regularGames.map((game, index) => {
                  const whitePlayer = state.players.find(p => p.id === game.whitePlayerId);
                  const blackPlayer = state.players.find(p => p.id === game.blackPlayerId);

                  if (!whitePlayer || !blackPlayer) return null;

                  return (
                    <TableRow key={game.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {whitePlayer.name} {whitePlayer.surname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {whitePlayer.id} • Bounty: {whitePlayer.bounty}₱
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {blackPlayer.name} {blackPlayer.surname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {blackPlayer.id} • Bounty: {blackPlayer.bounty}₱
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* BYE section */}
          {byeGames.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                🎯 BYE (Automatic Win - No bounty gain)
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'info.light' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Player</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {byeGames.map(game => {
                      const player = state.players.find(p => p.id === game.whitePlayerId);
                      if (!player) return null;
                      return (
                        <TableRow key={game.id}>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {player.name} {player.surname}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {player.id} • Bounty: {player.bounty}₱
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                              Automatic Win (+1 Win, +0 Bounty)
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

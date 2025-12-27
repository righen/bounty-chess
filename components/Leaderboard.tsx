'use client';

import { Player } from '@/types';
import { formatBounty, getAgeCategory } from '@/lib/utils';
import { 
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon,
  PlayArrow as PlayIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import LeaderboardMobile from './LeaderboardMobile';

interface LeaderboardProps {
  players: Player[];
  currentRound: number;
  totalRounds: number;
  tournamentStarted: boolean;
  onStartTournament: () => void;
  onGeneratePairing: () => void;
}

export default function Leaderboard({ 
  players, 
  currentRound, 
  totalRounds, 
  tournamentStarted, 
  onStartTournament, 
  onGeneratePairing 
}: LeaderboardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Sort players by bounty (highest first)
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.bounty !== a.bounty) return b.bounty - a.bounty;
    return b.wins - a.wins;
  });

  const canGenerateNextRound = currentRound < totalRounds && tournamentStarted;

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  if (isMobile) {
    return (
      <Box sx={{ maxWidth: '100%' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrophyIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Leaderboard
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            {tournamentStarted ? (
              <Chip label="✓ Tournament Started" color="success" />
            ) : (
              <Chip label="⏸️ Not Started" color="warning" />
            )}
          </Box>

          {/* Action Button */}
          {!tournamentStarted && (
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<RocketIcon />}
              onClick={onStartTournament}
              sx={{ py: 2 }}
            >
              Start Tournament
            </Button>
          )}
          {tournamentStarted && canGenerateNextRound && (
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<PlayIcon />}
              onClick={onGeneratePairing}
              sx={{ py: 2 }}
            >
              Generate Round {currentRound + 1}
            </Button>
          )}
          {tournamentStarted && !canGenerateNextRound && (
            <Typography variant="h5" align="center" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
              🎉 Tournament Complete!
            </Typography>
          )}
        </Box>

        {/* Mobile Cards */}
        <LeaderboardMobile players={sortedPlayers} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TrophyIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              Leaderboard
            </Typography>
          </Box>
          {tournamentStarted ? (
            <Chip label="✓ Tournament Started" color="success" size="medium" />
          ) : (
            <Chip label="⏸️ Not Started" color="warning" size="medium" />
          )}
        </Box>

        {/* Action Button */}
        <Box>
          {!tournamentStarted && (
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<RocketIcon />}
              onClick={onStartTournament}
              sx={{ px: 4, py: 2, fontSize: '1.1rem' }}
            >
              Start Tournament
            </Button>
          )}
          {tournamentStarted && canGenerateNextRound && (
            <Button
              variant="contained"
              color="info"
              size="large"
              startIcon={<PlayIcon />}
              onClick={onGeneratePairing}
              sx={{ px: 4, py: 2, fontSize: '1.1rem' }}
            >
              Generate Round {currentRound + 1}
            </Button>
          )}
          {tournamentStarted && !canGenerateNextRound && (
            <Typography variant="h5" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
              🎉 Tournament Complete!
            </Typography>
          )}
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Age</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Gender</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Bounty</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Record</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Sheriff</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPlayers.map((player, index) => (
              <TableRow 
                key={player.id}
                sx={{ 
                  '&:nth-of-type(odd)': { bgcolor: 'grey.50' },
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <TableCell>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: index < 3 ? 'secondary.main' : 'text.secondary' }}>
                    {getRankIcon(index)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{player.id}</TableCell>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {player.name} {player.surname}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {player.currentAddress}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2">{player.age > 0 ? player.age : '-'}</Typography>
                    {player.age > 0 && (
                      <Chip 
                        label={getAgeCategory(player.age).label} 
                        size="small"
                        color="info"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={player.gender === 'F' ? 'Female' : 'Male'}
                    size="small"
                    color={player.gender === 'F' ? 'error' : 'primary'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                    {formatBounty(player.bounty)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    <Box component="span" sx={{ color: 'success.main' }}>{player.wins}W</Box>
                    {' - '}
                    <Box component="span" sx={{ color: 'error.main' }}>{player.losses}L</Box>
                    {' - '}
                    <Box component="span" sx={{ color: 'text.secondary' }}>{player.draws}D</Box>
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {player.hasSheriffBadge ? (
                    <Typography sx={{ fontSize: '1.5rem' }}>🛡️</Typography>
                  ) : (
                    <Typography sx={{ color: 'text.disabled' }}>✗</Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  {player.criminalStatus !== 'normal' && (
                    <Chip 
                      label={player.criminalStatus.toUpperCase()}
                      size="small"
                      color={player.criminalStatus === 'angry' ? 'warning' : 'error'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mt: 3 }}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Tournament Stats</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2">Total Players: <strong>{players.length}</strong></Typography>
            <Typography variant="body2">Rounds Completed: <strong>{currentRound}</strong></Typography>
            <Typography variant="body2">Rounds Remaining: <strong>{Math.max(0, totalRounds - currentRound)}</strong></Typography>
            <Typography variant="body2">Active Sheriff Badges: <strong>{players.filter(p => p.hasSheriffBadge).length}</strong></Typography>
          </Box>
        </Card>

        <Card sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Protection Legend</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2"><Box component="span" sx={{ color: 'info.main' }}>●</Box> U12 (lose 1/4)</Typography>
            <Typography variant="body2"><Box component="span" sx={{ color: 'info.main' }}>●</Box> Women/U16 (lose 1/3)</Typography>
          </Box>
        </Card>

        <Card sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Criminal Status</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2"><Box component="span" sx={{ color: 'grey.500' }}>●</Box> Normal</Typography>
            <Typography variant="body2"><Box component="span" sx={{ color: 'warning.main' }}>●</Box> Angry (1 sheriff used)</Typography>
            <Typography variant="body2"><Box component="span" sx={{ color: 'error.main' }}>●</Box> Mad (2+ sheriffs, immune)</Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

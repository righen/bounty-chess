'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  EmojiEvents as TrophyIcon,
  People as PeopleIcon,
  PlayArrow as StartIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getTournament, Tournament } from '@/lib/tournament-store';
import { getTournamentRegistrations, RegistrationWithPlayer } from '@/lib/registration-store';
import { startTournament, generateNextRound } from '@/lib/tournament-rounds';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function TournamentControlPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (tournamentId) {
      loadData();
    }
  }, [tournamentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tournamentData, registrationsData] = await Promise.all([
        getTournament(tournamentId),
        getTournamentRegistrations(tournamentId),
      ]);

      setTournament(tournamentData);
      setRegistrations(registrationsData);
    } catch (error) {
      console.error('Error loading tournament data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTournament = async () => {
    if (!confirm('Start the tournament? This will generate Round 1 pairings.')) return;
    
    try {
      setActionLoading(true);
      await startTournament(tournamentId);
      setSnackbar({ open: true, message: 'Tournament started! Round 1 pairings generated.', severity: 'success' });
      loadData();
    } catch (error: any) {
      console.error('Error starting tournament:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to start tournament', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGeneratePairings = async () => {
    if (!confirm(`Generate pairings for Round ${tournament!.current_round + 1}?`)) return;
    
    try {
      setActionLoading(true);
      await generateNextRound(tournamentId);
      setSnackbar({ open: true, message: `Round ${tournament!.current_round + 1} pairings generated!`, severity: 'success' });
      loadData();
    } catch (error: any) {
      console.error('Error generating pairings:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to generate pairings', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!tournament) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Tournament not found</Alert>
      </Container>
    );
  }

  const checkedInPlayers = registrations.filter(r => r.checked_in).length;
  const canStartTournament = checkedInPlayers >= 2 && tournament.status === 'draft';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Tournament Control: {tournament.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {tournament.location} • Round {tournament.current_round}/{tournament.total_rounds}
        </Typography>

        {/* Quick Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {registrations.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Registered
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrophyIcon sx={{ fontSize: 32, color: 'success.main' }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {checkedInPlayers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Checked In
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GameIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {tournament.current_round}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current Round
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={tournament.status.toUpperCase()}
                  color={
                    tournament.status === 'in_progress'
                      ? 'warning'
                      : tournament.status === 'completed'
                      ? 'success'
                      : 'default'
                  }
                  sx={{ fontSize: '0.875rem', fontWeight: 600 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Action Buttons */}
        {tournament.status === 'draft' && (
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={actionLoading ? <CircularProgress size={16} /> : <StartIcon />}
              onClick={handleStartTournament}
              disabled={!canStartTournament || actionLoading}
            >
              {actionLoading ? 'Starting...' : 'Start Tournament'}
            </Button>
            {!canStartTournament && (
              <Alert severity="warning" sx={{ flex: 1 }}>
                Need at least 2 checked-in players to start tournament
              </Alert>
            )}
          </Box>
        )}

        {tournament.status === 'in_progress' && tournament.current_round < tournament.total_rounds && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={actionLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleGeneratePairings}
              disabled={actionLoading}
            >
              {actionLoading ? 'Generating...' : `Generate Round ${tournament.current_round + 1} Pairings`}
            </Button>
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <Paper>
        <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)}>
          <Tab label="Pairings" icon={<GameIcon />} iconPosition="start" />
          <Tab label="Standings" icon={<TrophyIcon />} iconPosition="start" />
          <Tab label="Players" icon={<PeopleIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={selectedTab} index={0}>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Round {tournament.current_round} Pairings
          </Typography>
          {tournament.current_round === 0 ? (
            <Alert severity="info">
              Tournament not started yet. Click "Start Tournament" to generate Round 1 pairings.
            </Alert>
          ) : (
            <Alert severity="info">
              Pairings view coming next! This will show all games for the current round.
            </Alert>
          )}
        </Paper>
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Current Standings
          </Typography>
          <Alert severity="info">
            Standings view coming next! This will show live leaderboard with scores, bounty, and rankings.
          </Alert>
        </Paper>
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Registered Players ({registrations.length})
          </Typography>
          {registrations.length === 0 ? (
            <Alert severity="info">No players registered yet.</Alert>
          ) : (
            <Alert severity="info">
              Players list view coming next! This will show all registered players with their status.
            </Alert>
          )}
        </Paper>
      </TabPanel>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default function TournamentControlPageWithAuth() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <TournamentControlPage />
    </ProtectedRoute>
  );
}


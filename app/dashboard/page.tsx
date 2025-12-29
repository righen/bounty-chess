'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Add as AddIcon,
  EmojiEvents as TournamentIcon,
  People as PeopleIcon,
  PlayArrow as InProgressIcon,
  CheckCircle as CompletedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PersonAdd as PersonAddIcon,
  Assessment as AssessmentIcon,
  FlashOn as QuickSetupIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Tournament,
  TournamentWithStats,
  TournamentStats,
  loadTournaments,
  getTournamentStats,
  deleteTournament,
} from '@/lib/tournament-store';
import { quickSetupTournament } from '@/lib/tournament-quick-setup';

function DashboardPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<TournamentWithStats[]>([]);
  const [stats, setStats] = useState<TournamentStats>({
    total: 0,
    draft: 0,
    registration: 0,
    inProgress: 0,
    completed: 0,
    totalPlayers: 0,
    activeRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [quickSetupLoading, setQuickSetupLoading] = useState(false);
  const [quickSetupDialog, setQuickSetupDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickSetup = async () => {
    try {
      setQuickSetupLoading(true);
      const result = await quickSetupTournament({
        autoRegisterAllPlayers: true,
      });
      
      alert(`Tournament "${result.tournament.name}" created successfully!\n${result.playersRegistered} players registered.`);
      setQuickSetupDialog(false);
      loadData();
      // Navigate to the new tournament
      router.push(`/tournaments/${result.tournament.id}`);
    } catch (error) {
      console.error('Error in quick setup:', error);
      alert('Failed to create tournament. Please try again.');
    } finally {
      setQuickSetupLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [tournamentsData, statsData] = await Promise.all([
        loadTournaments(),
        getTournamentStats(),
      ]);
      setTournaments(tournamentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;
    
    try {
      await deleteTournament(id);
      loadData();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Failed to delete tournament');
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'draft': return 'default';
      case 'registration': return 'primary';
      case 'ready': return 'warning';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'registration': return 'Registration';
      case 'ready': return 'Ready';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Tournament Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<QuickSetupIcon />}
            onClick={() => setQuickSetupDialog(true)}
            color="secondary"
          >
            Quick Setup
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/tournaments/create')}
          >
            New Tournament
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TournamentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tournaments
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <InProgressIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.inProgress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CompletedIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.totalPlayers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Registrations
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => router.push('/tournaments/create')}
          >
            Create Tournament
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => router.push('/player-pool')}
          >
            Manage Player Pool
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={() => alert('Reports coming soon!')}
          >
            View Reports
          </Button>
        </Box>
      </Box>

      {/* Tournaments List */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            All Tournaments
          </Typography>
        </Box>
        
        {tournaments.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No tournaments yet. Create your first tournament to get started!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/tournaments/create')}
            >
              Create Tournament
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Rounds</TableCell>
                  <TableCell>Players</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tournaments.map((tournament) => (
                  <TableRow key={tournament.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {tournament.name}
                      </Typography>
                      {tournament.location && (
                        <Typography variant="caption" color="text.secondary">
                          {tournament.location}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tournament.format.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(tournament.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {tournament.current_round}/{tournament.total_rounds}
                    </TableCell>
                    <TableCell>{tournament.player_count}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(tournament.status)}
                        color={getStatusColor(tournament.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/tournaments/${tournament.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/tournaments/${tournament.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTournament(tournament.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Quick Setup Dialog */}
      <Dialog open={quickSetupDialog} onClose={() => setQuickSetupDialog(false)}>
        <DialogTitle>Quick Tournament Setup</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will create a new tournament with default settings and automatically register all active players from the player pool.
            <br /><br />
            <strong>Default Settings:</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>Format: Swiss System</li>
              <li>Rounds: 9</li>
              <li>Time Control: 30+0</li>
              <li>Entry Fee: Free</li>
              <li>Bounty System: Disabled</li>
            </ul>
            <br />
            You can customize these settings after creation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickSetupDialog(false)} disabled={quickSetupLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleQuickSetup}
            variant="contained"
            startIcon={quickSetupLoading ? <CircularProgress size={16} /> : <QuickSetupIcon />}
            disabled={quickSetupLoading}
          >
            {quickSetupLoading ? 'Creating...' : 'Create Tournament'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default function DashboardPageWithAuth() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <DashboardPage />
    </ProtectedRoute>
  );
}


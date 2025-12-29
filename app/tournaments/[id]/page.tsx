'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import {
  PersonAdd as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Payment as PaymentIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getTournament, Tournament } from '@/lib/tournament-store';
import {
  getTournamentRegistrations,
  registerPlayer,
  bulkRegisterPlayers,
  unregisterPlayer,
  updateRegistration,
  getRegistrationStats,
  getAvailablePlayers,
  RegistrationWithPlayer,
} from '@/lib/registration-store';
import { PlayerPoolRecord } from '@/lib/player-pool-store';

function TournamentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithPlayer[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<PlayerPoolRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, paidFees: 0, checkedIn: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [addPlayerDialog, setAddPlayerDialog] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [entryFeePaid, setEntryFeePaid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerPoolRecord[]>([]);

  // Snackbar
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

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlayers(availablePlayers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = availablePlayers.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.surname.toLowerCase().includes(query) ||
          (p.email && p.email.toLowerCase().includes(query))
      );
      setFilteredPlayers(filtered);
    }
  }, [searchQuery, availablePlayers]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tournamentData, registrationsData, statsData, availableData] = await Promise.all([
        getTournament(tournamentId),
        getTournamentRegistrations(tournamentId),
        getRegistrationStats(tournamentId),
        getAvailablePlayers(tournamentId),
      ]);

      setTournament(tournamentData);
      setRegistrations(registrationsData);
      setStats(statsData);
      setAvailablePlayers(availableData);
      setFilteredPlayers(availableData);
    } catch (error) {
      console.error('Error loading tournament data:', error);
      showSnackbar('Failed to load tournament data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddPlayers = async () => {
    if (selectedPlayers.length === 0) {
      showSnackbar('Please select at least one player', 'error');
      return;
    }

    try {
      const result = await bulkRegisterPlayers(tournamentId, selectedPlayers, entryFeePaid);
      
      if (result.success > 0) {
        showSnackbar(`Successfully registered ${result.success} player(s)`, 'success');
      }
      if (result.failed > 0) {
        showSnackbar(`Failed to register ${result.failed} player(s)`, 'error');
        console.error('Registration errors:', result.errors);
      }

      setAddPlayerDialog(false);
      setSelectedPlayers([]);
      setSearchQuery('');
      loadData();
    } catch (error) {
      console.error('Error adding players:', error);
      showSnackbar('Failed to add players', 'error');
    }
  };

  const handleUnregister = async (registrationId: string) => {
    if (!confirm('Are you sure you want to remove this player from the tournament?')) return;

    try {
      await unregisterPlayer(registrationId);
      showSnackbar('Player removed successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Error removing player:', error);
      showSnackbar('Failed to remove player', 'error');
    }
  };

  const handleMarkPaid = async (registration: RegistrationWithPlayer) => {
    try {
      await updateRegistration(registration.id, {
        entry_fee_paid: !registration.entry_fee_paid,
        payment_method: !registration.entry_fee_paid ? 'cash' : null,
      });
      showSnackbar(
        registration.entry_fee_paid ? 'Marked as unpaid' : 'Marked as paid',
        'success'
      );
      loadData();
    } catch (error) {
      console.error('Error updating payment status:', error);
      showSnackbar('Failed to update payment status', 'error');
    }
  };

  const handleTogglePlayer = (playerId: number) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {tournament.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tournament.location} • {new Date(tournament.start_date).toLocaleDateString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.push(`/tournaments/${tournamentId}/check-in`)}
          >
            Check-In
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddPlayerDialog(true)}
          >
            Add Players
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
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Registrations
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>
              {stats.paidFees}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Paid Entry Fees
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'info.main' }}>
              {stats.checkedIn}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Checked In
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'warning.main' }}>
              {stats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Payment
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Registered Players Table */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Registered Players ({registrations.length})
          </Typography>
        </Box>

        {registrations.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No players registered yet. Add players to start!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddPlayerDialog(true)}
            >
              Add Players
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pairing #</TableCell>
                  <TableCell>Player Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Entry Fee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id} hover>
                    <TableCell>
                      <Chip label={registration.pairing_number || '-'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {registration.player.name} {registration.player.surname}
                      </Typography>
                    </TableCell>
                    <TableCell>{registration.player.email || '-'}</TableCell>
                    <TableCell>{registration.player.rating || '-'}</TableCell>
                    <TableCell>
                      {tournament.entry_fee && tournament.entry_fee > 0 ? (
                        <Chip
                          label={registration.entry_fee_paid ? 'Paid' : 'Pending'}
                          color={registration.entry_fee_paid ? 'success' : 'warning'}
                          size="small"
                        />
                      ) : (
                        <Chip label="Free" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      {registration.checked_in ? (
                        <Chip label="Checked In" color="success" size="small" icon={<CheckIcon />} />
                      ) : (
                        <Chip label="Not Checked In" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {tournament.entry_fee && tournament.entry_fee > 0 && (
                        <Tooltip title={registration.entry_fee_paid ? 'Mark as unpaid' : 'Mark as paid'}>
                          <IconButton
                            size="small"
                            onClick={() => handleMarkPaid(registration)}
                            color={registration.entry_fee_paid ? 'success' : 'default'}
                          >
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleUnregister(registration.id)}
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

      {/* Add Players Dialog */}
      <Dialog open={addPlayerDialog} onClose={() => setAddPlayerDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Players to Tournament</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {tournament.entry_fee && tournament.entry_fee > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Entry fee: ${tournament.entry_fee} per player
              <Checkbox
                checked={entryFeePaid}
                onChange={(e) => setEntryFeePaid(e.target.checked)}
                sx={{ ml: 2 }}
              />
              Mark as paid
            </Alert>
          )}

          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedPlayers.length === filteredPlayers.length && filteredPlayers.length > 0}
                      indeterminate={selectedPlayers.length > 0 && selectedPlayers.length < filteredPlayers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlayers(filteredPlayers.map(p => p.id));
                        } else {
                          setSelectedPlayers([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery ? 'No players found' : 'All players are already registered'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player) => (
                    <TableRow key={player.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedPlayers.includes(player.id)}
                          onChange={() => handleTogglePlayer(player.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {player.name} {player.surname}
                        </Typography>
                      </TableCell>
                      <TableCell>{player.email || '-'}</TableCell>
                      <TableCell>{player.rating || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {selectedPlayers.length} player(s) selected
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPlayerDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddPlayers}
            disabled={selectedPlayers.length === 0}
          >
            Add {selectedPlayers.length} Player(s)
          </Button>
        </DialogActions>
      </Dialog>

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

export default function TournamentDetailPageWithAuth() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <TournamentDetailPage />
    </ProtectedRoute>
  );
}


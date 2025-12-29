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
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
  Checkbox,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircle as CheckInIcon,
  Cancel as CheckOutIcon,
  Payment as PaymentIcon,
  PersonAdd as AddPersonIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  CheckBox as CheckAllIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getTournament, Tournament } from '@/lib/tournament-store';
import {
  getTournamentRegistrations,
  RegistrationWithPlayer,
} from '@/lib/registration-store';
import {
  checkInPlayer,
  checkOutPlayer,
  recordPayment,
  addWalkInPlayer,
  getCheckInStats,
  getCheckInLog,
  bulkCheckIn,
  CheckInLogEntry,
} from '@/lib/check-in-store';

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

function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithPlayer[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<RegistrationWithPlayer[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    notCheckedIn: 0,
    paid: 0,
    unpaid: 0,
    walkIns: 0,
  });
  const [checkInLog, setCheckInLog] = useState<CheckInLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);

  // Dialog states
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [walkInDialog, setWalkInDialog] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationWithPlayer | null>(null);

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'cash',
    reference: '',
    notes: '',
  });

  // Walk-in form
  const [walkInForm, setWalkInForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    rating: '',
    entryFeePaid: false,
    paymentMethod: 'cash',
  });

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
    filterRegistrations();
  }, [searchQuery, filterStatus, registrations]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tournamentData, registrationsData, statsData, logData] = await Promise.all([
        getTournament(tournamentId),
        getTournamentRegistrations(tournamentId),
        getCheckInStats(tournamentId),
        getCheckInLog(tournamentId),
      ]);

      setTournament(tournamentData);
      setRegistrations(registrationsData);
      setStats(statsData);
      setCheckInLog(logData);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = registrations;

    // Filter by status
    if (filterStatus === 'checked_in') {
      filtered = filtered.filter(r => r.checked_in);
    } else if (filterStatus === 'not_checked_in') {
      filtered = filtered.filter(r => !r.checked_in);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.player.name.toLowerCase().includes(query) ||
          r.player.surname.toLowerCase().includes(query) ||
          (r.player.email && r.player.email.toLowerCase().includes(query)) ||
          (r.pairing_number && r.pairing_number.toString().includes(query))
      );
    }

    setFilteredRegistrations(filtered);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCheckIn = async (registration: RegistrationWithPlayer) => {
    try {
      await checkInPlayer(registration.id);
      showSnackbar('Player checked in successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Error checking in player:', error);
      showSnackbar('Failed to check in player', 'error');
    }
  };

  const handleCheckOut = async (registration: RegistrationWithPlayer) => {
    if (!confirm('Are you sure you want to undo this check-in?')) return;
    try {
      await checkOutPlayer(registration.id);
      showSnackbar('Check-in undone', 'success');
      loadData();
    } catch (error) {
      console.error('Error checking out player:', error);
      showSnackbar('Failed to undo check-in', 'error');
    }
  };

  const handleOpenPaymentDialog = (registration: RegistrationWithPlayer) => {
    setSelectedRegistration(registration);
    setPaymentForm({
      amount: tournament?.entry_fee || 0,
      method: 'cash',
      reference: '',
      notes: '',
    });
    setPaymentDialog(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedRegistration) return;
    try {
      await recordPayment(
        selectedRegistration.id,
        paymentForm.amount,
        paymentForm.method,
        paymentForm.reference,
        undefined,
        paymentForm.notes
      );
      showSnackbar('Payment recorded successfully', 'success');
      setPaymentDialog(false);
      loadData();
    } catch (error) {
      console.error('Error recording payment:', error);
      showSnackbar('Failed to record payment', 'error');
    }
  };

  const handleAddWalkIn = async () => {
    if (!walkInForm.name || !walkInForm.surname) {
      showSnackbar('Name and surname are required', 'error');
      return;
    }

    try {
      await addWalkInPlayer(
        tournamentId,
        {
          name: walkInForm.name,
          surname: walkInForm.surname,
          email: walkInForm.email || undefined,
          phone: walkInForm.phone || undefined,
          age: walkInForm.age ? parseInt(walkInForm.age) : undefined,
          gender: (walkInForm.gender as 'M' | 'F') || undefined,
          rating: walkInForm.rating ? parseInt(walkInForm.rating) : undefined,
        },
        walkInForm.entryFeePaid,
        walkInForm.paymentMethod
      );
      showSnackbar('Walk-in player added successfully', 'success');
      setWalkInDialog(false);
      setWalkInForm({
        name: '',
        surname: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        rating: '',
        entryFeePaid: false,
        paymentMethod: 'cash',
      });
      loadData();
    } catch (error) {
      console.error('Error adding walk-in player:', error);
      showSnackbar('Failed to add walk-in player', 'error');
    }
  };

  const handleBulkCheckIn = async () => {
    if (selectedRegistrations.length === 0) {
      showSnackbar('No players selected', 'error');
      return;
    }

    if (!confirm(`Check in ${selectedRegistrations.length} player(s)?`)) return;

    try {
      const result = await bulkCheckIn(selectedRegistrations);
      showSnackbar(
        `Checked in ${result.success} player(s). Failed: ${result.failed}`,
        result.failed > 0 ? 'error' : 'success'
      );
      setSelectedRegistrations([]);
      loadData();
    } catch (error) {
      console.error('Error bulk checking in:', error);
      showSnackbar('Failed to bulk check in', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedRegistrations.length === filteredRegistrations.length) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(filteredRegistrations.map(r => r.id));
    }
  };

  const toggleSelectRegistration = (id: string) => {
    setSelectedRegistrations(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Check-In: {tournament.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tournament Day Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddPersonIcon />}
          onClick={() => setWalkInDialog(true)}
        >
          Add Walk-In
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(6, 1fr)',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {stats.checkedIn}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Checked In
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              {stats.notCheckedIn}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Not Checked In
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {stats.paid}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Paid
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              {stats.unpaid}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Unpaid
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              {stats.walkIns}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Walk-Ins
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)}>
          <Tab label="Check-In List" />
          <Tab label="Activity Log" icon={<HistoryIcon />} iconPosition="end" />
        </Tabs>
      </Paper>

      {/* Tab Panel 0: Check-In List */}
      <TabPanel value={selectedTab} index={0}>
        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by name, email, or pairing number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: 300 }}
            />
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="checked_in">Checked In</MenuItem>
              <MenuItem value="not_checked_in">Not Checked In</MenuItem>
            </TextField>
            {selectedRegistrations.length > 0 && (
              <Button
                variant="contained"
                startIcon={<CheckAllIcon />}
                onClick={handleBulkCheckIn}
              >
                Check In ({selectedRegistrations.length})
              </Button>
            )}
          </Box>
        </Paper>

        {/* Check-In Table */}
        <Paper>
          {filteredRegistrations.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No players found
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          selectedRegistrations.length === filteredRegistrations.length &&
                          filteredRegistrations.length > 0
                        }
                        indeterminate={
                          selectedRegistrations.length > 0 &&
                          selectedRegistrations.length < filteredRegistrations.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Pairing #</TableCell>
                    <TableCell>Player Name</TableCell>
                    <TableCell>Email/Phone</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Check-In Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRegistrations.includes(registration.id)}
                          onChange={() => toggleSelectRegistration(registration.id)}
                          disabled={registration.checked_in}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={registration.pairing_number || '-'} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {registration.player.name} {registration.player.surname}
                        </Typography>
                        {registration.player.rating && (
                          <Typography variant="caption" color="text.secondary">
                            Rating: {registration.player.rating}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{registration.player.email || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {registration.player.phone || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {tournament.entry_fee && tournament.entry_fee > 0 ? (
                          <Chip
                            label={registration.entry_fee_paid ? 'Paid' : 'Unpaid'}
                            color={registration.entry_fee_paid ? 'success' : 'warning'}
                            size="small"
                          />
                        ) : (
                          <Chip label="Free" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        {registration.checked_in ? (
                          <Chip
                            label="Checked In"
                            color="success"
                            size="small"
                            icon={<CheckInIcon />}
                          />
                        ) : (
                          <Chip label="Not Checked In" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {!registration.checked_in ? (
                          <Tooltip title="Check In">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleCheckIn(registration)}
                            >
                              <CheckInIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Undo Check-In">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCheckOut(registration)}
                            >
                              <CheckOutIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {tournament.entry_fee && tournament.entry_fee > 0 && !registration.entry_fee_paid && (
                          <Tooltip title="Record Payment">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenPaymentDialog(registration)}
                            >
                              <PaymentIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </TabPanel>

      {/* Tab Panel 1: Activity Log */}
      <TabPanel value={selectedTab} index={1}>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Player ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checkInLog.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No activity yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  checkInLog.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(log.performed_at).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action_type.replace('_', ' ').toUpperCase()}
                          size="small"
                          color={
                            log.action_type === 'check_in'
                              ? 'success'
                              : log.action_type === 'payment'
                              ? 'primary'
                              : log.action_type === 'walk_in'
                              ? 'info'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>{log.player_id || '-'}</TableCell>
                      <TableCell>{log.amount ? `$${log.amount}` : '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {log.notes || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          {selectedRegistration && (
            <Box sx={{ mb: 2, mt: 1 }}>
              <Typography variant="subtitle2">
                Player: {selectedRegistration.player.name} {selectedRegistration.player.surname}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              fullWidth
              select
              label="Payment Method"
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="mobile_money">Mobile Money</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Reference/Receipt Number"
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRecordPayment}>
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Walk-In Dialog */}
      <Dialog open={walkInDialog} onClose={() => setWalkInDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Walk-In Player</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="First Name *"
              value={walkInForm.name}
              onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Surname *"
              value={walkInForm.surname}
              onChange={(e) => setWalkInForm({ ...walkInForm, surname: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              value={walkInForm.email}
              onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Phone"
              value={walkInForm.phone}
              onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
            />
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={walkInForm.age}
              onChange={(e) => setWalkInForm({ ...walkInForm, age: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label="Gender"
              value={walkInForm.gender}
              onChange={(e) => setWalkInForm({ ...walkInForm, gender: e.target.value })}
            >
              <MenuItem value="">-</MenuItem>
              <MenuItem value="M">Male</MenuItem>
              <MenuItem value="F">Female</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Rating"
              type="number"
              value={walkInForm.rating}
              onChange={(e) => setWalkInForm({ ...walkInForm, rating: e.target.value })}
            />
            {tournament.entry_fee && tournament.entry_fee > 0 && (
              <>
                <TextField
                  fullWidth
                  select
                  label="Entry Fee Paid?"
                  value={walkInForm.entryFeePaid ? 'yes' : 'no'}
                  onChange={(e) =>
                    setWalkInForm({ ...walkInForm, entryFeePaid: e.target.value === 'yes' })
                  }
                >
                  <MenuItem value="no">No - Collect Later</MenuItem>
                  <MenuItem value="yes">Yes - Paid Now</MenuItem>
                </TextField>
                {walkInForm.entryFeePaid && (
                  <TextField
                    fullWidth
                    select
                    label="Payment Method"
                    value={walkInForm.paymentMethod}
                    onChange={(e) => setWalkInForm({ ...walkInForm, paymentMethod: e.target.value })}
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="card">Card</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="mobile_money">Mobile Money</MenuItem>
                  </TextField>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWalkInDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddWalkIn}>
            Add & Check In
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

export default function CheckInPageWithAuth() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <CheckInPage />
    </ProtectedRoute>
  );
}


'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  InputAdornment,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Block as BannedIcon,
  EmojiEvents as TrophyIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  PlayerPoolRecord,
  PlayerPoolInput,
  loadPlayerPool,
  addPlayerToPool,
  updatePlayerInPool,
  deletePlayerFromPool,
  searchPlayerPool,
  getPlayerPoolStats,
  bulkImportPlayersToPool,
} from '@/lib/player-pool-store';
import { importTournamentPlayersCSV, loadCSVFromPublic } from '@/lib/csv-import';

function PlayerPoolPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerPoolRecord[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerPoolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvImportLoading, setCsvImportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({ total: 0, active: 0, banned: 0, withRating: 0 });
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerPoolRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<PlayerPoolRecord | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<PlayerPoolInput>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    birthdate: '',
    age: undefined,
    gender: undefined,
    rating: undefined,
    fide_id: '',
    national_id: '',
    notes: '',
    active: true,
    banned: false,
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load players and stats
  useEffect(() => {
    loadData();
  }, []);

  // Filter players based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = players.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.surname.toLowerCase().includes(query) ||
          (p.email && p.email.toLowerCase().includes(query)) ||
          (p.fide_id && p.fide_id.toLowerCase().includes(query))
      );
      setFilteredPlayers(filtered);
    }
    setPage(0); // Reset to first page when searching
  }, [searchQuery, players]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [playersData, statsData] = await Promise.all([
        loadPlayerPool(),
        getPlayerPoolStats(),
      ]);
      setPlayers(playersData);
      setFilteredPlayers(playersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Failed to load player pool', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (player?: PlayerPoolRecord) => {
    if (player) {
      setEditingPlayer(player);
      setFormData({
        name: player.name,
        surname: player.surname,
        email: player.email || '',
        phone: player.phone || '',
        birthdate: player.birthdate || '',
        age: player.age || undefined,
        gender: player.gender || undefined,
        rating: player.rating || undefined,
        fide_id: player.fide_id || '',
        national_id: player.national_id || '',
        notes: player.notes || '',
        active: player.active,
        banned: player.banned,
        ban_reason: player.ban_reason || '',
      });
    } else {
      setEditingPlayer(null);
      setFormData({
        name: '',
        surname: '',
        email: '',
        phone: '',
        birthdate: '',
        age: undefined,
        gender: undefined,
        rating: undefined,
        fide_id: '',
        national_id: '',
        notes: '',
        active: true,
        banned: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPlayer(null);
  };

  const handleSavePlayer = async () => {
    try {
      if (!formData.name || !formData.surname) {
        showSnackbar('Name and surname are required', 'error');
        return;
      }

      if (editingPlayer) {
        await updatePlayerInPool(editingPlayer.id, formData);
        showSnackbar('Player updated successfully', 'success');
      } else {
        await addPlayerToPool(formData);
        showSnackbar('Player added successfully', 'success');
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Error saving player:', error);
      showSnackbar('Failed to save player', 'error');
    }
  };

  const handleDeleteClick = (player: PlayerPoolRecord) => {
    setPlayerToDelete(player);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;

    try {
      await deletePlayerFromPool(playerToDelete.id);
      showSnackbar('Player deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setPlayerToDelete(null);
      loadData();
    } catch (error) {
      console.error('Error deleting player:', error);
      showSnackbar('Failed to delete player', 'error');
    }
  };

  const handleCSVImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const lines = text.split('\n').filter((line: string) => line.trim());
        const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
        
        const playersToImport: PlayerPoolInput[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v: string) => v.trim());
          const player: PlayerPoolInput = {
            name: values[headers.indexOf('name')] || '',
            surname: values[headers.indexOf('surname')] || '',
            email: values[headers.indexOf('email')] || '',
            phone: values[headers.indexOf('phone')] || '',
            birthdate: values[headers.indexOf('birthdate')] || undefined,
            age: parseInt(values[headers.indexOf('age')]) || undefined,
            gender: (values[headers.indexOf('gender')]?.toUpperCase() as 'M' | 'F') || undefined,
            rating: parseInt(values[headers.indexOf('rating')]) || undefined,
            fide_id: values[headers.indexOf('fide_id')] || '',
            national_id: values[headers.indexOf('national_id')] || '',
            notes: values[headers.indexOf('notes')] || '',
          };
          
          if (player.name && player.surname) {
            playersToImport.push(player);
          }
        }

        const result = await bulkImportPlayersToPool(playersToImport);
        showSnackbar(`Imported ${result.success} players (${result.failed} failed)`, 'success');
        loadData();
      } catch (error) {
        console.error('Error importing CSV:', error);
        showSnackbar('Failed to import CSV', 'error');
      }
    };
    input.click();
  };

  const handleImportTournamentPlayers = async () => {
    try {
      setCsvImportLoading(true);
      const csvContent = await loadCSVFromPublic('tournament-players.csv');
      const result = await importTournamentPlayersCSV(csvContent);
      
      if (result.success > 0) {
        showSnackbar(
          `Successfully imported ${result.success} players from tournament-players.csv${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
          'success'
        );
        loadData();
      } else {
        showSnackbar(
          result.errors.length > 0 
            ? `Import failed: ${result.errors.join(', ')}`
            : 'No players were imported',
          'error'
        );
      }
    } catch (error: any) {
      console.error('Error importing tournament players:', error);
      showSnackbar(`Failed to import: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setCsvImportLoading(false);
    }
  };

  const handleCSVExport = () => {
    const headers = ['name', 'surname', 'email', 'phone', 'birthdate', 'age', 'gender', 'rating', 'fide_id', 'national_id', 'tournaments_played', 'total_games', 'total_wins', 'total_draws', 'total_losses', 'notes', 'active', 'banned'];
    const csv = [
      headers.join(','),
      ...players.map(p => [
        p.name,
        p.surname,
        p.email || '',
        p.phone || '',
        p.birthdate || '',
        p.age || '',
        p.gender || '',
        p.rating || '',
        p.fide_id || '',
        p.national_id || '',
        p.tournaments_played,
        p.total_games,
        p.total_wins,
        p.total_draws,
        p.total_losses,
        p.notes || '',
        p.active,
        p.banned,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `player-pool-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.push('/')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Player Pool Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleCSVImport}
          >
            Import CSV
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={csvImportLoading ? <CircularProgress size={16} /> : <UploadIcon />}
            onClick={handleImportTournamentPlayers}
            disabled={csvImportLoading}
          >
            {csvImportLoading ? 'Importing...' : 'Import Tournament Players'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleCSVExport}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Player
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
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Players
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ActiveIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Players
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BannedIcon sx={{ fontSize: 40, color: 'error.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.banned}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Banned Players
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrophyIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.withRating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  With Rating
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, or FIDE ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Players Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>FIDE ID</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Tournaments</TableCell>
                <TableCell>Record</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPlayers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((player) => (
                  <TableRow key={player.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {player.name} {player.surname}
                      </Typography>
                    </TableCell>
                    <TableCell>{player.gender || '-'}</TableCell>
                    <TableCell>{player.age || '-'}</TableCell>
                    <TableCell>
                      {player.email && (
                        <Typography variant="body2">{player.email}</Typography>
                      )}
                      {player.phone && (
                        <Typography variant="caption" color="text.secondary">
                          {player.phone}
                        </Typography>
                      )}
                      {!player.email && !player.phone && '-'}
                    </TableCell>
                    <TableCell>{player.fide_id || '-'}</TableCell>
                    <TableCell>
                      {player.rating ? (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {player.rating}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{player.tournaments_played}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {player.total_wins}W / {player.total_losses}L / {player.total_draws}D
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {player.banned ? (
                          <Chip label="Banned" color="error" size="small" />
                        ) : player.active ? (
                          <Chip label="Active" color="success" size="small" />
                        ) : (
                          <Chip label="Inactive" color="default" size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(player)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(player)}
                          color="error"
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredPlayers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Add/Edit Player Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPlayer ? 'Edit Player' : 'Add New Player'}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              fullWidth
              label="First Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Surname *"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
            />
            <TextField
              fullWidth
              label="Birthdate"
              type="date"
              value={formData.birthdate}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={formData.age || ''}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
            />
            <TextField
              fullWidth
              select
              label="Gender"
              value={formData.gender || ''}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
            >
              <MenuItem value="">-</MenuItem>
              <MenuItem value="M">Male</MenuItem>
              <MenuItem value="F">Female</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Box>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              fullWidth
              label="FIDE ID"
              value={formData.fide_id}
              onChange={(e) => setFormData({ ...formData, fide_id: e.target.value })}
            />
            <TextField
              fullWidth
              label="National ID"
              value={formData.national_id}
              onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
            />
            <TextField
              fullWidth
              label="Rating"
              type="number"
              value={formData.rating || ''}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || undefined })}
            />
          </Box>

          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            sx={{ mt: 2 }}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.active ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, active: e.target.value === 'active' })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Ban Status"
              value={formData.banned ? 'banned' : 'not_banned'}
              onChange={(e) => setFormData({ ...formData, banned: e.target.value === 'banned' })}
            >
              <MenuItem value="not_banned">Not Banned</MenuItem>
              <MenuItem value="banned">Banned</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePlayer} variant="contained">
            {editingPlayer ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{playerToDelete?.name} {playerToDelete?.surname}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
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

export default function PlayerPoolPageWithAuth() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <PlayerPoolPage />
    </ProtectedRoute>
  );
}


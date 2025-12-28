'use client';

import { useState } from 'react';
import { Player } from '@/types';
import { calculateAge, guessGender, formatBounty, getCriminalStatusColor, getAgeCategory } from '@/lib/utils';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface PlayerManagerProps {
  players: Player[];
  onPlayersUpdate: (players: Player[]) => void;
  tournamentStarted: boolean;
}

export default function PlayerManager({ players, onPlayersUpdate, tournamentStarted }: PlayerManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Count players without birthdates
  const playersWithoutBirthdate = players.filter(p => !p.birthdate || p.birthdate.trim() === '').length;
  
  // Form fields
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    surname: '',
    birthdate: '',
    currentAddress: '',
    meal: '',
    gender: 'M',
  });

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      surname: '',
      birthdate: '',
      currentAddress: '',
      meal: '',
      gender: 'M',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    // Validate required fields
    if (!formData.name || !formData.surname) {
      alert('Name and Surname are required!');
      return;
    }

    // Generate ID if not provided
    let playerId = formData.id ? parseInt(formData.id) : 0;
    if (!playerId || players.some(p => p.id === playerId)) {
      playerId = Math.max(0, ...players.map(p => p.id)) + 1;
    }

    const newPlayer: Player = {
      id: playerId,
      name: formData.name,
      surname: formData.surname,
      birthdate: formData.birthdate,
      currentAddress: formData.currentAddress,
      meal: formData.meal,
      paymentProof: 'ok',
      transferName: `${formData.name} ${formData.surname}`,
      age: formData.birthdate ? calculateAge(formData.birthdate) : 0,
      gender: (formData.gender as 'M' | 'F') || 'M',
      bounty: 20,
      hasSheriffBadge: true,
      criminalStatus: 'normal',
      wins: 0,
      losses: 0,
      draws: 0,
      opponentIds: [],
    };

    onPlayersUpdate([...players, newPlayer]);
    resetForm();
  };

  const handleEdit = (player: Player) => {
    setEditingId(player.id);
    setFormData({
      id: player.id.toString(),
      name: player.name,
      surname: player.surname,
      birthdate: player.birthdate,
      currentAddress: player.currentAddress,
      meal: player.meal,
      gender: player.gender,
    });
    setIsAdding(true);
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.surname) {
      alert('Name and Surname are required!');
      return;
    }

    const updatedPlayers = players.map(p => {
      if (p.id === editingId) {
        return {
          ...p,
          name: formData.name,
          surname: formData.surname,
          birthdate: formData.birthdate,
          currentAddress: formData.currentAddress,
          meal: formData.meal,
          age: formData.birthdate ? calculateAge(formData.birthdate) : 0,
          gender: (formData.gender as 'M' | 'F') || 'M',
        };
      }
      return p;
    });

    onPlayersUpdate(updatedPlayers);
    resetForm();
  };

  const handleDelete = (playerId: number) => {
    if (confirm('Are you sure you want to delete this player?')) {
      onPlayersUpdate(players.filter(p => p.id !== playerId));
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Add/Edit Form */}
      {isAdding ? (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              {editingId ? '✏️ Edit Player' : '➕ Add New Player'}
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Player Number"
                type="number"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={editingId !== null}
                placeholder="Auto-generated"
                helperText="Leave empty for auto-generation"
              />

              <TextField
                fullWidth
                required
                label="First Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., John"
              />

              <TextField
                fullWidth
                required
                label="Last Name"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                placeholder="e.g., Doe"
              />

              <TextField
                fullWidth
                label="Birth Date (DD/MM/YYYY)"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                placeholder="e.g., 15/05/2000"
                helperText="💡 Optional - can be added later"
              />

              <TextField
                fullWidth
                label="Address"
                value={formData.currentAddress}
                onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                placeholder="e.g., Quatre Bornes"
              />

              <FormControl fullWidth>
                <InputLabel>Meal Preference</InputLabel>
                <Select
                  value={formData.meal}
                  label="Meal Preference"
                  onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                >
                  <MenuItem value="">Normal</MenuItem>
                  <MenuItem value="Normal">Normal</MenuItem>
                  <MenuItem value="Veg">Vegetarian</MenuItem>
                  <MenuItem value="Vegan">Vegan</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<SaveIcon />}
                onClick={editingId ? handleUpdate : handleAdd}
              >
                {editingId ? 'Update Player' : 'Add Player'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                size="large"
                startIcon={<CancelIcon />}
                onClick={resetForm}
              >
                Cancel
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setIsAdding(true)}
            disabled={tournamentStarted}
          >
            Add New Player
          </Button>
        </Box>
      )}

      {/* Warning for missing birthdates */}
      {playersWithoutBirthdate > 0 && !tournamentStarted && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {playersWithoutBirthdate} {playersWithoutBirthdate === 1 ? 'player' : 'players'} missing birthdate
          </Typography>
          <Typography variant="body2">
            These players won't receive age-based bounty protections (U12, U16) until birthdates are added.
            Click "Edit" to add missing birthdates before starting the tournament.
          </Typography>
        </Alert>
      )}

      {/* Players List */}
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Players List ({players.length} players)
            </Typography>
            {playersWithoutBirthdate > 0 && (
              <Chip 
                label={`${playersWithoutBirthdate} missing birthdate`} 
                color="warning" 
                size="small"
                icon={<WarningIcon />}
              />
            )}
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Birth Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Age</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Meal</TableCell>
                  {!tournamentStarted && (
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {players.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tournamentStarted ? 8 : 9} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No players yet. Click "Add New Player" to start.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  players.map((player, idx) => (
                    <TableRow
                      key={player.id}
                      sx={{ 
                        '&:hover': { bgcolor: 'grey.50' },
                        bgcolor: idx % 2 === 0 ? 'white' : 'grey.50',
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {player.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {player.name} {player.surname}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {player.birthdate ? (
                          <Typography variant="body2" color="text.secondary">
                            {player.birthdate}
                          </Typography>
                        ) : (
                          <Chip 
                            label="Missing" 
                            color="warning" 
                            size="small"
                            icon={<WarningIcon />}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {player.age > 0 ? player.age : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {player.age > 0 ? (
                          <Chip 
                            label={getAgeCategory(player.age).label} 
                            size="small"
                            sx={{ 
                              bgcolor: getAgeCategory(player.age).color.includes('red') ? 'error.light' :
                                      getAgeCategory(player.age).color.includes('blue') ? 'info.light' :
                                      getAgeCategory(player.age).color.includes('green') ? 'success.light' :
                                      'grey.300',
                              color: 'text.primary',
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip 
                          label={player.gender === 'F' ? 'Female' : 'Male'}
                          size="small"
                          color={player.gender === 'F' ? 'error' : 'info'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {player.currentAddress || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {player.meal || 'Normal'}
                        </Typography>
                      </TableCell>
                      {!tournamentStarted && (
                        <TableCell>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(player)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(player.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {tournamentStarted && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ⚠️ Tournament has started. Player editing is disabled. Export data and restart to make changes.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

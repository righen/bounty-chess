'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'arbiter';
  created_at: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'arbiter' as 'admin' | 'arbiter',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!newUser.email || !newUser.password) {
        setError('Email and password are required');
        return;
      }

      // Create user via Supabase Auth Admin API
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.fullName,
            role: newUser.role,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess(`User ${newUser.email} created successfully!`);
      setDialogOpen(false);
      setNewUser({
        email: '',
        password: '',
        fullName: '',
        role: 'arbiter',
      });
      
      // Reload users
      await loadUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      // Delete from profiles (this should cascade via RLS)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      setSuccess(`User ${email} deleted successfully`);
      await loadUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          view="players" // No matching view, but required prop
          onViewChange={() => {}} // Not used here
          onReset={() => {}} // Not used here
          onExport={() => {}} // Not used here
          onImport={() => {}} // Not used here
          tournamentStarted={false}
          playersCount={0}
          currentRound={0}
          totalRounds={9}
          userRole={profile?.role || null}
        />

        {/* Main Content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            width: '100%',
            minHeight: '100vh',
            bgcolor: 'grey.50',
          }}
        >
          {/* Header */}
          <AppBar 
            position="sticky" 
            color="inherit" 
            elevation={1}
            sx={{ 
              bgcolor: 'background.paper',
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>

              <IconButton
                edge="start"
                onClick={() => router.push('/')}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>

              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                👥 User Management
              </Typography>

              <Button
                variant="contained"
                color="secondary"
                startIcon={<PersonAddIcon />}
                onClick={() => setDialogOpen(true)}
              >
                Create Arbiter
              </Button>
            </Toolbar>
          </AppBar>

          {/* Content */}
          <Box sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <Card>
              <CardContent>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Full Name</strong></TableCell>
                        <TableCell><strong>Role</strong></TableCell>
                        <TableCell><strong>Created</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
                              <CircularProgress size={24} sx={{ mr: 2 }} />
                              <Typography>Loading users...</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography color="text.secondary" sx={{ py: 3 }}>
                              No users found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.full_name || '—'}</TableCell>
                            <TableCell>
                              <Chip
                                label={user.role === 'admin' ? 'Administrator' : 'Arbiter'}
                                color={user.role === 'admin' ? 'secondary' : 'info'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="right">
                              {user.role !== 'admin' && (
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleDeleteUser(user.id, user.email)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Create User Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Create New Arbiter</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  <TextField
                    label="Email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    fullWidth
                    required
                    size="small"
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    fullWidth
                    required
                    size="small"
                    helperText="Minimum 6 characters"
                  />
                  <TextField
                    label="Full Name (Optional)"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCreateUser}
                  disabled={!newUser.email || !newUser.password}
                >
                  Create Arbiter
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}


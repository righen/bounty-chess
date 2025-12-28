'use client';

import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Box,
  Typography,
  Divider,
  Paper,
  Button,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  SportsEsports as GameIcon,
  Home as HomeIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  RestartAlt as ResetIcon,
  Logout as LogoutIcon,
  ManageAccounts as ManageAccountsIcon,
} from '@mui/icons-material';
import { useAuth, UserRole } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  sidebarOpen: boolean;
  view: 'setup' | 'leaderboard' | 'round' | 'players' | 'prizes';
  onViewChange: (view: 'setup' | 'leaderboard' | 'round' | 'players' | 'prizes') => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
  tournamentStarted: boolean;
  playersCount: number;
  currentRound: number;
  totalRounds: number;
  userRole: UserRole;
}

const DRAWER_WIDTH = 290;

export default function Sidebar({
  sidebarOpen,
  view,
  onViewChange,
  onReset,
  onExport,
  onImport,
  tournamentStarted,
  playersCount,
  currentRound,
  totalRounds,
  userRole,
}: SidebarProps) {
  const { signOut, profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Define menu items with role-based visibility
  const allMenuItems = [
    { id: 'players', label: 'Manage Players', icon: <PeopleIcon />, roles: ['admin'] },
    { id: 'leaderboard', label: 'Leaderboard', icon: <TrophyIcon />, roles: ['admin', 'arbiter'] },
    { id: 'round', label: 'Current Round', icon: <GameIcon />, roles: ['admin', 'arbiter'] },
    { id: 'prizes', label: 'Prizes', icon: <HomeIcon />, roles: ['admin', 'arbiter'] },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  const handleUserManagement = () => {
    router.push('/admin/users');
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: sidebarOpen ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'primary.main',
          color: 'white',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
        {/* Logo */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
            BOUNTY <Box component="span" sx={{ color: 'secondary.main' }}>CHESS</Box>
          </Typography>
        </Box>

        {/* Navigation */}
        <List sx={{ flex: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={view === item.id}
                onClick={() => onViewChange(item.id as any)}
                sx={{
                  borderRadius: 1,
                  color: 'white',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'secondary.main', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {/* Admin-only actions */}
          {userRole === 'admin' && (
            <>
              <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={handleUserManagement}
                  sx={{
                    borderRadius: 1,
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                  }}
                >
                  <ListItemIcon sx={{ color: 'secondary.main', minWidth: 40 }}>
                    <ManageAccountsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Manage Users" 
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={onImport}
                  sx={{
                    borderRadius: 1,
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                  }}
                >
                  <ListItemIcon sx={{ color: 'secondary.main', minWidth: 40 }}>
                    <UploadIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Import Data" 
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={onExport}
                  sx={{
                    borderRadius: 1,
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                  }}
                >
                  <ListItemIcon sx={{ color: 'secondary.main', minWidth: 40 }}>
                    <DownloadIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Export Data" 
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>

        {/* Bottom Section */}
        <Box>
          <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          
          {/* User Info */}
          <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 0.5 }}>
              Logged in as
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
              {profile?.email || 'User'}
            </Typography>
            <Chip 
              label={userRole === 'admin' ? 'Administrator' : 'Arbiter'} 
              size="small"
              sx={{ 
                bgcolor: userRole === 'admin' ? 'secondary.main' : 'info.main',
                color: userRole === 'admin' ? 'primary.main' : 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          </Box>

          <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
          
          {/* Tournament Info */}
          {tournamentStarted && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'secondary.main',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                  }}
                >
                  {currentRound}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    Round {currentRound}/{totalRounds}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {playersCount} Players
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Admin-only: Reset Button */}
          {userRole === 'admin' && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<ResetIcon />}
              onClick={onReset}
              sx={{
                mb: 1,
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                },
              }}
            >
              Reset Tournament
            </Button>
          )}

          {/* Logout Button */}
          <Button
            fullWidth
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              bgcolor: 'error.dark',
              color: 'white',
              '&:hover': {
                bgcolor: 'error.main',
              },
            }}
          >
            Logout
          </Button>

          {/* Footer */}
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              mt: 2, 
              color: 'rgba(255,255,255,0.5)' 
            }}
          >
            B4 Chess Club
            <br />
            Tournament System
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}

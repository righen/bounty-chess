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
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EmojiEvents as TournamentIcon,
  PersonAdd as PlayerPoolIcon,
  ManageAccounts as ManageAccountsIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';

const DRAWER_WIDTH = 280;

export default function AppSidebar() {
  const { signOut, profile, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Don't show sidebar on login or public pages
  if (pathname === '/login' || pathname?.startsWith('/public')) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard',
      roles: ['admin'] 
    },
    { 
      id: 'player-pool', 
      label: 'Player Pool', 
      icon: <PlayerPoolIcon />, 
      path: '/player-pool',
      roles: ['admin'] 
    },
    { 
      id: 'users', 
      label: 'Manage Users', 
      icon: <ManageAccountsIcon />, 
      path: '/admin/users',
      roles: ['admin'] 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    isAdmin && item.roles.includes('admin')
  );

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      anchor="left"
      open={true}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'primary.main',
          color: 'white',
          borderRight: 'none',
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
          {filteredMenuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => router.push(item.path)}
                sx={{
                  borderRadius: 1,
                  color: 'white',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'secondary.main', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
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
              label={isAdmin ? 'Administrator' : 'Arbiter'} 
              size="small"
              sx={{ 
                bgcolor: isAdmin ? 'secondary.main' : 'info.main',
                color: isAdmin ? 'primary.main' : 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          </Box>

          {/* Logout Button */}
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              color: 'white',
              bgcolor: 'rgba(255, 0, 0, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 0, 0, 0.2)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'error.light', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
            />
          </ListItemButton>

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


'use client';

import { Box } from '@mui/material';
import AppSidebar from './AppSidebar';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Don't show sidebar on login or public pages
  const showSidebar = user && pathname !== '/login' && !pathname?.startsWith('/public');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {showSidebar && <AppSidebar />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: showSidebar ? 'calc(100% - 280px)' : '100%',
          transition: 'width 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}


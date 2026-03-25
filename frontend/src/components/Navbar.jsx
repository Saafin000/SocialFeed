import {
  AppBar, Toolbar, Typography, Avatar, Box,
  IconButton, Tooltip, Chip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const initials = user?.username?.charAt(0).toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        color: '#1a1a1a',
      }}
    >
      <Toolbar sx={{ maxWidth: 700, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 }, minHeight: '60px !important' }}>
        {/* Logo */}
        <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              width: 32, height: 32, borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>S</Typography>
          </Box>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              fontSize: { xs: 18, sm: 20 },
            }}
          >
            SocialFeed
          </Typography>
        </Box>

        {/* User info + logout */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box display="flex" alignItems="center" gap={1}
            sx={{
              bgcolor: '#f5f5f5', borderRadius: 10, px: 1.5, py: 0.5,
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            <Avatar
              sx={{
                width: 28, height: 28, fontSize: 12, fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography variant="caption" fontWeight={700} display="block" lineHeight={1.2}>
                {user?.name || user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1.2} sx={{ fontSize: 10 }}>
                @{user?.username}
              </Typography>
            </Box>
          </Box>

          {/* Mobile avatar */}
          <Avatar
            sx={{
              width: 32, height: 32, fontSize: 13, fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: { xs: 'flex', sm: 'none' },
            }}
          >
            {initials}
          </Avatar>

          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{
                bgcolor: '#f5f5f5',
                '&:hover': { bgcolor: '#fee2e2', color: '#ef4444' },
                borderRadius: 2,
                p: 0.8,
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

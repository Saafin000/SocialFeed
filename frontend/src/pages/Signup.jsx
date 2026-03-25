import { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Link, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (form.username.length < 3) errs.username = 'At least 3 characters';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'At least 6 characters';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      login(data);
      toast.success(`Welcome to SocialFeed, ${data.username}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

  return (
    <div className="auth-bg">
      <Box width="100%" maxWidth={420}>
        {/* Logo */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', letterSpacing: '-1px' }}>
            SocialFeed
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
            Join thousands of people sharing their stories
          </Typography>
        </Box>

        <Card elevation={0} sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h6" fontWeight={700} mb={0.5}>
              Create account
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Fill in the details to get started.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
              <TextField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                fullWidth size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmailIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
              <TextField
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
              <TextField
                label="Password"
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPass(!showPass)} edge="end">
                        {showPass
                          ? <VisibilityOffOutlinedIcon fontSize="small" />
                          : <VisibilityOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 0.5, py: 1.3, borderRadius: 2,
                  textTransform: 'none', fontWeight: 700, fontSize: 15,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(102,126,234,0.5)' },
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
              </Button>
            </Box>

            <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" underline="hover"
                sx={{ fontWeight: 700, color: '#667eea' }}>
                Sign in
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default Signup;

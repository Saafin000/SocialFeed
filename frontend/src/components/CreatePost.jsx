import { useState, useRef } from 'react';
import {
  Box, Card, CardContent, TextField, Button,
  Avatar, IconButton, Typography, CircularProgress, Divider,
} from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const fileRef = useRef();

  const initials = user?.username?.charAt(0).toUpperCase() || 'U';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview('');
    fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!text.trim() && !image) {
      toast.error('Add some text or an image');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      if (image) formData.append('image', image);

      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onPostCreated(data);
      setText('');
      removeImage();
      setFocused(false);
      toast.success('Post shared!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const canPost = (text.trim() || image) && !loading;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: focused ? '#667eea' : '#e8e8e8',
        borderRadius: 3,
        mb: 2.5,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: focused ? '0 0 0 3px rgba(102,126,234,0.1)' : 'none',
        bgcolor: '#fff',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: '20px !important' } }}>
        <Box display="flex" gap={1.5} alignItems="flex-start">
          <Avatar
            sx={{
              width: 40, height: 40, fontSize: 15, fontWeight: 700, mt: 0.3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>

          <Box flex={1} minWidth={0}>
            <TextField
              fullWidth multiline minRows={focused ? 3 : 1}
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || user?.username}?`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: 15, lineHeight: 1.6,
                  '&::placeholder': { color: '#aaa' },
                },
              }}
            />

            {/* Image preview */}
            {preview && (
              <Box mt={1.5} position="relative" display="inline-block" maxWidth="100%">
                <img
                  src={preview} alt="preview"
                  style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 10, display: 'block', objectFit: 'cover' }}
                />
                <IconButton
                  size="small" onClick={removeImage}
                  sx={{
                    position: 'absolute', top: 6, right: 6,
                    bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', p: 0.4,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}

            {(focused || preview) && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <input
                      type="file" accept="image/*" ref={fileRef}
                      style={{ display: 'none' }} onChange={handleImageChange}
                    />
                    <IconButton
                      size="small" onClick={() => fileRef.current.click()}
                      sx={{
                        color: '#667eea', bgcolor: 'rgba(102,126,234,0.08)',
                        borderRadius: 2, p: 0.8,
                        '&:hover': { bgcolor: 'rgba(102,126,234,0.15)' },
                      }}
                    >
                      <ImageOutlinedIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Photo
                    </Typography>
                  </Box>

                  <Box display="flex" gap={1}>
                    <Button
                      size="small" onClick={() => { setFocused(false); setText(''); removeImage(); }}
                      sx={{ textTransform: 'none', color: 'text.secondary', borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained" size="small"
                      onClick={handleSubmit} disabled={!canPost}
                      endIcon={loading ? null : <SendIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{
                        borderRadius: 2, px: 2.5, textTransform: 'none', fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: 'none',
                        '&:hover': { boxShadow: '0 4px 12px rgba(102,126,234,0.4)' },
                        '&:disabled': { background: '#e0e0e0' },
                      }}
                    >
                      {loading ? <CircularProgress size={16} color="inherit" /> : 'Post'}
                    </Button>
                  </Box>
                </Box>
              </>
            )}

            {/* Collapsed state — show photo icon */}
            {!focused && !preview && (
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <input
                  type="file" accept="image/*" ref={fileRef}
                  style={{ display: 'none' }} onChange={handleImageChange}
                />
                <IconButton
                  size="small" onClick={() => fileRef.current.click()}
                  sx={{ color: '#667eea', borderRadius: 2, p: 0.5 }}
                >
                  <ImageOutlinedIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" color="text.secondary">Photo</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePost;

import { useState, useEffect, useCallback } from 'react';
import {
  Box, CircularProgress, Typography, Button,
  TextField, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const { data } = await api.get(`/posts?page=${pageNum}&limit=10`);
      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  const handlePostCreated = (newPost) => setPosts((prev) => [newPost, ...prev]);
  const handlePostDeleted = (postId) => setPosts((prev) => prev.filter((p) => p._id !== postId));

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchPosts(nextPage, true);
  };

  const filteredPosts = search.trim()
    ? posts.filter(
        (p) =>
          p.username?.toLowerCase().includes(search.toLowerCase()) ||
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.text?.toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Box textAlign="center">
          <CircularProgress sx={{ color: '#667eea' }} />
          <Typography variant="body2" color="text.secondary" mt={2}>Loading feed...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: { xs: 2, sm: 3 } }}>
      {/* Search bar */}
      <TextField
        fullWidth size="small"
        placeholder="Search posts, people..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: '#aaa' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2.5,
          '& .MuiOutlinedInput-root': {
            borderRadius: 5, backgroundColor: '#fff',
            '& fieldset': { borderColor: '#e8e8e8' },
            '&:hover fieldset': { borderColor: '#667eea' },
            '&.Mui-focused fieldset': { borderColor: '#667eea' },
          },
        }}
      />

      {/* Create post */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Feed */}
      {filteredPosts.length === 0 ? (
        <Box
          textAlign="center" mt={6} py={6}
          sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #ebebeb' }}
        >
          <Typography fontSize={36} mb={1}>
            {search ? '🔍' : '✨'}
          </Typography>
          <Typography fontWeight={600} color="text.primary" mb={0.5}>
            {search ? 'No results found' : 'No posts yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search ? `Nothing matched "${search}"` : 'Be the first to share something!'}
          </Typography>
        </Box>
      ) : (
        filteredPosts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
        ))
      )}

      {/* Load more */}
      {page < totalPages && !search && (
        <Box display="flex" justifyContent="center" mt={1} mb={4}>
          <Button
            variant="outlined" onClick={loadMore} disabled={loadingMore}
            sx={{
              borderRadius: 5, textTransform: 'none', px: 5, fontWeight: 600,
              borderColor: '#667eea', color: '#667eea',
              '&:hover': { bgcolor: 'rgba(102,126,234,0.05)', borderColor: '#667eea' },
            }}
          >
            {loadingMore ? <CircularProgress size={20} sx={{ color: '#667eea' }} /> : 'Load more'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Feed;

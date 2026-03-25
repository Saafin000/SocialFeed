import { useState } from 'react';
import {
  Card, CardContent, CardActions, Avatar, Box, Typography,
  IconButton, TextField, Button, Divider, Collapse,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const PostCard = ({ post, onDelete }) => {
  const { user, updateFollowing } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isLiked = user ? likes.includes(user.username) : false;
  const isOwner = user?._id === post.userId;
  const initials = post.username?.charAt(0).toUpperCase() || 'U';
  const displayName = post.name || post.username;

  const isFollowing = user?.following?.some(
    (id) => id === post.userId || id?.toString() === post.userId?.toString()
  ) || false;

  const handleLike = async () => {
    if (!user) return;
    const wasLiked = likes.includes(user.username);
    setLikes(wasLiked ? likes.filter((u) => u !== user.username) : [...likes, user.username]);
    try {
      const { data } = await api.put(`/posts/${post._id}/like`);
      setLikes(data.likes);
    } catch {
      setLikes(likes);
      toast.error('Failed to update like');
    }
  };

  const handleFollow = async () => {
    if (!user || followLoading) return;
    setFollowLoading(true);
    try {
      const { data } = await api.put(`/users/${post.userId}/follow`);
      updateFollowing(data.followingList);
      toast.success(data.following ? `Following ${displayName}` : `Unfollowed ${displayName}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update follow');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comment`, { text: commentText });
      setComments((prev) => [...prev, data]);
      setCommentText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete(post._id);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${displayName}'s post`, text: post.text || 'Check out this post!' });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #ebebeb',
        borderRadius: 3,
        mb: 2,
        bgcolor: '#fff',
        '&:hover': { borderColor: '#d0d0d0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      <CardContent sx={{ pb: 1, px: { xs: 2, sm: 2.5 } }}>
        {/* Post header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" gap={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 44, height: 44, fontSize: 17, fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                flexShrink: 0,
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700} lineHeight={1.3} fontSize={14}>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 500 }} lineHeight={1.2}>
                @{post.username}
              </Typography>
              <Typography variant="caption" color="text.disabled" display="block" lineHeight={1.4} fontSize={11}>
                {formatDateTime(post.createdAt)}
              </Typography>
            </Box>
          </Box>

          {/* Follow / Delete */}
          <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
            {!isOwner && (
              <Button
                size="small"
                variant={isFollowing ? 'outlined' : 'contained'}
                onClick={handleFollow}
                disabled={followLoading}
                sx={{
                  borderRadius: 5, textTransform: 'none', fontWeight: 700,
                  fontSize: 12, px: 2, py: 0.5, minWidth: 80,
                  ...(isFollowing
                    ? { borderColor: '#667eea', color: '#667eea', '&:hover': { bgcolor: 'rgba(102,126,234,0.05)' } }
                    : {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: 'none',
                        '&:hover': { boxShadow: '0 4px 12px rgba(102,126,234,0.35)' },
                      }),
                }}
              >
                {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
            {isOwner && (
              <IconButton
                size="small" onClick={handleDelete}
                sx={{ color: '#ccc', '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' }, borderRadius: 2 }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Post text */}
        {post.text && (
          <Typography
            variant="body2"
            sx={{ mt: 1.5, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: 14, color: '#2d2d2d' }}
          >
            {post.text}
          </Typography>
        )}

        {/* Post image */}
        {post.image && (
          <Box mt={1.5} borderRadius={2.5} overflow="hidden" bgcolor="#f5f5f5">
            <img
              src={post.image} alt="post"
              style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }}
            />
          </Box>
        )}
      </CardContent>

      {/* Counts row */}
      {(likes.length > 0 || comments.length > 0) && (
        <Box px={{ xs: 2, sm: 2.5 }} pb={0.5}>
          <Typography variant="caption" color="text.secondary" fontSize={12}>
            {likes.length > 0 && `${likes.length} like${likes.length > 1 ? 's' : ''}`}
            {likes.length > 0 && comments.length > 0 && ' · '}
            {comments.length > 0 && (
              <Box
                component="span"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => setShowComments(!showComments)}
              >
                {comments.length} comment{comments.length > 1 ? 's' : ''}
              </Box>
            )}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mx: { xs: 2, sm: 2.5 } }} />

      {/* Action buttons */}
      <CardActions sx={{ px: 1, py: 0.5, justifyContent: 'space-between' }}>
        {[
          {
            icon: isLiked ? <FavoriteIcon sx={{ fontSize: 18, color: '#ef4444' }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />,
            label: 'Like',
            onClick: handleLike,
            active: isLiked,
            color: isLiked ? '#ef4444' : '#65676b',
          },
          {
            icon: <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />,
            label: 'Comment',
            onClick: () => setShowComments(!showComments),
            active: showComments,
            color: showComments ? '#667eea' : '#65676b',
          },
          {
            icon: <ShareOutlinedIcon sx={{ fontSize: 18 }} />,
            label: 'Share',
            onClick: handleShare,
            active: false,
            color: '#65676b',
          },
        ].map(({ icon, label, onClick, color }) => (
          <Button
            key={label}
            startIcon={icon}
            onClick={onClick}
            size="small"
            sx={{
              textTransform: 'none', color, fontWeight: 600,
              borderRadius: 2, flex: 1, fontSize: 13,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
            }}
          >
            {label}
          </Button>
        ))}
      </CardActions>

      {/* Comments section */}
      <Collapse in={showComments}>
        <Divider sx={{ mx: { xs: 2, sm: 2.5 } }} />
        <Box px={{ xs: 2, sm: 2.5 }} py={1.5}>
          {/* Existing comments */}
          {comments.map((c) => (
            <Box key={c._id} display="flex" gap={1} mb={1.5} alignItems="flex-start">
              <Avatar sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 700, bgcolor: '#e8eaf6', color: '#667eea', flexShrink: 0 }}>
                {c.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ bgcolor: '#f5f6f7', borderRadius: 2.5, px: 1.5, py: 1, flex: 1 }}>
                <Typography variant="caption" fontWeight={700} display="block" color="#1a1a1a">
                  {c.username}
                </Typography>
                <Typography variant="caption" color="text.primary" lineHeight={1.5}>
                  {c.text}
                </Typography>
              </Box>
            </Box>
          ))}

          {/* Add comment input */}
          <Box component="form" onSubmit={handleComment} display="flex" gap={1} alignItems="center" mt={comments.length > 0 ? 0.5 : 0}>
            <Avatar
              sx={{
                width: 30, height: 30, fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <TextField
              fullWidth size="small"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 5, fontSize: 13, backgroundColor: '#f5f6f7',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: '1.5px solid #667eea' },
                },
              }}
              InputProps={{
                endAdornment: commentText.trim() ? (
                  <Button
                    type="submit" size="small" disabled={submitting}
                    sx={{
                      minWidth: 'auto', textTransform: 'none', fontWeight: 700,
                      fontSize: 12, color: '#667eea', pr: 0.5,
                    }}
                  >
                    Post
                  </Button>
                ) : null,
              }}
            />
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
};

export default PostCard;

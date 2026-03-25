const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const { upload, isCloudinaryConfigured } = require('../config/cloudinary');

// @route   GET /api/posts
// @desc    Get all posts (paginated), newest first
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/posts
// @desc    Create a new post (text, image, or both)
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    // Cloudinary gives req.file.path, local storage gives req.file.filename
    let imageUrl = '';
    if (req.file) {
      imageUrl = isCloudinaryConfigured
        ? req.file.path
        : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // At least one of text or image must be provided
    if (!text && !imageUrl) {
      return res.status(400).json({ message: 'Post must have text or an image' });
    }

    const post = await Post.create({
      userId: req.user._id,
      username: req.user.username,
      name: req.user.name || req.user.username,
      text: text || '',
      image: imageUrl,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Like or unlike a post
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const username = req.user.username;
    const alreadyLiked = post.likes.includes(username);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((u) => u !== username);
    } else {
      // Like
      post.likes.push(username);
    }

    await post.save();
    res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      username: req.user.username,
      userId: req.user._id,
      text: text.trim(),
    };

    post.comments.push(comment);
    await post.save();

    // Return the newly added comment
    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post (only by owner)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

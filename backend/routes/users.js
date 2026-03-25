const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   PUT /api/users/:id/follow
// @desc    Follow or unfollow a user (toggle)
// @access  Private
router.put('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === req.params.id
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user._id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      following: !isFollowing,
      followingList: currentUser.following,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/me
// @desc    Get current user's following list
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('following followers');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

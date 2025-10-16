const express = require('express');
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const logger = require('../services/logger');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/comments/:movieSlug
 * @desc    Get comments for a specific movie
 * @access  Public
 */
router.get('/:movieSlug', async (req, res) => {
  try {
    const { movieSlug } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort criteria
    let sortCriteria = {};
    switch (sort) {
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'top':
        sortCriteria = { netVotes: -1, createdAt: -1 };
        break;
      case 'hot':
        // Comments with most recent activity
        sortCriteria = { upvotes: -1, createdAt: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }
    
    // Get top-level comments (not replies)
    const comments = await Comment.find({
      movieSlug,
      isDeleted: false,
      parentCommentId: null
    })
    .sort(sortCriteria)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
    
    // Get total count
    const totalComments = await Comment.countDocuments({
      movieSlug,
      isDeleted: false,
      parentCommentId: null
    });
    
    // Get replies for each comment (limit to 3 most recent)
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentCommentId: comment._id,
          isDeleted: false
        })
        .sort({ createdAt: 1 })
        .limit(3)
        .lean();
        
        return {
          ...comment,
          replies,
          replyCount: await Comment.countDocuments({
            parentCommentId: comment._id,
            isDeleted: false
          })
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalComments,
          pages: Math.ceil(totalComments / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/comments
 * @desc    Create a new comment
 * @access  Public (with optional auth)
 */
router.post('/', async (req, res) => {
  try {
    const {
      movieId,
      movieSlug,
      content,
      parentCommentId = null,
      username = 'Anonymous',
      fullName = '' // Thêm fullName vào request body
    } = req.body;
    
    // Basic validation
    if (!movieSlug || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Movie slug and content are required'
      });
    }
    
    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment is too long (max 1000 characters)'
      });
    }
    
    // Get user info if authenticated
    const userId = req.user ? req.user.id : null;
    const userAvatar = req.user ? req.user.avatar : '';
    const userFullName = req.user ? req.user.fullName : fullName; // Lấy fullName từ user hoặc từ request
    
    // Nếu không có fullName, thử tìm từ User database bằng username
    let finalFullName = userFullName;
    if (!finalFullName || !finalFullName.trim()) {
      try {
        const User = require('../models/User');
        const userDoc = await User.findOne({ username: username.trim() }).select('fullName');
        if (userDoc && userDoc.fullName) {
          finalFullName = userDoc.fullName;
          console.log(`Found fullName from User database: ${finalFullName}`);
        }
      } catch (err) {
        console.log('Could not find user in database:', err.message);
      }
    }
    
    // Create comment
    const comment = new Comment({
      movieId: movieId || movieSlug,
      movieSlug,
      userId,
      username: username.trim(),
      fullName: (finalFullName && finalFullName.trim()) || username.trim(), // Lưu fullName vào database
      avatar: userAvatar,
      content: content.trim(),
      parentCommentId,
      userAgent: req.get('User-Agent') || '',
      ipAddress: req.ip || req.connection.remoteAddress || ''
    });
    
    await comment.save();
    
    // Populate the saved comment
    const savedComment = await Comment.findById(comment._id).lean();
    
    logger.info(`New comment created: ${comment._id} for movie: ${movieSlug}`);
    
    res.status(201).json({
      success: true,
      data: savedComment,
      message: 'Comment posted successfully'
    });
  } catch (error) {
    logger.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/comments/:commentId/vote
 * @desc    Vote on a comment (upvote/downvote)
 * @access  Public
 */
router.put('/:commentId/vote', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { action } = req.body; // 'upvote', 'downvote', or 'remove'
    
    if (!['upvote', 'downvote', 'remove'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote action'
      });
    }
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Simple voting system (could be enhanced with user-specific voting)
    switch (action) {
      case 'upvote':
        comment.upvotes += 1;
        break;
      case 'downvote':
        comment.downvotes += 1;
        break;
      case 'remove':
        // Reset votes (simplified)
        comment.upvotes = Math.max(0, comment.upvotes - 1);
        break;
    }
    
    await comment.save();
    
    res.json({
      success: true,
      data: {
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
        netVotes: comment.netVotes
      }
    });
  } catch (error) {
    logger.error('Vote comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to vote on comment',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/comments/top/:movieSlug
 * @desc    Get top comments for a movie (for TopComments component)
 * @access  Public
 */
router.get('/top/:movieSlug', async (req, res) => {
  try {
    const { movieSlug } = req.params;
    const { limit = 5 } = req.query;
    
    // Get top comments by votes and recency
    const topComments = await Comment.find({
      movieSlug,
      isDeleted: false,
      parentCommentId: null
    })
    .sort({ 
      netVotes: -1, 
      upvotes: -1, 
      createdAt: -1 
    })
    .limit(parseInt(limit))
    .lean();
    
    res.json({
      success: true,
      data: topComments
    });
  } catch (error) {
    logger.error('Get top comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top comments',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/comments/stats/:movieSlug
 * @desc    Get comment statistics for a movie
 * @access  Public
 */
router.get('/stats/:movieSlug', async (req, res) => {
  try {
    const { movieSlug } = req.params;
    
    const stats = await Comment.aggregate([
      {
        $match: {
          movieSlug,
          isDeleted: false,
          parentCommentId: null
        }
      },
      {
        $group: {
          _id: null,
          totalComments: { $sum: 1 },
          totalUpvotes: { $sum: '$upvotes' },
          totalDownvotes: { $sum: '$downvotes' },
          avgRating: { $avg: { $subtract: ['$upvotes', '$downvotes'] } }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalComments: 0,
      totalUpvotes: 0,
      totalDownvotes: 0,
      avgRating: 0
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get comment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comment statistics',
      error: error.message
    });
  }
});

module.exports = router;

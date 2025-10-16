const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  movieId: {
    type: String,
    required: true,
    index: true
  },
  movieSlug: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: false, // Allow anonymous comments
    index: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  replies: [{
    type: String, // Reference to other comment IDs
    ref: 'Comment'
  }],
  parentCommentId: {
    type: String,
    default: null, // null for top-level comments
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  userAgent: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  strict: false
});

// Indexes for efficient querying
commentSchema.index({ movieSlug: 1, createdAt: -1 });
commentSchema.index({ movieId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ upvotes: -1, createdAt: -1 }); // For top comments
commentSchema.index({ isDeleted: 1 });

// Virtual for net votes
commentSchema.virtual('netVotes').get(function() {
  return this.upvotes - this.downvotes;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Ensure virtual fields are serialized
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

// Pre-save middleware
commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

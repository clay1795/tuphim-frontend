const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema - CHỈ lưu user data, KHÔNG lưu movie data
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Personal data (KHÔNG lưu movie data)
  preferences: {
    favoriteGenres: [{
      type: String,
      trim: true
    }],
    watchHistory: [{
      movieId: {
        type: String,
        required: true
      },
      movieSlug: String,
      movieName: String,
      originalName: String,
      poster_url: String,
      thumb_url: String,
      banner_url: String,
      watchedAt: {
        type: Date,
        default: Date.now
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }],
    watchlist: [{
      movieId: String,
      movieSlug: String,
      movieName: String,
      originalName: String,
      poster_url: String,
      thumb_url: String,
      banner_url: String,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    favorites: [{
      movieId: String,
      movieSlug: String,
      movieName: String,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    settings: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto'
      },
      language: {
        type: String,
        default: 'vi'
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        push: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ 'preferences.watchlist.movieId': 1 });
userSchema.index({ 'preferences.favorites.movieId': 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

// Virtual for user stats
userSchema.virtual('stats').get(function() {
  return {
    watchlistCount: this.preferences.watchlist.length,
    favoritesCount: this.preferences.favorites.length,
    watchHistoryCount: this.preferences.watchHistory.length,
    accountAge: Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)) // days
  };
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);


// Backend Server cho TupPhim - Minimal setup cho external API
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tuphim', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  preferences: {
    favoriteGenres: [String],
    watchHistory: [{ movieId: String, watchedAt: Date }],
    watchlist: [String]
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;

    // Validation
    if (!email || !password || !username || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      username,
      fullName,
      role: email === 'admin@tuphim.com' ? 'admin' : 'user'
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User routes
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, username, preferences } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Watchlist routes
app.get('/api/users/watchlist', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('preferences.watchlist');
    res.json({ watchlist: user.preferences.watchlist || [] });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/users/watchlist', authenticateToken, async (req, res) => {
  try {
    const { movieId } = req.body;
    
    if (!movieId) {
      return res.status(400).json({ message: 'Movie ID is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user.preferences.watchlist) {
      user.preferences.watchlist = [];
    }

    if (!user.preferences.watchlist.includes(movieId)) {
      user.preferences.watchlist.push(movieId);
      await user.save();
    }

    res.json({ 
      message: 'Movie added to watchlist',
      watchlist: user.preferences.watchlist
    });

  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/users/watchlist/:movieId', authenticateToken, async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const user = await User.findById(req.user.userId);
    if (user.preferences.watchlist) {
      user.preferences.watchlist = user.preferences.watchlist.filter(
        id => id !== movieId
      );
      await user.save();
    }

    res.json({ 
      message: 'Movie removed from watchlist',
      watchlist: user.preferences.watchlist
    });

  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Watch history routes
app.get('/api/users/history', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('preferences.watchHistory');
    res.json({ history: user.preferences.watchHistory || [] });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/users/history', authenticateToken, async (req, res) => {
  try {
    const { movieId } = req.body;
    
    if (!movieId) {
      return res.status(400).json({ message: 'Movie ID is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user.preferences.watchHistory) {
      user.preferences.watchHistory = [];
    }

    // Remove existing entry if exists
    user.preferences.watchHistory = user.preferences.watchHistory.filter(
      entry => entry.movieId !== movieId
    );

    // Add new entry
    user.preferences.watchHistory.unshift({
      movieId,
      watchedAt: new Date()
    });

    // Keep only last 100 entries
    if (user.preferences.watchHistory.length > 100) {
      user.preferences.watchHistory = user.preferences.watchHistory.slice(0, 100);
    }

    await user.save();

    res.json({ 
      message: 'History updated',
      history: user.preferences.watchHistory
    });

  } catch (error) {
    console.error('Update history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Movie proxy routes (với caching)
const movieCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

app.get('/api/movies/search', async (req, res) => {
  try {
    const { q, page = 1, category, country, year, type, sort = 'modified_time', sortType = 'desc' } = req.query;
    
    // Create cache key
    const cacheKey = `search_${JSON.stringify(req.query)}`;
    const cached = movieCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    // Build external API URL
    const externalUrl = new URL('https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3');
    externalUrl.searchParams.append('page', page);
    if (sort) externalUrl.searchParams.append('sort', sort);
    if (sortType) externalUrl.searchParams.append('sortType', sortType);

    // Make request to external API
    const response = await fetch(externalUrl.toString());
    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    movieCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    res.json(data);

  } catch (error) {
    console.error('Movie search error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch movies',
      error: error.message
    });
  }
});

app.get('/api/movies/detail/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Check cache
    const cacheKey = `detail_${slug}`;
    const cached = movieCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    // Make request to external API
    const response = await fetch(`https://phimapi.com/phim/${slug}`);
    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    movieCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    res.json(data);

  } catch (error) {
    console.error('Movie detail error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch movie details',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TupPhim Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

# Implementation Roadmap - TupPhim Upgrade

## 🎯 **ROADMAP TỔNG QUAN**

### **Phase 1: Backend Foundation (Week 1-2)**
- Database setup & authentication
- API endpoints implementation
- Security & validation

### **Phase 2: Performance Optimization (Week 3-4)**
- Caching implementation
- Image optimization
- Frontend performance

### **Phase 3: Scalability (Week 5-6)**
- Load balancing & CDN
- Monitoring & analytics
- Infrastructure scaling

### **Phase 4: Production Launch (Week 7-8)**
- Deployment & testing
- Launch & optimization

---

## 📅 **WEEK 1: BACKEND CORE**

### **Day 1-2: Database & Authentication Setup**

#### **Step 1: MongoDB Atlas Setup**
```bash
# 1. Create MongoDB Atlas account
# 2. Create production cluster
# 3. Setup user permissions
# 4. Get connection string
# 5. Test connection
```

#### **Step 2: Authentication System**
```javascript
// User Schema
const userSchema = {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  preferences: {
    favoriteGenres: [String],
    watchHistory: [{ movieId: String, watchedAt: Date }],
    watchlist: [String],
    favorites: [String]
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
};
```

#### **Step 3: JWT Implementation**
```javascript
// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

// Token generation
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
  
  return { accessToken, refreshToken };
};
```

### **Day 3-4: API Endpoints Implementation**

#### **Authentication APIs**
```javascript
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;
    
    // Validation
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      username,
      fullName
    });
    
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    res.status(201).json({
      message: 'User created successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
```

#### **User Management APIs**
```javascript
// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -verificationToken -resetPasswordToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
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
    res.status(500).json({ message: 'Internal server error' });
  }
};
```

### **Day 5-7: Movie Features Implementation**

#### **Watchlist APIs**
```javascript
// GET /api/watchlist
const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('preferences.watchlist');
    
    res.json({ 
      watchlist: user.preferences.watchlist || [] 
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/watchlist
const addToWatchlist = async (req, res) => {
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
    res.status(500).json({ message: 'Internal server error' });
  }
};
```

---

## 📅 **WEEK 2: SECURITY & VALIDATION**

### **Day 8-10: Security Implementation**

#### **Input Validation with Joi**
```javascript
// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  fullName: Joi.string().min(2).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    next();
  };
};
```

#### **Security Headers with Helmet**
```javascript
// Security configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://phimimg.com", "https://phimapi.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://phimapi.com"],
      mediaSrc: ["'self'", "https://player.phimapi.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
```

#### **Rate Limiting**
```javascript
// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.'
});

app.use('/api/auth/', authLimiter);
```

### **Day 11-14: Error Handling & Logging**

#### **Global Error Handler**
```javascript
// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error
  logger.error(err);
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new AppError(message, 400);
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```

#### **Logging System with Winston**
```javascript
// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'tuphim-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

---

## 📅 **WEEK 3: PERFORMANCE OPTIMIZATION**

### **Day 15-17: Advanced Caching**

#### **Redis Implementation**
```javascript
// Redis configuration
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Store original res.json
      const originalJson = res.json;
      res.json = function(data) {
        // Cache the response
        client.setex(key, duration, JSON.stringify(data));
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Usage example
app.get('/api/movies/trending', cache(300), getTrendingMovies);
```

#### **Multi-Level Caching Strategy**
```javascript
// L1: In-memory cache (5 minutes)
const memoryCache = new Map();

// L2: Redis cache (1 hour)
const redisCache = {
  get: async (key) => {
    try {
      return await client.get(key);
    } catch (error) {
      return null;
    }
  },
  set: async (key, value, ttl = 3600) => {
    try {
      await client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }
};

// L3: Database cache (24 hours)
const dbCache = {
  get: async (key) => {
    const cached = await Cache.findOne({ key });
    if (cached && cached.expiresAt > new Date()) {
      return cached.data;
    }
    return null;
  },
  set: async (key, value, ttl = 86400) => {
    await Cache.findOneAndUpdate(
      { key },
      { 
        key, 
        data: value, 
        expiresAt: new Date(Date.now() + ttl * 1000) 
      },
      { upsert: true }
    );
  }
};
```

### **Day 18-21: Image & Asset Optimization**

#### **Image Optimization Service**
```javascript
// Image optimization with Sharp
const sharp = require('sharp');

const optimizeImage = async (inputBuffer, options = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'webp'
  } = options;
  
  return await sharp(inputBuffer)
    .resize(width, height, { fit: 'inside' })
    .webp({ quality })
    .toBuffer();
};

// Image processing endpoint
app.post('/api/images/optimize', upload.single('image'), async (req, res) => {
  try {
    const optimizedBuffer = await optimizeImage(req.file.buffer);
    
    res.set('Content-Type', 'image/webp');
    res.send(optimizedBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Image optimization failed' });
  }
});
```

#### **Frontend Image Optimization**
```javascript
// Image component with lazy loading
const OptimizedImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0 }}
          {...props}
        />
      )}
    </div>
  );
};
```

---

## 📅 **WEEK 4: FRONTEND PERFORMANCE**

### **Day 22-24: React Optimization**

#### **Code Splitting & Lazy Loading**
```javascript
// Route-based code splitting
const Home = lazy(() => import('./pages/Home'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const Search = lazy(() => import('./pages/Search'));
const Profile = lazy(() => import('./pages/Profile'));

// Component lazy loading
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));

// App component with Suspense
const App = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:slug" element={<MovieDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/*" element={<AdminPanel />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
```

#### **State Management Optimization**
```javascript
// Context optimization with useMemo
const MovieContext = createContext();

const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Memoize context value
  const contextValue = useMemo(() => ({
    movies,
    setMovies,
    loading,
    setLoading
  }), [movies, loading]);
  
  return (
    <MovieContext.Provider value={contextValue}>
      {children}
    </MovieContext.Provider>
  );
};

// Component optimization with useCallback
const MovieCard = ({ movie, onAddToWatchlist }) => {
  const handleAddToWatchlist = useCallback(() => {
    onAddToWatchlist(movie.id);
  }, [movie.id, onAddToWatchlist]);
  
  return (
    <div className="movie-card">
      <img src={movie.poster} alt={movie.title} />
      <h3>{movie.title}</h3>
      <button onClick={handleAddToWatchlist}>
        Add to Watchlist
      </button>
    </div>
  );
};
```

### **Day 25-28: Performance Monitoring**

#### **Performance Metrics Collection**
```javascript
// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      // Core Web Vitals
      const metrics = {
        FCP: entry.firstContentfulPaint,
        LCP: entry.largestContentfulPaint,
        FID: entry.firstInputDelay,
        CLS: entry.cumulativeLayoutShift
      };
      
      // Send to analytics
      sendToAnalytics(metrics);
    }
  }
});

performanceObserver.observe({ entryTypes: ['navigation'] });

// Bundle size monitoring
const bundleAnalyzer = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

---

## 📅 **WEEK 5-6: SCALABILITY**

### **Load Balancing & CDN Setup**

#### **Nginx Load Balancer Configuration**
```nginx
upstream backend {
    server backend1.example.com:3001;
    server backend2.example.com:3001;
    server backend3.example.com:3001;
}

server {
    listen 80;
    server_name tuphim.com;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### **CloudFlare CDN Configuration**
```javascript
// CloudFlare configuration
const cloudflareConfig = {
  zoneId: process.env.CLOUDFLARE_ZONE_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
  
  // Cache rules
  cacheRules: [
    {
      url: '*.jpg',
      ttl: 2592000, // 30 days
      cacheLevel: 'cache_everything'
    },
    {
      url: '*.webp',
      ttl: 2592000, // 30 days
      cacheLevel: 'cache_everything'
    },
    {
      url: '/api/movies/*',
      ttl: 3600, // 1 hour
      cacheLevel: 'cache_everything'
    }
  ]
};
```

---

## 📅 **WEEK 7-8: PRODUCTION LAUNCH**

### **Deployment & Testing**

#### **CI/CD Pipeline with GitHub Actions**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Production
        run: |
          # Deploy backend
          ssh ${{ secrets.PROD_SERVER }} 'cd /app && git pull && npm install && pm2 restart all'
          
          # Deploy frontend
          npm run build
          rsync -avz dist/ ${{ secrets.PROD_SERVER }}:/var/www/tuphim/
```

#### **Comprehensive Testing Suite**
```javascript
// E2E tests with Playwright
const { test, expect } = require('@playwright/test');

test('User can search and watch movies', async ({ page }) => {
  await page.goto('https://tuphim.com');
  
  // Search for a movie
  await page.fill('[data-testid="search-input"]', 'thước');
  await page.click('[data-testid="search-button"]');
  
  // Wait for results
  await page.waitForSelector('[data-testid="movie-card"]');
  
  // Click on first movie
  await page.click('[data-testid="movie-card"]:first-child');
  
  // Verify movie detail page
  await expect(page).toHaveURL(/\/movie\//);
  await expect(page.locator('[data-testid="movie-title"]')).toBeVisible();
});
```

---

## 🎯 **SUCCESS METRICS**

### **Performance Targets:**
- **Lighthouse Score:** 90+
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Time to Interactive:** < 3.5s

### **Scalability Targets:**
- **Concurrent Users:** 10,000+
- **API Response Time:** < 200ms
- **Uptime:** 99.9%
- **Error Rate:** < 0.1%

### **Security Targets:**
- **Security Score:** A+
- **Vulnerability Scan:** 0 critical
- **Penetration Test:** Passed
- **Compliance:** GDPR, CCPA

Bạn có muốn tôi bắt đầu implement từ giai đoạn nào trước không?

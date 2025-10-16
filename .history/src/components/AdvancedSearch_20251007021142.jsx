import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { instantSearchApi } from '../services/instantSearchApi';
import SeparatedMovieCard from './SeparatedMovieCard';
import SkeletonLoader from './SkeletonLoader';

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchStats, setSearchStats] = useState({ movies: 0, categories: 0, countries: 0 });
  const [searchMode, setSearchMode] = useState('instant'); // instant, extended, full
  const [fullDatabaseLoading, setFullDatabaseLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [showAllMovies, setShowAllMovies] = useState(false); // eslint-disable-line no-unused-vars
  const [cacheStatus, setCacheStatus] = useState({ hasCache: false, cacheAge: null, fromCache: false });
  
  // Search filters
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    country: searchParams.get('country') || '',
    year: searchParams.get('year') || '',
    type: searchParams.get('type') || '',
    sort: searchParams.get('sort') || 'modified_time',
    sortType: searchParams.get('sortType') || 'desc'
  });

  // Available options
  const categories = [
    'Hành Động', 'Cổ Trang', 'Chiến Tranh', 'Viễn Tưởng', 'Kinh Dị', 'Tài Liệu',
    'Bí Ẩn', 'Phim 18+', 'Tình Cảm', 'Tâm Lý', 'Thể Thao', 'Phiêu Lưu',
    'Âm Nhạc', 'Gia Đình', 'Học Đường', 'Hài Hước', 'Hình Sự', 'Võ Thuật',
    'Khoa Học', 'Thần Thoại', 'Chính Kịch', 'Kinh Điển'
  ];

  const countries = [
    'Trung Quốc', 'Thái Lan', 'Hồng Kông', 'Pháp', 'Đức', 'Hà Lan', 'Mexico',
    'Thụy Điển', 'Philippines', 'Đan Mạch', 'Thụy Sĩ', 'Ukraina', 'Hàn Quốc',
    'Âu Mỹ', 'Ấn Độ', 'Canada', 'Tây Ban Nha', 'Indonesia', 'Ba Lan', 'Malaysia',
    'Bồ Đào Nha', 'UAE', 'Châu Phi', 'Ả Rập', 'Xê Út', 'Nhật Bản', 'Đài Loan',
    'Anh', 'Thổ Nhĩ Kỳ', 'Nga', 'Úc', 'Brazil', 'Ý', 'Na Uy', 'Nam Phi', 'Việt Nam'
  ];

  const years = Array.from({ length: 27 }, (_, i) => 2026 - i);
  const types = ['Phim Bộ', 'Phim Lẻ', 'TV Shows', 'Hoạt Hình'];
  
  const sortOptions = [
    { value: 'modified_time', label: 'Mới cập nhật' },
    { value: 'created_time', label: 'Thời gian đăng' },
    { value: 'year', label: 'Năm sản xuất' },
    { value: 'name', label: 'Tên phim' },
    { value: 'view', label: 'Lượt xem' }
  ];

  const performSearch = async (page = 1, newFilters = filters, mode = searchMode) => {
    try {
      setLoading(true);
      console.log('Searching with filters:', newFilters, 'mode:', mode);
      
      // Build search options
      const searchOptions = {
        page,
        limit: 20,
        category: newFilters.category,
        country: newFilters.country,
        year: newFilters.year,
        type: newFilters.type,
        sort: newFilters.sort,
        sortType: newFilters.sortType
      };

      let data;
      
      // Sử dụng instant search API
      if (mode === 'instant') {
        console.log('Using instant search');
        data = await instantSearchApi.instantSearch(newFilters.keyword, searchOptions);
      } else if (mode === 'extended') {
        console.log('Using extended search');
        data = await instantSearchApi.extendedSearch(newFilters.keyword, searchOptions);
      } else if (mode === 'full') {
        console.log('Using full database search');
        data = await instantSearchApi.getAllMovies(searchOptions);
      } else {
        // Fallback to simple API for full search
        console.log('Using fallback search');
        data = await instantSearchApi.extendedSearch(newFilters.keyword, searchOptions);
      }

      console.log('Search results:', data);
      
      if (data.items && data.items.length > 0) {
        setMovies(data.items);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalItems || 0);
        setSearchMode(data.instant ? 'instant' : data.extended ? 'extended' : data.fullDatabase ? 'full' : 'full');
        
        console.log(`Found ${data.items.length} movies (${data.totalItems} total)`);
      } else {
        setMovies([]);
        setTotalPages(1);
        setTotalResults(0);
        console.log('No movies found');
      }
    } catch (error) {
      console.error('Search error:', error);
      setMovies([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
    
    // Perform search
    performSearch(1, newFilters, searchMode);
  };

  // Load full database
  const loadFullDatabase = async () => {
    try {
      setFullDatabaseLoading(true);
      console.log('Starting full database load...');
      
      const stats = await instantSearchApi.loadFullDatabaseWithProgress((progress) => {
        setLoadingProgress(progress);
        console.log(`Loading progress: ${progress.percentage.toFixed(1)}% (${progress.current}/${progress.total})`);
      });
      
      setSearchStats(stats);
      setSearchMode('full');
      console.log('Full database loaded:', stats);
      
      performSearch(1, filters, 'full');
      
    } catch (error) {
      console.error('Error loading full database:', error);
    } finally {
      setFullDatabaseLoading(false);
    }
  };

  // Show all movies now
  const showAllMoviesNow = async () => {
    try {
      setLoading(true);
      console.log('Loading all movies...');
      
      const data = await instantSearchApi.getAllMovies({
        limit: 50,
        page: 1,
        category: filters.category,
        country: filters.country,
        year: filters.year,
        type: filters.type
      });
      
      if (data.items && data.items.length > 0) {
        setMovies(data.items);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalItems || 0);
        setSearchMode('full');
        setShowAllMovies(true);
        
        console.log(`Showing ${data.items.length} movies from ${data.totalItems} total`);
      }
    } catch (error) {
      console.error('Error loading all movies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear cache
  const clearCache = async () => {
    try {
      const success = await instantSearchApi.clearPersistentCache();
      if (success) {
        console.log('Cache cleared successfully');
        // Reload the page or reinitialize
        window.location.reload();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  // Format cache age
  const formatCacheAge = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    performSearch(page, filters, searchMode);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(1, filters, searchMode);
  };

  useEffect(() => {
    // Initialize instant search API with auto full database loading
    const initializeSearch = async () => {
      try {
        console.log('Auto-initializing with full database loading...');
        
        setFullDatabaseLoading(true);
        
        const stats = await instantSearchApi.initialize(true); // Pass true to auto-load full database
        setSearchStats(stats);
        setFullDatabaseLoading(false);
        
        const cacheStatus = await instantSearchApi.getCacheStatus();
        setCacheStatus(cacheStatus);
        
        console.log('Full database auto-loaded:', stats);
        console.log('Cache status:', cacheStatus);
        
        performSearch(1, filters, 'full'); // Perform initial search with full database
        
      } catch (error) {
        console.error('Error auto-loading full database:', error);
        setFullDatabaseLoading(false);
        
        // Fallback to basic search
        const stats = await instantSearchApi.initialize(false);
        setSearchStats(stats);
        performSearch(1, filters, 'instant');
      }
    };
    
    initializeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Search Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">
            {filters.type ? `${filters.type}` : 
             filters.category ? `Phim ${filters.category}` :
             filters.country ? `Phim ${filters.country}` :
             filters.year ? `Phim ${filters.year}` :
             'Duyệt Tìm Phim'}
          </h1>
          
          {/* Auto Loading Full Database */}
          {fullDatabaseLoading && (
            <div className="mb-4 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-blue-400 font-medium">
                  🚀 Đang tự động load toàn bộ database...
                </h3>
                <span className="text-blue-300 text-sm">
                  {loadingProgress.percentage.toFixed(1)}% ({loadingProgress.current}/{loadingProgress.total})
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress.percentage}%` }}
                ></div>
              </div>
              <p className="text-blue-300 text-sm">
                Tự động tải {loadingProgress.current} trang... Ước tính còn {Math.ceil((loadingProgress.total - loadingProgress.current) * 0.5)} giây
              </p>
              <div className="mt-2 text-xs text-blue-400">
                💡 Hệ thống đang tự động load toàn bộ database để bạn có trải nghiệm tìm kiếm tức thì
              </div>
            </div>
          )}

          {/* Manual Load Controls (Hidden by default, shown only if needed) */}
          {!fullDatabaseLoading && searchStats.movies < 1000 && ( // Adjusted condition for showing manual load
            <div className="mb-4 p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-yellow-400 font-medium mb-2">
                    ⚠️ Database chưa được load đầy đủ ({searchStats.movies.toLocaleString()} phim)
                  </h3>
                  <p className="text-yellow-300 text-sm">
                    Click để load thêm phim hoặc chờ hệ thống tự động load
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={loadFullDatabase}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                  >
                    📥 Load Thêm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Full Database Status */}
          {!fullDatabaseLoading && searchStats.movies >= 10000 && (
            <div className="mb-4 p-4 bg-green-600/20 border border-green-600/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-green-400 font-medium">
                    ✅ Database Đã Tự Động Load Xong!
                  </h3>
                  <p className="text-green-300 text-sm">
                    {searchStats.movies.toLocaleString()} phim - Tìm kiếm tức thì trong toàn bộ database
                  </p>
                  <div className="mt-2 text-xs text-green-400">
                    {cacheStatus.fromCache ? (
                      <>
                        💾 Load từ cache ({formatCacheAge(cacheStatus.cacheAge)}) - Tốc độ cực nhanh!
                      </>
                    ) : (
                      <>
                        🚀 Hệ thống đã tự động load toàn bộ database, bạn có thể tìm kiếm tức thì!
                      </>
                    )}
                  </div>
                  {cacheStatus.fromCache && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={clearCache}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded transition-colors"
                      >
                        🗑️ Xóa Cache
                      </button>
                      <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                        💾 Đã lưu cache
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-green-400 text-2xl">🎉</div>
              </div>
            </div>
          )}
          
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Keyword Search */}
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm phim, diễn viên..."
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
              >
                Tìm Kiếm
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Thể Loại</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tất cả thể loại</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Quốc Gia</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tất cả quốc gia</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Năm</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tất cả năm</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Loại Phim</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tất cả loại</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter - Kkphim.com Style */}
              <div>
                <label className="block text-sm font-medium mb-2">SẮP XẾP:</label>
                <div className="space-y-2">
                  {sortOptions.map(option => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={filters.sort === option.value}
                        onChange={(e) => {
                          handleFilterChange('sort', e.target.value);
                          handleFilterChange('sortType', 'desc'); // Always use desc for kkphim style
                        }}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                        filters.sort === option.value 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-white bg-transparent'
                      }`}>
                        {filters.sort === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className={`text-sm transition-colors ${
                        filters.sort === option.value ? 'text-blue-400' : 'text-gray-300'
                      }`}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </form>

          {/* Search Mode Controls */}
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-gray-400 text-sm mr-2">Chế độ tìm kiếm:</span>
            
            <button
              type="button"
              onClick={() => {
                setSearchMode('instant');
                performSearch(1, filters, 'instant');
              }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                searchMode === 'instant'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ⚡ Tức thì ({searchStats.movies.toLocaleString()})
            </button>
            
            <button
              type="button"
              onClick={() => {
                setSearchMode('extended');
                performSearch(1, filters, 'extended');
              }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                searchMode === 'extended'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔍 Mở rộng
            </button>
            
            <button
              type="button"
              onClick={() => {
                setSearchMode('full');
                performSearch(1, filters, 'full');
              }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                searchMode === 'full'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              disabled={searchStats.movies < 10000}
            >
              🌐 Đầy đủ {searchStats.movies >= 10000 ? `(${searchStats.movies.toLocaleString()})` : '(Đang load...)'}
            </button>
            {searchStats.movies >= 10000 && (
              <button
                type="button"
                onClick={showAllMoviesNow}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
              >
                👁️ Hiện Tất Cả
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setFilters({ ...filters, keyword: '', category: '', country: '', year: '', type: '', sort: 'modified_time' });
            performSearch(1, { ...filters, keyword: '', category: '', country: '', year: '', type: '', sort: 'modified_time' });
          }}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Xem tất cả phim ({searchStats.movies.toLocaleString()})
        </button>
            {searchStats.movies >= 10000 && (
              <button
                onClick={() => {
                  setSearchMode('full');
                  performSearch(1, filters, 'full');
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Tìm kiếm đầy đủ
              </button>
            )}
            <button
              onClick={() => setSearchMode('extended')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm mở rộng
            </button>
            <button
              onClick={async () => {
                console.log('Testing API sorting...');
                try {
                  // Test all sort options
                  const sortOptions = ['modified_time', 'created_time', 'year'];
                  
                  for (const sort of sortOptions) {
                    console.log(`Testing sort: ${sort}`);
                    const response = await fetch(`https://phimapi.com/v1/api/danh-sach/phim-moi-cap-nhat-v3?page=1&sort=${sort}&sortType=desc`);
                    const data = await response.json();
                    
                    if (data.items && data.items.length > 0) {
                      const sample = data.items.slice(0, 3);
                      console.log(`API Sample (${sort}):`, sample.map(movie => ({
                        name: movie.name,
                        modified_time: movie.modified_time,
                        created_time: movie.created_time,
                        year: movie.year,
                        type: movie.type,
                        movie_type: movie.movie_type,
                        kind: movie.kind,
                        allFields: Object.keys(movie)
                      })));
                    }
                  }
                  
                  // Test type fields
                  const response = await fetch('https://phimapi.com/v1/api/danh-sach/phim-moi-cap-nhat-v3?page=1');
                  const data = await response.json();
                  if (data.items && data.items.length > 0) {
                    const sample = data.items.slice(0, 3);
                    console.log('Type fields test:', sample.map(movie => ({
                      name: movie.name,
                      type: movie.type,
                      movie_type: movie.movie_type,
                      kind: movie.kind,
                      episode_total: movie.episode_total,
                      episode_current: movie.episode_current
                    })));
                  }
                } catch (error) {
                  console.error('API test error:', error);
                }
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔍 Test Sorting
            </button>
          </div>

          {/* Active Filters Display */}
          {(filters.keyword || filters.category || filters.country || filters.year || filters.type || filters.sort) && (
            <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-300">Bộ lọc đang áp dụng:</h4>
                <button
                  onClick={() => {
                    setFilters({ ...filters, keyword: '', category: '', country: '', year: '', type: '', sort: 'modified_time' });
                    performSearch(1, { ...filters, keyword: '', category: '', country: '', year: '', type: '', sort: 'modified_time' }, searchMode);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  🗑️ Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.keyword && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30">
                    🔍 &quot;{filters.keyword}&quot;
                    <button
                      onClick={() => handleFilterChange('keyword', '')}
                      className="ml-1 text-blue-300 hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-600/20 text-green-400 border border-green-600/30">
                    🎭 {filters.category}
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="ml-1 text-green-300 hover:text-green-200"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.country && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-600/20 text-yellow-400 border border-yellow-600/30">
                    🌍 {filters.country}
                    <button
                      onClick={() => handleFilterChange('country', '')}
                      className="ml-1 text-yellow-300 hover:text-yellow-200"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.year && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-600/20 text-purple-400 border border-purple-600/30">
                    📅 {filters.year}
                    <button
                      onClick={() => handleFilterChange('year', '')}
                      className="ml-1 text-purple-300 hover:text-purple-200"
                    >
                      ×
                    </button>
                  </span>
                )}
              {filters.type && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-600/20 text-orange-400 border border-orange-600/30">
                  🎬 {filters.type}
                  <button
                    onClick={() => handleFilterChange('type', '')}
                    className="ml-1 text-orange-300 hover:text-orange-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.sort && filters.sort !== 'modified_time' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-cyan-600/20 text-cyan-400 border border-cyan-600/30">
                  📊 {sortOptions.find(opt => opt.value === filters.sort)?.label || filters.sort}
                  <button
                    onClick={() => handleFilterChange('sort', 'modified_time')}
                    className="ml-1 text-cyan-300 hover:text-cyan-200"
                  >
                    ×
                  </button>
                </span>
              )}
              </div>
            </div>
          )}

        {/* Results Info */}
        {totalResults > 0 && (
          <div className="mt-4 text-gray-400">
            Tìm thấy {totalResults} kết quả
            {filters.keyword && ` cho "${filters.keyword}"`}
            <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded">
              {searchMode === 'instant' ? '⚡ Tức thì' : 
               searchMode === 'extended' ? '🔍 Mở rộng' : 
               searchMode === 'full' ? '🌐 Đầy đủ' : '🔍 Tìm kiếm'}
            </span>
            {filters.sort && (
              <span className="ml-2 text-xs bg-cyan-700 px-2 py-1 rounded">
                📊 {sortOptions.find(opt => opt.value === filters.sort)?.label || filters.sort}
              </span>
            )}
              
              {/* Debug info for type filter */}
              {filters.type && (
                <div className="mt-2 text-xs text-yellow-400 bg-yellow-600/10 px-2 py-1 rounded border border-yellow-600/20">
                  🎬 Filter loại phim: {filters.type} - Hệ thống đã cải tiến phát hiện loại phim thông minh
                </div>
              )}
              
              {/* Debug info for sort filter */}
              {filters.sort && (
                <div className="mt-2 text-xs text-cyan-400 bg-cyan-600/10 px-2 py-1 rounded border border-cyan-600/20">
                  📊 Sắp xếp: {sortOptions.find(opt => opt.value === filters.sort)?.label} - Đồng bộ với API kkphim.com
                </div>
              )}
            </div>
          )}
          
          {/* No results message with suggestions */}
          {totalResults === 0 && !loading && (
            <div className="mt-4 p-4 bg-red-600/20 border border-red-600/30 rounded-lg">
              <h4 className="text-red-400 font-medium mb-2">Không tìm thấy kết quả</h4>
              <p className="text-red-300 text-sm mb-3">
                Thử các gợi ý sau để có kết quả tốt hơn:
              </p>
              <div className="space-y-2 text-xs text-red-300">
                <div>• Thử bỏ một số bộ lọc để mở rộng kết quả</div>
                <div>• Kiểm tra lại từ khóa tìm kiếm</div>
                <div>• Thử chế độ tìm kiếm khác (Mở rộng hoặc Đầy đủ)</div>
                {filters.type && (
                  <div>• Loại phim &quot;{filters.type}&quot; có thể chưa có dữ liệu đầy đủ</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-6">
            
            
            {/* Skeleton Loaders */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {Array.from({ length: 12 }, (_, i) => (
                <SkeletonLoader key={i} />
              ))}
            </div>
          </div>
        ) : movies.length > 0 ? (
          <>
            {console.log('Rendering movies:', movies.length, 'items')}
            
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {movies.map((movie, index) => (
                <SeparatedMovieCard 
                  key={movie.slug || movie._id}
                  movie={movie}
                  index={index}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Trước
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          currentPage === page
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">
              {filters.keyword ? `Không tìm thấy kết quả cho "${filters.keyword}"` : 'Không có kết quả nào'}
            </div>
            <div className="text-gray-500 text-sm mb-6">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </div>
            <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-400 text-sm">
                💡 <strong>Gợi ý:</strong> Thử tìm kiếm với từ khóa đơn giản hơn hoặc xóa bộ lọc để xem tất cả phim mới cập nhật.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;

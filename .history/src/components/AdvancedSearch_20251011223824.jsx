import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import SeparatedMovieCard from './SeparatedMovieCard';
import SkeletonLoader from './SkeletonLoader';
import VirtualMovieGrid from './VirtualMovieGrid';
import movieDatabase from '../services/movieDatabase';
import mockMovieDatabase from '../services/mockMovieDatabase';

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchStats, setSearchStats] = useState({ movies: 0, categories: 0, countries: 0, years: 0 });
  const [searchMode, setSearchMode] = useState('full');
  const [fullDatabaseLoading, setFullDatabaseLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ percentage: 0, current: 0, total: 0 });
  const [cacheStatus, setCacheStatus] = useState({ hasPreloadedData: false, preloadedCount: 0, lastPreloadTime: null });
  const [databaseStatus, setDatabaseStatus] = useState({ 
    isLoaded: false, 
    totalMovies: 0, 
    loading: false,
    lastUpdate: null
  });
  const searchTimeoutRef = useRef(null);
  
  // Filter data from backend
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    country: '',
    year: '',
    type: '',
    sort: 'modified_time',
    sortType: 'desc'
  });

  // Load filter data from backend
  const loadFilterData = async () => {
    try {
      setLoadingFilters(true);
      console.log('Loading filter data from backend...');

      // Load categories
      try {
        const categoriesResponse = await fetch('http://localhost:3001/api/movies/categories');
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success && categoriesData.data) {
          setCategories(categoriesData.data);
          console.log('✅ Categories loaded:', categoriesData.data?.length || 0);
          console.log('📊 First category:', categoriesData.data[0]);
        } else {
          console.log('⚠️ Categories API failed, using fallback data');
          setCategories(['Hành động', 'Tình cảm', 'Hài hước', 'Kinh dị', 'Viễn tưởng']);
        }
      } catch (error) {
        console.error('❌ Categories API error:', error);
        setCategories(['Hành động', 'Tình cảm', 'Hài hước', 'Kinh dị', 'Viễn tưởng']);
      }

      // Load countries
      try {
        const countriesResponse = await fetch('http://localhost:3001/api/movies/countries');
        const countriesData = await countriesResponse.json();
        if (countriesData.success && countriesData.data) {
          setCountries(countriesData.data);
          console.log('✅ Countries loaded:', countriesData.data?.length || 0);
          console.log('📊 First country:', countriesData.data[0]);
        } else {
          console.log('⚠️ Countries API failed, using fallback data');
          setCountries(['Việt Nam', 'Hàn Quốc', 'Nhật Bản', 'Trung Quốc', 'Thái Lan', 'Mỹ']);
        }
      } catch (error) {
        console.error('❌ Countries API error:', error);
        setCountries(['Việt Nam', 'Hàn Quốc', 'Nhật Bản', 'Trung Quốc', 'Thái Lan', 'Mỹ']);
      }

    } catch (error) {
      console.error('❌ Failed to load filter data:', error);
      // Set fallback data
      setCategories(['Hành động', 'Tình cảm', 'Hài hước', 'Kinh dị', 'Viễn tưởng']);
      setCountries(['Việt Nam', 'Hàn Quốc', 'Nhật Bản', 'Trung Quốc', 'Thái Lan', 'Mỹ']);
    } finally {
      setLoadingFilters(false);
    }
  };

  // Initialize database
  const initializeDatabase = async () => {
    try {
      // Try real database first
      const cachedMovies = await movieDatabase.loadFromCache();
      if (cachedMovies && cachedMovies.length > 0) {
        setDatabaseStatus({
          isLoaded: true,
          totalMovies: cachedMovies.length,
          loading: false,
          lastUpdate: movieDatabase.lastUpdate
        });
        console.log('📦 Real database loaded from cache');
        
        // Trigger initial search to show movies
        console.log('🚀 Triggering initial search after real database load...');
        performInstantFilter({});
        return;
      }

      // If real database fails, try to load from API directly
      console.log('⚠️ Real database not available, trying to load from API...');
      setDatabaseStatus(prev => ({ ...prev, loading: true }));
      
      // Try to load real movies from API (multiple pages)
      try {
        console.log('🚀 Loading real movies from API...');
        let allMovies = [];
        let page = 1;
        const maxPages = 10; // Load up to 10 pages for more movies
        
        while (page <= maxPages) {
          console.log(`📡 Loading page ${page}/${maxPages}...`);
          const response = await fetch(`http://localhost:3001/api/movies/new?page=${page}&limit=24&version=v3`);
          const result = await response.json();
          
          if (result.success && result.data && result.data.items && result.data.items.length > 0) {
            allMovies = allMovies.concat(result.data.items);
            console.log(`✅ Page ${page}: ${result.data.items.length} movies (Total: ${allMovies.length})`);
            page++;
            
            // Update progress
            setLoadingProgress({
              percentage: Math.round((page / maxPages) * 100),
              current: page,
              total: maxPages
            });
          } else {
            console.log(`❌ Page ${page}: No more movies found`);
            break;
          }
          
          // Small delay to prevent overwhelming server
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (allMovies.length > 0) {
          console.log('✅ Loaded real movies from API:', allMovies.length);
          
          // Set movies directly
          setMovies(allMovies);
          setTotalResults(allMovies.length);
          setTotalPages(1);
          
          setDatabaseStatus({
            isLoaded: true,
            totalMovies: allMovies.length,
            loading: false,
            lastUpdate: new Date()
          });
          
          console.log('🎯 Real movies displayed:', allMovies.length);
        } else {
          throw new Error('No movies from API');
        }
      } catch (apiError) {
        console.log('❌ API failed, using mock database as fallback:', apiError);
        
        await mockMovieDatabase.loadMockDatabase();
        
        setDatabaseStatus({
          isLoaded: true,
          totalMovies: mockMovieDatabase.allMovies.length,
          loading: false,
          lastUpdate: mockMovieDatabase.lastUpdate
        });
        
        // Trigger initial search to show movies
        console.log('🚀 Triggering initial search after mock database load...');
        performInstantFilter({});
      }
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      setDatabaseStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Listen for database progress
  useEffect(() => {
    const handleProgress = (event) => {
      const { loaded, page } = event.detail;
      setLoadingProgress({
        percentage: Math.round((loaded / 24673) * 100),
        current: page,
        total: 500
      });
    };

    window.addEventListener('databaseProgress', handleProgress);
    return () => window.removeEventListener('databaseProgress', handleProgress);
  }, []);

  // Perform search with API fallback
  const performSearch = async (page = 1, newFilters = filters, mode = searchMode) => {
    try {
      setLoading(true);
      console.log('=== SEARCH CALLED ===');
      console.log('Searching with filters:', newFilters, 'mode:', mode);
      
      // Check if database is loaded
      if (!databaseStatus.isLoaded) {
        console.log('⏳ Database not loaded yet, waiting...');
        // Wait for database to load
        const checkInterval = setInterval(() => {
          if (databaseStatus.isLoaded) {
            clearInterval(checkInterval);
            performInstantFilter(newFilters);
          }
        }, 100);
        return;
      }

      // Try API search first
      try {
        await performApiSearch(newFilters);
      } catch (apiError) {
        console.log('⚠️ API search failed, using instant filtering:', apiError);
        performInstantFilter(newFilters);
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // API search function
  const performApiSearch = async (newFilters) => {
    console.log('🌐 Performing API search...');
    
    const searchParams = new URLSearchParams({
      keyword: newFilters.keyword || '',
      page: 1,
      limit: 50,
      sort_field: newFilters.sort || 'modified_time',
      sort_type: newFilters.sortType || 'desc',
      category: newFilters.category || '',
      country: newFilters.country || '',
      year: newFilters.year || ''
    });

    const response = await fetch(`http://localhost:3001/api/movies/search?${searchParams.toString()}`);
    const result = await response.json();
    
    if (result.data && result.data.data && result.data.data.items && Array.isArray(result.data.data.items)) {
      let filteredMovies = result.data.data.items;
      
      // Apply frontend filtering for type
      if (newFilters.type) {
        filteredMovies = filteredMovies.filter(movie => movie.type === newFilters.type);
      }
      
      setMovies(filteredMovies);
      setTotalResults(filteredMovies.length);
      setTotalPages(result.data.data.params?.pagination?.totalPages || 1);
      
      console.log(`🎯 API search result: ${filteredMovies.length} movies`);
      updateUrlParams(newFilters);
    } else {
      throw new Error('No movies found in API response');
    }
  };

  // Instant filtering function
  const performInstantFilter = (newFilters) => {
    console.log('⚡ Performing instant filter...');
    console.log('📊 Database status:', {
      movieDatabaseLoaded: movieDatabase.isLoaded,
      movieDatabaseCount: movieDatabase.allMovies.length,
      mockDatabaseLoaded: mockMovieDatabase.isLoaded,
      mockDatabaseCount: mockMovieDatabase.allMovies.length,
      filters: newFilters
    });
    
    // Filter movies instantly from loaded database
    let filteredMovies = [];
    if (movieDatabase.isLoaded && movieDatabase.allMovies.length > 0) {
      console.log('🎯 Using real movie database');
      filteredMovies = movieDatabase.filterMovies(newFilters);
    } else if (mockMovieDatabase.isLoaded) {
      console.log('🎯 Using mock movie database');
      filteredMovies = mockMovieDatabase.filterMovies(newFilters);
    } else {
      console.log('❌ No database loaded');
    }
    
    console.log(`🎯 Filtered ${filteredMovies.length} movies from ${databaseStatus.totalMovies} total movies`);
    
    // Update movies state
    setMovies(filteredMovies);
    setTotalResults(filteredMovies.length);
    setTotalPages(1); // No pagination needed for instant filtering
    
    console.log('✅ Movies state updated:', filteredMovies.length);
    
    // Update URL params
    updateUrlParams(newFilters);
  };

  // Update URL params
  const updateUrlParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(1, newFilters);
    }, 300);
  };

  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(1);
  };

  // Load filter data on component mount
  useEffect(() => {
    loadFilterData();
    initializeDatabase();
  }, []);

  // Listen for URL params changes
  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    const country = searchParams.get('country') || '';
    const year = searchParams.get('year') || '';
    const type = searchParams.get('type') || '';
    const sort = searchParams.get('sort') || 'modified_time';
    const sortType = searchParams.get('sortType') || 'desc';

    const newFilters = {
      keyword,
      category,
      country,
      year,
      type,
      sort,
      sortType
    };

    setFilters(newFilters);

    // Only perform search if we have some filters
    if (keyword || category || country || year || type) {
      performSearch(1, newFilters);
    }
  }, [searchParams]);

  // Years array
  const years = Array.from({ length: 31 }, (_, i) => 2025 - i);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold mb-4">Tìm Kiếm Phim</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Keyword Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Từ khóa</label>
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  placeholder="Nhập tên phim..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Thể loại</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loadingFilters}
                >
                  <option value="">Tất cả thể loại</option>
                  {loadingFilters ? (
                    <option value="" disabled>Đang tải...</option>
                  ) : (
                    categories && Array.isArray(categories) && categories.map((category, index) => (
                      <option key={index} value={category.name || category}>{category.name || category}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Quốc gia</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loadingFilters}
                >
                  <option value="">Tất cả quốc gia</option>
                  {loadingFilters ? (
                    <option value="" disabled>Đang tải...</option>
                  ) : (
                    countries && Array.isArray(countries) && countries.map((country, index) => (
                      <option key={index} value={country.name || country}>{country.name || country}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Năm</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả năm</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Loại phim</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả loại</option>
                  <option value="single">Phim Lẻ</option>
                  <option value="series">Phim Bộ</option>
                  <option value="hoathinh">Hoạt Hình</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Sắp xếp</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="modified_time">Mới nhất</option>
                  <option value="name">Tên A-Z</option>
                  <option value="year">Năm</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang tìm...' : 'Tìm Kiếm'}
              </button>
            </div>
          </form>

          {/* Debug Controls */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={initializeDatabase}
              disabled={databaseStatus.loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              🔄 Reload Database
            </button>

            <button
              onClick={() => {
                movieDatabase.clearCache();
                setDatabaseStatus({ isLoaded: false, totalMovies: 0, loading: false, lastUpdate: null });
                setMovies([]);
                console.log('🗑️ Database cache cleared');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              🗑️ Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-6 py-8">
        {/* Database Status */}
        {databaseStatus.loading && (
          <div className="mb-8 bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">
                🚀 Pre-loading database... {loadingProgress.current} pages
              </span>
              <span className="text-sm text-gray-300">
                {loadingProgress.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Đang tải {loadingProgress.current * 100} phim từ database 24,673 phim... (Chỉ load một lần)
            </div>
          </div>
        )}

        {/* Database Ready Status */}
        {databaseStatus.isLoaded && (
          <div className="mb-4 bg-green-900/20 border border-green-600/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-400">
                ✅ Database ready: {databaseStatus.totalMovies.toLocaleString()} phim
              </span>
              <span className="text-xs text-gray-400">
                Cập nhật: {databaseStatus.lastUpdate?.toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-6">
            {movies.length > 0 ? (
              <VirtualMovieGrid movies={movies} loading={false} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                {Array.from({ length: 12 }, (_, i) => (
                  <SkeletonLoader key={i} />
                ))}
              </div>
            )}
          </div>
        ) : movies.length > 0 ? (
          <>
            <VirtualMovieGrid movies={movies} loading={loading} />
          </>
        ) : databaseStatus.isLoaded ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">Không có kết quả nào</div>
            <div className="text-gray-500 text-sm mb-4">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</div>
            <button 
              onClick={() => performInstantFilter({})}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              🔄 Hiển thị tất cả phim
            </button>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">Đang tải database...</div>
            <div className="text-gray-500 text-sm">Vui lòng chờ trong giây lát</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
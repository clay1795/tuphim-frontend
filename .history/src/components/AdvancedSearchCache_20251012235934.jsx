import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import SeparatedMovieCard from './SeparatedMovieCard';
import SkeletonLoader from './SkeletonLoader';
import { mongoMovieApi } from '../services/mongoMovieApi';
import { ChevronDownIcon, MagnifyingGlassIcon, ClockIcon, CalendarDaysIcon, FilmIcon, FunnelIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

const AdvancedSearchCache = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cacheStats, setCacheStats] = useState({ totalMovies: 0, lastUpdate: null });
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef(null);
  
  // Filter data from backend
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);
  
  // Sort options
  const sortOptions = [
    { value: 'modified_time-desc', label: 'Mới cập nhật (Mới nhất)' },
    { value: 'modified_time-asc', label: 'Mới cập nhật (Cũ nhất)' },
    { value: 'created_time-desc', label: 'Thời gian đăng (Mới nhất)' },
    { value: 'created_time-asc', label: 'Thời gian đăng (Cũ nhất)' },
    { value: 'year-desc', label: 'Năm sản xuất (Mới nhất)' },
    { value: 'year-asc', label: 'Năm sản xuất (Cũ nhất)' }
  ];

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    country: searchParams.get('country') || '',
    year: searchParams.get('year') || '',
    type: searchParams.get('type') || '',
    sort: searchParams.get('sort') || 'modified_time',
    sortType: searchParams.get('sortType') || 'desc'
  });

  // Update filters when searchParams change
  useEffect(() => {
    const newFilters = {
      keyword: searchParams.get('keyword') || '',
      category: searchParams.get('category') || '',
      country: searchParams.get('country') || '',
      year: searchParams.get('year') || '',
      type: searchParams.get('type') || '',
      sort: searchParams.get('sort') || 'modified_time',
      sortType: searchParams.get('sortType') || 'desc'
    };
    
    console.log('🔄 Updating filters from searchParams:', newFilters);
    setFilters(newFilters);
  }, [searchParams]);

  // Generate years array (2024 to 1950)
  const years = Array.from({ length: 75 }, (_, i) => 2024 - i);

  // Load filter data from backend
  const loadFilterData = async () => {
    try {
      setLoadingFilters(true);
      
      // Load categories and countries in parallel
      const [categoriesResponse, countriesResponse] = await Promise.all([
        fetch('/api/movies/categories'),
        fetch('/api/movies/countries')
      ]);

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.data || []);
      }

      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json();
        setCountries(countriesData.data || []);
      }
    } catch (error) {
      console.error('Error loading filter data:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

  // Load cache stats
  const loadCacheStats = async () => {
    try {
      const result = await mongoMovieApi.getStats();
      if (result.success && result.data) {
        setCacheStats({
          totalMovies: result.data.totalMovies || 0,
          lastUpdate: result.data.lastUpdate || null
        });
      }
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  };

  // Perform search with MongoDB API
  const performSearch = async (page = 1, newFilters = filters) => {
    setLoading(true);
    try {
      console.log('🔍 AdvancedSearchCache performSearch called with:', {
        page,
        newFilters,
        currentFilters: filters
      });

      const cacheKey = `cache_movies_${JSON.stringify(newFilters)}_${page}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData && page === 1) {
        try {
          const parsedData = JSON.parse(cachedData);
          const isExpired = Date.now() - parsedData.timestamp > 300000; // 5 minutes cache

          if (!isExpired && parsedData.items && parsedData.items.length > 0) {
            console.log('📦 Using cached data:', parsedData.items.length, 'items');
            setMovies(parsedData.items);
            setTotalPages(parsedData.pagination?.totalPages || 1);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('⚠️ Cache data corrupted, fetching fresh data');
        }
      }

      const searchOptions = {
        page,
        limit: 24,
        sort: newFilters.sort || 'modified_time',
        sortType: newFilters.sortType || 'desc',
        type: newFilters.type || '',
        category: newFilters.category || '',
        country: newFilters.country || '',
        year: newFilters.year || ''
      };

      console.log('🚀 Calling mongoMovieApi.searchMovies with:', {
        keyword: newFilters.keyword || '',
        searchOptions
      });

      const result = await mongoMovieApi.searchMovies(newFilters.keyword || '', searchOptions);
      console.log('📊 API Response:', result);
      
      const data = result.data;
      console.log('📋 API Data:', data);

      let movieItems = [];
      let totalItems = 0;
      let totalPages = 1;

      if (data.items && Array.isArray(data.items)) {
        movieItems = data.items;
        totalItems = data.pagination?.totalItems || movieItems.length;
        totalPages = data.pagination?.totalPages || 1;
        console.log('✅ Found movies in data.items:', movieItems.length, 'items');
      } else {
        console.log('❌ No movies found in data.items, checking other structures...');
      }

      if (movieItems.length > 0) {
        if (page === 1) {
          const cacheData = {
            items: movieItems,
            pagination: {
              totalItems: totalItems,
              totalPages: totalPages,
              currentPage: page
            },
            timestamp: Date.now()
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        }

        setMovies(movieItems);
        setTotalPages(totalPages);
      } else {
        setMovies([]);
        setTotalPages(1);
      }

    } catch (error) {
      console.error('Search error:', error);
      setMovies([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);

    if (key === 'keyword') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(1, newFilters);
      }, 300);
    } else {
      performSearch(1, newFilters);
    }
  };

  const handleSortChange = (sortValue) => {
    const [sort, sortType] = sortValue.split('-');
    const newFilters = { ...filters, sort, sortType };
    setFilters(newFilters);
    setCurrentPage(1);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);

    performSearch(1, newFilters);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    performSearch(page, filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      keyword: '',
      category: '',
      country: '',
      year: '',
      type: '',
      sort: 'modified_time',
      sortType: 'desc'
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
    performSearch(1, clearedFilters);
  };

  const hasActiveFilters = filters.keyword || filters.category || filters.country || filters.year || filters.type || filters.sort !== 'modified_time' || filters.sortType !== 'desc';

  useEffect(() => {
    loadFilterData();
    loadCacheStats();
  }, []);

  useEffect(() => {
    console.log('🔄 AdvancedSearchCache useEffect triggered');
    console.log('📍 Current searchParams:', Object.fromEntries(searchParams.entries()));
    console.log('🎛️ Current filters state:', filters);
    
    const initializeSearch = async () => {
      performSearch(1, filters);
    };
    initializeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white mb-2">
              🎬 Duyệt Tìm Phim
            </h1>
            <p className="text-gray-300 text-lg">
              Khám phá {cacheStats.totalMovies.toLocaleString()} phim với bộ lọc thông minh
            </p>
            
            {/* Database Status */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">
                MongoDB Database Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            {/* Search Input */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm phim, diễn viên, đạo diễn..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300 text-lg"
              />
            </div>

            {/* Filter Toggle & Clear */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
              >
                <FunnelIcon className="w-5 h-5" />
                {showFilters ? 'Ẩn Bộ Lọc' : 'Hiện Bộ Lọc'}
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-all duration-300"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Collapsible Filters */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showFilters ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="space-y-6">
                {/* Filter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm flex items-center gap-2">
                      <FilmIcon className="w-4 h-4" />
                      Thể Loại
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300"
                      disabled={loadingFilters}
                    >
                      <option value="">Tất cả thể loại</option>
                      {categories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Country Filter */}
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm flex items-center gap-2">
                      <FilmIcon className="w-4 h-4" />
                      Quốc Gia
                    </label>
                    <select
                      value={filters.country}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300"
                      disabled={loadingFilters}
                    >
                      <option value="">Tất cả quốc gia</option>
                      {countries.map((country) => (
                        <option key={country.slug} value={country.slug}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4" />
                      Năm Sản Xuất
                    </label>
                    <select
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300"
                    >
                      <option value="">Tất cả năm</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div className="space-y-2">
                    <label className="text-white font-semibold text-sm flex items-center gap-2">
                      <Bars3Icon className="w-4 h-4" />
                      Loại Phim
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300"
                    >
                      <option value="">Tất cả loại</option>
                      <option value="series">Phim Bộ</option>
                      <option value="single">Phim Lẻ</option>
                      <option value="hoathinh">Hoạt Hình</option>
                      <option value="tvshows">TV Shows</option>
                    </select>
                  </div>
                </div>

                {/* Sort Section */}
                <div className="space-y-3">
                  <label className="text-white font-semibold text-sm flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    Sắp Xếp Theo
                  </label>
                  <select
                    value={`${filters.sort}-${filters.sortType}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full md:w-auto px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-xl font-semibold">
                Kết Quả Tìm Kiếm
              </h2>
              <p className="text-gray-400 text-sm">
                {loading ? 'Đang tải...' : `${movies.length} phim được tìm thấy`}
              </p>
            </div>
          </div>

          {/* Movies Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <LuxuryLoader size="lg" text="Đang tải dữ liệu..." />
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {movies.map((movie, index) => (
                <div
                  key={movie._id || movie.id || index}
                  className="transform transition-all duration-300 hover:scale-105"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <SeparatedMovieCard movie={movie} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Không tìm thấy phim nào
              </h3>
              <p className="text-gray-400 mb-6">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                Trước
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                        currentPage === pageNum
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
         /* CRITICAL: Force tooltip to be above everything */
         .movie-tooltip {
           z-index: 2147483647 !important;
           position: fixed !important;
           transform: translateZ(0) !important;
           isolation: isolate !important;
           contain: layout style paint !important;
           will-change: transform, opacity !important;
           pointer-events: auto !important;
         }
         
         /* Reset any stacking context issues */
         .movie-tooltip * {
           z-index: inherit !important;
           position: relative !important;
         }
         
         /* Ensure movie cards have lower z-index */
         .grid > div {
           z-index: 1 !important;
           position: relative;
         }
         
         /* Force all other elements to have lower z-index */
         * {
           z-index: auto !important;
         }
         
         /* Ensure header stays on top of content but below tooltip */
         header, .sticky, [class*="sticky"], [class*="z-"] {
           z-index: 9999 !important;
         }
         
         .movie-tooltip {
           z-index: 2147483647 !important;
         }
      `}</style>
    </div>
  );
};

export default AdvancedSearchCache;
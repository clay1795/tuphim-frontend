import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SeparatedMovieCard from './SeparatedMovieCard';
import SkeletonLoader from './SkeletonLoader';
import { mongoMovieApi } from '../services/mongoMovieApi';

const AdvancedSearchCache = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cacheStats, setCacheStats] = useState({ totalMovies: 0, lastUpdate: null });
  const searchTimeoutRef = useRef(null);
  
  // Filter data from backend
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);
  
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

  // Static options
  const years = Array.from({ length: 30 }, (_, i) => 2024 - i);
  const types = [
    { value: 'single', label: 'Phim Lẻ' },
    { value: 'series', label: 'Phim Bộ' },
    { value: 'hoathinh', label: 'Hoạt Hình' }
  ];
  const sortOptions = [
    { value: 'modified_time', label: 'Mới cập nhật' },
    { value: 'created_time', label: 'Thời gian đăng' },
    { value: 'year', label: 'Năm sản xuất' }
  ];

  // Load filter data from backend
  const loadFilterData = async () => {
    try {
      setLoadingFilters(true);
      const [categoriesResponse, countriesResponse] = await Promise.all([
        fetch('/api/movies/categories'),
        fetch('/api/movies/countries')
      ]);
      
      const categoriesData = await categoriesResponse.json();
      const countriesData = await countriesResponse.json();
      
      setCategories(categoriesData.data || []);
      setCountries(countriesData.data || []);
    } catch (error) {
      console.error('Error loading filter data:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

  // Load MongoDB stats
  const loadCacheStats = async () => {
    try {
      const result = await mongoMovieApi.getStats();
      if (result.success) {
        setCacheStats({
          totalMovies: result.data.totalMovies,
          lastUpdate: result.data.lastSync
        });
        console.log('MongoDB stats:', result.data);
      }
    } catch (error) {
      console.error('Error loading MongoDB stats:', error);
    }
  };

  // Perform search
  const performSearch = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      console.log('=== MONGODB SEARCH CALLED ===');
      console.log('Searching with filters:', newFilters, 'page:', page);
      
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
      
      const result = await mongoMovieApi.searchMovies(newFilters.keyword || '', searchOptions);
      const data = result.data;
      
      console.log('MongoDB search results:', {
        items: data.items?.length || 0,
        totalItems: data.pagination?.totalItems || 0,
        totalPages: data.pagination?.totalPages || 1,
        database: data.database
      });

      // Handle response structure
      let movieItems = [];
      let totalItems = 0;
      let totalPages = 1;

      if (data.items && Array.isArray(data.items)) {
        movieItems = data.items;
        totalItems = data.pagination?.totalItems || movieItems.length;
        totalPages = data.pagination?.totalPages || 1;
        console.log(`✅ Found ${movieItems.length} movies in MongoDB`);
      } else {
        console.log('❌ No movies found in MongoDB');
      }

      if (movieItems.length > 0) {
        setMovies(movieItems);
        setTotalPages(totalPages);
        setCurrentPage(page);
        console.log(`Found ${movieItems.length} movies (${totalItems} total) from MongoDB`);
      } else {
        setMovies([]);
        setTotalPages(1);
        console.log('No movies found in MongoDB');
      }

    } catch (error) {
      console.error('MongoDB search error:', error);
      setMovies([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    console.log('=== FILTER CHANGE DETECTED ===');
    console.log('Filter key:', key, 'New value:', value);
    
    const newFilters = { ...filters, [key]: value };
    console.log('New filters:', newFilters);
    
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
    
    // Auto-search with debounce for keyword, immediate for other filters
    if (key === 'keyword') {
      console.log('=== KEYWORD CHANGE DETECTED ===');
      console.log('New keyword value:', value);
      
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for auto-search
      searchTimeoutRef.current = setTimeout(() => {
        console.log('=== AUTO-SEARCH TIMEOUT TRIGGERED ===');
        performSearch(1, newFilters);
      }, 300); // 300ms debounce
      
    } else {
      // Immediate search for other filters
      console.log('Immediate search for filter:', key, value);
      performSearch(1, newFilters);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    performSearch(page, filters);
  };

  // Load initial data
  useEffect(() => {
    loadFilterData();
    loadCacheStats();
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
    
    // Perform search with new filters
    performSearch(1, newFilters);
  }, [searchParams]);

  useEffect(() => {
    const initializeSearch = async () => {
      console.log('🚀 Auto-initializing MongoDB Search System...');
      performSearch(1, filters);
    };

    initializeSearch();

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Tìm Kiếm Phim
            </h1>
            <p className="text-red-200 text-lg">
              Khám phá bộ sưu tập phim đa dạng từ MongoDB Database
            </p>
            
            {/* Database Status Banner */}
            <div className="mt-6 bg-green-600/20 border border-green-600/30 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-400 text-sm">
                🎬 <strong>MongoDB Database Active</strong> - {cacheStats.totalMovies.toLocaleString()} phim có sẵn
              </p>
              {cacheStats.lastUpdate && (
                <p className="text-green-300 text-xs mt-1">
                  Cập nhật lần cuối: {new Date(cacheStats.lastUpdate).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <form className="space-y-6">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Tìm Kiếm</label>
              <input
                type="text"
                placeholder="Tìm kiếm phim, diễn viên..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Thể Loại</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
              <div>
                <label className="block text-sm font-medium mb-2">Quốc Gia</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
              <div>
                <label className="block text-sm font-medium mb-2">Năm</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
              <div>
                <label className="block text-sm font-medium mb-2">Loại Phim</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tất cả loại</option>
                  {types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sắp xếp</label>
                <select
                  value={`${filters.sort}-${filters.sortType}`}
                  onChange={(e) => {
                    const [sort, sortType] = e.target.value.split('-');
                    const newFilters = { ...filters, sort, sortType };
                    setFilters(newFilters);
                    setCurrentPage(1);
                    
                    // Update URL params
                    const urlParams = new URLSearchParams(window.location.search);
                    urlParams.set('sort', sort);
                    urlParams.set('sortType', sortType);
                    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
                    
                    // Perform search with new filters
                    performSearch(1, newFilters);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {sortOptions.map(option => (
                    <option key={`${option.value}-desc`} value={`${option.value}-desc`}>
                      {option.label} (Mới nhất)
                    </option>
                  ))}
                  {sortOptions.map(option => (
                    <option key={`${option.value}-asc`} value={`${option.value}-asc`}>
                      {option.label} (Cũ nhất)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
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
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                Kết quả tìm kiếm
              </h2>
              <div className="text-gray-400 text-sm">
                Trang {currentPage} / {totalPages}
              </div>
            </div>

            {/* Movies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {movies.map((movie) => (
                <SeparatedMovieCard key={movie.slug} movie={movie} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    Trước
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Không tìm thấy phim nào
            </h3>
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

export default AdvancedSearchCache;
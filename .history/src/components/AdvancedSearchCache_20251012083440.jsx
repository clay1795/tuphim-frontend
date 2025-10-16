import { useState, useEffect, useRef } from 'react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      </div>

      {/* Header with Glassmorphism */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            {/* Main Title with Gradient */}
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6 animate-pulse">
              🎬 Tìm Kiếm Phim
          </h1>
          
            {/* Subtitle */}
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Khám phá bộ sưu tập phim đa dạng từ MongoDB Database với hơn 24,000 phim chất lượng cao
            </p>
            
            {/* Modern Status Card */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-8 py-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">MongoDB Active</span>
                </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="text-purple-200">
                <span className="text-2xl font-bold text-white">{cacheStats.totalMovies.toLocaleString()}</span>
                <span className="ml-2">phim có sẵn</span>
              </div>
            </div>
            
            {/* Last Update */}
            {cacheStats.lastUpdate && (
              <p className="text-purple-300 text-sm mt-4 opacity-80">
                Cập nhật lần cuối: {new Date(cacheStats.lastUpdate).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modern Search Section */}
      <div className="relative z-10 container mx-auto px-6 pb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Search Input with Icon */}
          <div className="mb-8">
            <label className="block text-white font-semibold mb-4 text-lg">🔍 Tìm Kiếm Phim</label>
            <div className="relative">
                <input
                  type="text"
                placeholder="Nhập tên phim, diễn viên, đạo diễn..."
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-200 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-lg"
                />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              </div>
            </div>

          {/* Modern Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-white font-semibold text-sm">🎭 Thể Loại</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300"
                  disabled={loadingFilters}
                >
                  <option value="">Tất cả thể loại</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug} className="bg-gray-800">
                    {category.name}
                  </option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
            <div className="space-y-2">
              <label className="block text-white font-semibold text-sm">🌍 Quốc Gia</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300"
                  disabled={loadingFilters}
                >
                  <option value="">Tất cả quốc gia</option>
                {countries.map((country) => (
                  <option key={country.slug} value={country.slug} className="bg-gray-800">
                    {country.name}
                  </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
            <div className="space-y-2">
              <label className="block text-white font-semibold text-sm">📅 Năm Sản Xuất</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300"
                >
                  <option value="">Tất cả năm</option>
                {years.map((year) => (
                  <option key={year} value={year} className="bg-gray-800">
                    {year}
                  </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
            <div className="space-y-2">
              <label className="block text-white font-semibold text-sm">🎬 Loại Phim</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300"
                >
                  <option value="">Tất cả loại</option>
                {types.map((type) => (
                  <option key={type.value} value={type.value} className="bg-gray-800">
                    {type.label}
                  </option>
                  ))}
                </select>
            </div>
              </div>

          {/* Sort Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="space-y-2 flex-1">
              <label className="block text-white font-semibold text-sm">📊 Sắp Xếp Theo</label>
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300"
                >
                  {sortOptions.map(option => (
                  <option key={`${option.value}-desc`} value={`${option.value}-desc`} className="bg-gray-800">
                      {option.label} (Mới nhất)
                    </option>
                  ))}
                  {sortOptions.map(option => (
                  <option key={`${option.value}-asc`} value={`${option.value}-asc`} className="bg-gray-800">
                      {option.label} (Cũ nhất)
                    </option>
                  ))}
                </select>
              </div>
            
            {/* Clear Filters Button */}
            <button
              onClick={() => {
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
                setSearchParams({});
                performSearch(1, clearedFilters);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              🔄 Xóa Bộ Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="relative z-10 container mx-auto px-6 pb-16">
        {loading ? (
          <div className="space-y-8">
            {/* Loading Header */}
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-8 py-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                  <span className="text-white font-semibold">Đang tải phim...</span>
                </div>
              </div>
            </div>
            
            {/* Skeleton Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {Array.from({ length: 24 }, (_, i) => (
                <SkeletonLoader key={i} />
              ))}
            </div>
          </div>
        ) : movies.length > 0 ? (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4">
                <h2 className="text-2xl font-bold text-white">
                  🎬 Kết Quả Tìm Kiếm
                </h2>
              </div>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-2">
                <span className="text-purple-200 text-sm font-medium">
                  Trang {currentPage} / {totalPages}
                </span>
              </div>
            </div>

            {/* Movies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {movies.map((movie) => (
                <SeparatedMovieCard key={movie.slug} movie={movie} />
              ))}
            </div>

            {/* Modern Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                      ← Trước
                </button>
                
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            page === currentPage
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                      Sau →
                </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 max-w-2xl mx-auto">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Không Tìm Thấy Phim Nào
              </h3>
              <p className="text-purple-200 text-lg mb-8 leading-relaxed">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy phim bạn muốn xem
              </p>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
                <p className="text-purple-100">
                  💡 <strong>Gợi ý:</strong> Thử tìm kiếm với từ khóa đơn giản hơn hoặc xóa bộ lọc để xem tất cả phim mới cập nhật từ MongoDB Database.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearchCache;
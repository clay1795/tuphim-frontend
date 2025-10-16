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
  const [showFilters, setShowFilters] = useState(false);
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
  
  // Enhanced sort options with better organization
  const sortOptions = [
    { 
      group: 'Thời gian', 
      options: [
        { value: 'modified_time-desc', label: 'Mới cập nhật (Mới nhất)', icon: '🆕' },
        { value: 'modified_time-asc', label: 'Mới cập nhật (Cũ nhất)', icon: '📅' },
        { value: 'created_time-desc', label: 'Thời gian đăng (Mới nhất)', icon: '⏰' },
        { value: 'created_time-asc', label: 'Thời gian đăng (Cũ nhất)', icon: '🕐' }
      ]
    },
    { 
      group: 'Năm sản xuất', 
      options: [
        { value: 'year-desc', label: 'Năm sản xuất (Mới nhất)', icon: '🎬' },
        { value: 'year-asc', label: 'Năm sản xuất (Cũ nhất)', icon: '🎭' }
      ]
    }
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

  // Perform search with smooth loading animation
  const performSearch = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      console.log('=== MONGODB SEARCH CALLED ===');
      console.log('Searching with filters:', newFilters, 'page:', page);
      
      // Add a small delay for smooth animation
      await new Promise(resolve => setTimeout(resolve, 100));
      
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

  // Handle filter change with smooth transitions
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

  // Handle page change with smooth animation
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
    <div className="min-h-screen bg-gray-900">
      {/* Header - Keep original style but enhance */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
              🎬 Tìm Kiếm Phim
            </h1>
            <p className="text-red-200 text-lg mb-6">
              Khám phá bộ sưu tập phim đa dạng từ MongoDB Database
            </p>
            
            {/* Enhanced Status Banner */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 shadow-lg animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">MongoDB Active</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="text-red-200">
                <span className="text-xl font-bold text-white">{cacheStats.totalMovies.toLocaleString()}</span>
                <span className="ml-2">phim có sẵn</span>
              </div>
            </div>
            
            {/* Last Update */}
            {cacheStats.lastUpdate && (
              <p className="text-red-300 text-sm mt-4 opacity-80 animate-fade-in-delay">
                Cập nhật lần cuối: {new Date(cacheStats.lastUpdate).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Search Section */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 animate-slide-up">
          <form className="space-y-6">
            {/* Enhanced Search Input */}
            <div className="relative">
              <label className="block text-white font-semibold mb-3 text-lg">🔍 Tìm Kiếm Phim</label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Nhập tên phim, diễn viên, đạo diễn..."
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  className="w-full px-6 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300 text-lg group-hover:shadow-lg"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filter Toggle Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
              >
                <span>{showFilters ? '📋' : '🔧'}</span>
                {showFilters ? 'Ẩn Bộ Lọc' : 'Hiện Bộ Lọc'}
                <svg 
                  className={`w-5 h-5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Collapsible Filters */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showFilters ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="space-y-6 pt-4">
                {/* Filter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Category Filter */}
                  <div className="space-y-2 animate-fade-in-up">
                    <label className="block text-white font-semibold text-sm">🎭 Thể Loại</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300 hover:bg-gray-650"
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
                  <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                    <label className="block text-white font-semibold text-sm">🌍 Quốc Gia</label>
                    <select
                      value={filters.country}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300 hover:bg-gray-650"
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
                  <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <label className="block text-white font-semibold text-sm">📅 Năm Sản Xuất</label>
                    <select
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300 hover:bg-gray-650"
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
                  <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                    <label className="block text-white font-semibold text-sm">🎬 Loại Phim</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300 hover:bg-gray-650"
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

                {/* Enhanced Sort Section */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                  <div className="space-y-2 flex-1">
                    <label className="block text-white font-semibold text-sm">📊 Sắp Xếp Theo</label>
                    <div className="relative">
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
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300 hover:bg-gray-650 appearance-none cursor-pointer"
                      >
                        {sortOptions.map(group => (
                          <optgroup key={group.group} label={group.group} className="bg-gray-800">
                            {group.options.map(option => (
                              <option key={option.value} value={option.value} className="bg-gray-800 py-2">
                                {option.icon} {option.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Clear Filters Button */}
                  <button
                    type="button"
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
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
                  >
                    <span>🔄</span>
                    Xóa Bộ Lọc
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section with Enhanced Animations */}
      <div className="container mx-auto px-6 pb-16">
        {loading ? (
          <div className="space-y-8 animate-fade-in">
            {/* Loading Header */}
            <div className="flex justify-center">
              <div className="bg-gray-800 border border-gray-700 rounded-xl px-8 py-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-400"></div>
                  <span className="text-white font-semibold">Đang tải phim...</span>
                </div>
              </div>
            </div>
            
            {/* Skeleton Grid with staggered animation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="animate-fade-in-up" style={{animationDelay: `${i * 0.05}s`}}>
                  <SkeletonLoader />
                </div>
              ))}
            </div>
          </div>
        ) : movies.length > 0 ? (
          <div className="space-y-8 animate-fade-in">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl px-6 py-4 shadow-lg">
                <h2 className="text-2xl font-bold text-white">
                  🎬 Kết Quả Tìm Kiếm
                </h2>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 shadow-lg">
                <span className="text-gray-300 text-sm font-medium">
                  Trang {currentPage} / {totalPages}
                </span>
              </div>
            </div>

            {/* Movies Grid with staggered animation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 relative" style={{ zIndex: 1 }}>
              {movies.map((movie, index) => (
                <div 
                  key={movie.slug} 
                  className="relative animate-fade-in-up hover:scale-105 transition-transform duration-300" 
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    zIndex: 1
                  }}
                >
                  <SeparatedMovieCard movie={movie} index={index} />
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
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
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                    >
                      Sau →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-12 max-w-2xl mx-auto shadow-xl">
              <div className="text-8xl mb-6 animate-bounce">🔍</div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Không Tìm Thấy Phim Nào
              </h3>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy phim bạn muốn xem
              </p>
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-2xl p-6">
                <p className="text-red-200">
                  💡 <strong>Gợi ý:</strong> Thử tìm kiếm với từ khóa đơn giản hơn hoặc xóa bộ lọc để xem tất cả phim mới cập nhật từ MongoDB Database.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.3s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
        
        .hover\\:bg-gray-650:hover {
          background-color: rgb(75 85 99);
        }
      `}</style>
    </div>
  );
};

export default AdvancedSearchCache;
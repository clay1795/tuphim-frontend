import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { instantSearchApi } from '../services/instantSearchApi';
import SeparatedMovieCard from './SeparatedMovieCard';
import SkeletonLoader from './SkeletonLoader';
import autoDatabaseManager from '../services/autoDatabaseManager';

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchStats, setSearchStats] = useState({ movies: 0, categories: 0, countries: 0, years: 0 });
  const [searchMode, setSearchMode] = useState('full'); // instant, extended, full
  const [fullDatabaseLoading, setFullDatabaseLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ percentage: 0, current: 0, total: 0 });
  const [cacheStatus, setCacheStatus] = useState({ hasPreloadedData: false, preloadedCount: 0, lastPreloadTime: null });
  const searchTimeoutRef = useRef(null);
  
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
    { value: 'year', label: 'Năm phát hành' },
    { value: 'name', label: 'Tên phim' },
    { value: 'view', label: 'Lượt xem' }
  ];

  const performSearch = async (page = 1, newFilters = filters, mode = searchMode) => {
    try {
      setLoading(true);
      console.log('=== PERFORM SEARCH CALLED ===');
      console.log('Searching with filters:', newFilters, 'mode:', mode);
      console.log('Keyword filter:', newFilters.keyword);
      console.log('Sort parameters:', { sort: newFilters.sort, sortType: newFilters.sortType });
      
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

      console.log('Search options:', searchOptions);

      let data;
      
      // Use instant search API with safe error handling
      try {
        console.log('Using instant search API with safe error handling');
        
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
          console.log('Using fallback search');
          data = await instantSearchApi.extendedSearch(newFilters.keyword, searchOptions);
        }
        
      } catch (apiError) {
        console.error('Instant search API failed, using fallback:', apiError);
        
        // Fallback to simple API call
        try {
          const response = await fetch(`/api/danh-sach/phim-moi-cap-nhat-v3?page=${page}`);
          const result = await response.json();
          data = {
            items: result.data || [],
            totalItems: result.total || 0,
            totalPages: result.last_page || 1,
            instant: false,
            extended: false,
            fullDatabase: false
          };
        } catch (fallbackError) {
          console.error('Fallback API call also failed:', fallbackError);
          // Final fallback to empty results
          data = {
            items: [],
            totalItems: 0,
            totalPages: 1,
            instant: false,
            extended: false,
            fullDatabase: false
          };
        }
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
    
    // Auto-search with debounce for keyword, immediate for other filters
    if (key === 'keyword') {
      console.log('=== KEYWORD CHANGE DETECTED ===');
      console.log('New keyword value:', value);
      console.log('Current timeout ref:', searchTimeoutRef.current);
      
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        console.log('Clearing existing timeout');
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for auto-search
      console.log('Setting new timeout for keyword:', value);
      searchTimeoutRef.current = setTimeout(() => {
        console.log('=== AUTO-SEARCH TIMEOUT TRIGGERED ===');
        console.log('Auto-search triggered for keyword:', value);
        performSearch(1, newFilters, searchMode);
      }, 300); // 300ms debounce
      
      console.log('New timeout ref set:', searchTimeoutRef.current);
    } else {
      // Immediate search for other filters
      console.log('Immediate search for filter:', key, value);
      performSearch(1, newFilters, searchMode);
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
    performSearch(1, newFilters);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    performSearch(page);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(1);
  };

  useEffect(() => {
    // Initial search based on URL params
    performSearch(1);
  }, []);

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
          
          {/* API Source Notice */}
          <div className="mb-4 p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              ⚡ Đang sử dụng client-side filtering với API ổn định - Kết quả tìm kiếm chính xác
            </p>
          </div>
          
          
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

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Sắp Xếp</label>
                <select
                  value={`${filters.sort}-${filters.sortType}`}
                  onChange={(e) => {
                    const [sort, sortType] = e.target.value.split('-');
                    handleFilterChange('sort', sort);
                    handleFilterChange('sortType', sortType);
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

          {/* Results Info */}
          {totalResults > 0 && (
            <div className="mt-4 text-gray-400">
              Tìm thấy {totalResults} kết quả
              {filters.keyword && ` cho "${filters.keyword}"`}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            {searchProgress.total > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Đang tìm kiếm trong database...</span>
                  <span className="text-gray-400 text-sm">
                    {searchProgress.current} / {searchProgress.total} phim
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((searchProgress.current / searchProgress.total) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  Tìm kiếm trong {searchProgress.total} phim để có kết quả chính xác nhất
                </div>
              </div>
            )}
            
            
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

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import SeparatedMovieCard from './SeparatedMovieCard';
import SkeletonLoader from './SkeletonLoader';
import { mongoMovieApi } from '../services/mongoMovieApi';

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchMode, setSearchMode] = useState('full'); // instant, extended, full
  const [cacheStatus, setCacheStatus] = useState({ hasPreloadedData: false, preloadedCount: 0, lastPreloadTime: null });
  
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
        fetch('http://localhost:3001/api/movies/categories'),
        fetch('http://localhost:3001/api/movies/countries')
      ]);
      
      const categoriesResult = await categoriesResponse.json();
      const countriesResult = await countriesResponse.json();
      
      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }
      
      if (countriesResult.success) {
        setCountries(countriesResult.data);
      }
      
      console.log('Loaded filters:', {
        categories: categoriesResult.data?.length || 0,
        countries: countriesResult.data?.length || 0
      });
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
        setCacheStatus({
          hasPreloadedData: true,
          preloadedCount: result.data.totalMovies,
          lastPreloadTime: result.data.lastSync
        });
        console.log('MongoDB stats:', result.data);
      }
    } catch (error) {
      console.error('Error loading MongoDB stats:', error);
    }
  };

  const performSearch = async (page = 1, newFilters = filters, mode = searchMode) => {
    try {
      setLoading(true);
      console.log('=== MONGODB SEARCH CALLED ===');
      console.log('Searching with filters:', newFilters, 'mode:', mode);

      // Use MongoDB search API
      console.log('🔍 Using MongoDB search API with filters:', newFilters);

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
        setTotalResults(totalItems);
        setSearchMode('mongodb');

        console.log(`Found ${movieItems.length} movies (${totalItems} total) from MongoDB`);
      } else {
        setMovies([]);
        setTotalPages(1);
        setTotalResults(0);
        console.log('No movies found in MongoDB');
      }

    } catch (error) {
      console.error('MongoDB search error:', error);
      setMovies([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch(1, filters, 'mongodb');
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    setSearchParams(newSearchParams);
    
    // Trigger search
    setCurrentPage(1);
    performSearch(1, newFilters, 'mongodb');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    performSearch(page, filters, searchMode);
  };

  useEffect(() => {
    loadFilterData();
    loadCacheStats();
    performSearch(1, filters, 'mongodb');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {filters.keyword ? `Kết quả tìm kiếm: "${filters.keyword}"` :
             filters.category ? `Phim ${filters.category}` :
             filters.country ? `Phim ${filters.country}` :
             filters.year ? `Phim ${filters.year}` :
             'Tìm Kiếm Phim'}
          </h1>
          
          {/* Cache Status */}
          {cacheStatus.hasPreloadedData && (
            <div className="mb-4 p-3 bg-green-600/20 border border-green-600/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-green-400 font-medium">
                    ⚡ MongoDB Database Active
                  </h3>
                  <p className="text-green-300 text-sm">
                    {cacheStatus.preloadedCount.toLocaleString()} phim trong database • Cập nhật: {new Date(cacheStatus.lastPreloadTime).toLocaleString()}
                  </p>
                </div>
                <div className="text-green-400 text-2xl">🚀</div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSearch} className="space-y-6">
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
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Tìm Kiếm
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
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
                  {countries.map(country => (
                    <option key={country._id} value={country.slug}>{country.name}</option>
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
                    <option key={type.value} value={type.value}>{type.label}</option>
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
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trước
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          currentPage === page
                            ? 'bg-red-600 text-white'
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
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                </button>
              </div>
            )}

            {/* Results Info */}
            <div className="text-center text-gray-400 mt-4">
              Hiển thị {movies.length} / {totalResults.toLocaleString()} kết quả
              {totalPages > 1 && ` • Trang ${currentPage} / ${totalPages}`}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {loading ? 'Đang tải...' : 'Không tìm thấy phim nào'}
            </div>
            {!loading && (
              <button
                onClick={() => {
                  setFilters({
                    keyword: '',
                    category: '',
                    country: '',
                    year: '',
                    type: '',
                    sort: 'modified_time',
                    sortType: 'desc'
                  });
                  performSearch(1, {
                    keyword: '',
                    category: '',
                    country: '',
                    year: '',
                    type: '',
                    sort: 'modified_time',
                    sortType: 'desc'
                  }, 'mongodb');
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
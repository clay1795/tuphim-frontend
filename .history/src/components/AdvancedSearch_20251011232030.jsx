import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const AdvancedSearch = () => {
  const [searchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchMode, setSearchMode] = useState('full');
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
  const years = Array.from({ length: 31 }, (_, i) => 2025 - i);
  const types = [
    { value: 'single', label: 'Phim Lẻ' },
    { value: 'series', label: 'Phim Bộ' },
    { value: 'hoathinh', label: 'Hoạt Hình' }
  ];

  const performSearch = async (page = 1, newFilters = filters, mode = searchMode) => {
    try {
      setLoading(true);
      console.log('=== INSTANT SEARCH CALLED ===');
      console.log('Searching with filters:', newFilters, 'mode:', mode);
      
      // Check cache first for instant results
      const cacheKey = `movies_${JSON.stringify(newFilters)}_${mode}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData && page === 1) {
        const parsedData = JSON.parse(cachedData);
        console.log('🚀 Using cached data for instant results:', parsedData.items?.length || 0, 'movies');
        setMovies(parsedData.items || []);
        setTotalPages(parsedData.pagination?.totalPages || 1);
        setTotalResults(parsedData.pagination?.totalItems || 0);
        setLoading(false);
        return;
      }
      
      // Always fetch multiple pages to get more movies for better filtering
      const hasFilters = newFilters.keyword || newFilters.category || newFilters.country || newFilters.year || newFilters.type;
      const pagesToFetch = hasFilters ? 100 : 500; // Fetch maximum pages to get most movies from database (24,674 total)
      console.log(`📄 Fetching ${pagesToFetch} page(s) - Has filters: ${hasFilters} - Target: 24,674 movies`);
      
      // Fetch new movies with parallel fetching
      let allMovies = [];
      let totalPagesResult = 1;
      let totalItemsResult = 0;
      
      // Split pages into batches for parallel fetching
      const batchSize = 10;
      const batches = [];
      for (let i = 1; i <= pagesToFetch; i += batchSize) {
        batches.push(Array.from({length: batchSize}, (_, j) => i + j).filter(page => page <= pagesToFetch));
      }
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`📡 Fetching batch ${batchIndex + 1}/${batches.length}: pages ${batch[0]}-${batch[batch.length-1]}`);
        
        // Fetch all pages in current batch in parallel
        const batchPromises = batch.map(async (currentPage) => {
          try {
            const response = await fetch(`http://localhost:3001/api/movies/new?page=${currentPage}&version=v3`);
            const result = await response.json();
            return { page: currentPage, data: result };
          } catch (error) {
            console.error(`Error fetching page ${currentPage}:`, error);
            return { page: currentPage, data: null };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        // Process batch results
        batchResults.forEach(({ page, data }) => {
          if (data && data.data && data.data.items) {
            allMovies = allMovies.concat(data.data.items);
            totalPages = data.data.pagination?.totalPages || 1;
            totalItems = data.data.pagination?.totalItems || allMovies.length;
            console.log(`📄 New movies page ${page}: ${data.data.items.length} movies (Total: ${allMovies.length})`);
          }
        });
        
        // Progressive loading: Show movies immediately after each batch
        if (allMovies.length > 0) {
          console.log(`🚀 Progressive loading: Showing ${allMovies.length} movies after batch ${batchIndex + 1}`);
          // Update UI immediately with current results
          setMovies([...allMovies]);
          setTotalResults(allMovies.length);
        }
        
        // Small delay between batches to avoid overwhelming the server
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      const data = {
        items: allMovies,
        totalItems: totalItems,
        totalPages: totalPages,
        instant: false,
        extended: true,
        fullDatabase: false
      };
      
      console.log('Search results:', data);
      
      // Handle different response structures
      let movieItems = [];
      let totalItems = 0;
      let totalPages = 1;
      
      console.log('🔍 Processing response data structure:', {
        hasDataItems: !!(data.items && Array.isArray(data.items)),
        hasDataDataItems: !!(data.data && data.data.items && Array.isArray(data.data.items)),
        hasDataData: !!(data.data && Array.isArray(data.data)),
        dataKeys: Object.keys(data),
        dataStructure: data
      });
      
      if (data.items && Array.isArray(data.items)) {
        movieItems = data.items;
        totalItems = data.totalItems || movieItems.length;
        totalPages = data.totalPages || 1;
        console.log(`✅ Found ${movieItems.length} movies in data.items`);
      } else if (data.data && data.data.items && Array.isArray(data.data.items)) {
        movieItems = data.data.items;
        totalItems = data.data.params?.pagination?.totalItems || movieItems.length;
        totalPages = data.data.params?.pagination?.totalPages || 1;
        console.log(`✅ Found ${movieItems.length} movies in data.data.items`);
      } else if (data.data && Array.isArray(data.data)) {
        movieItems = data.data;
        totalItems = movieItems.length;
        totalPages = 1;
        console.log(`✅ Found ${movieItems.length} movies in data.data`);
      } else {
        console.log('❌ No movies found in any expected data structure');
      }
      
      // Apply type filter on frontend if needed (since backend API doesn't support type filtering in search)
      if (newFilters.type && movieItems.length > 0) {
        console.log(`🎬 Filtering movies by type: ${newFilters.type}`);
        const originalCount = movieItems.length;
        
        const filteredItems = movieItems.filter(movie => {
          // Handle different movie object structures
          const movieType = movie.type || movie.movieType || '';
          const matches = movieType === newFilters.type;
          
          if (!matches) {
            console.log(`❌ Filtered out: ${movie.name || movie.movieName} (type: ${movieType})`);
          } else {
            console.log(`✅ Kept: ${movie.name || movie.movieName} (type: ${movieType})`);
          }
          
          return matches;
        });
        
        console.log(`🎯 Type filter result: ${originalCount} → ${filteredItems.length} movies (${newFilters.type})`);
        
        // If we have very few movies after filtering, try to get more pages
        if (filteredItems.length < 10 && page === 1) {
          console.log(`⚠️ Only ${filteredItems.length} movies found, this might be too few. Consider fetching more pages.`);
        }
        
        movieItems = filteredItems;
        
        // Update pagination info for filtered results
        totalItems = filteredItems.length;
        totalPages = Math.ceil(filteredItems.length / 20) || 1;
      } else if (!newFilters.type && movieItems.length > 0) {
        console.log(`📺 No type filter applied, showing all ${movieItems.length} movies`);
      }
      
      if (movieItems.length > 0) {
        // Cache the results for instant future access
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
        console.log('💾 Cached data for instant future access:', movieItems.length, 'movies');
        
        setMovies(movieItems);
        setTotalPages(totalPages);
        setTotalResults(totalItems);
        setSearchMode(data.instant ? 'instant' : data.extended ? 'extended' : data.fullDatabase ? 'full' : 'full');
        
        console.log(`Found ${movieItems.length} movies (${totalItems} total)`);
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

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    // Initialize search on component mount
    performSearch(1, filters, 'full');
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);
    
    // Perform search with new filters
    performSearch(1, newFilters, 'extended');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch(1, filters, 'search');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    performSearch(page, filters, searchMode);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Tìm Kiếm Phim</h1>
          <p className="text-gray-400">Khám phá bộ sưu tập phim phong phú với hơn 24,000+ phim</p>
        </div>

        {/* Search Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm phim, diễn viên..."
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Tìm Kiếm
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Thể Loại</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tất cả thể loại</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quốc Gia</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tất cả quốc gia</option>
                  {countries.map(country => (
                    <option key={country._id} value={country.slug}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Năm</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tất cả năm</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Loại Phim</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tất cả loại</option>
                  {types.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sắp Xếp</label>
                <select
                  value={`${filters.sort}-${filters.sortType}`}
                  onChange={(e) => {
                    const [sort, sortType] = e.target.value.split('-');
                    setFilters(prev => ({ ...prev, sort, sortType }));
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="modified_time-desc">Mới cập nhật (Mới nhất)</option>
                  <option value="modified_time-asc">Mới cập nhật (Cũ nhất)</option>
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                  <option value="year-desc">Năm (Mới nhất)</option>
                  <option value="year-asc">Năm (Cũ nhất)</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Đang tải phim...</p>
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
              {movies.map((movie) => (
                <div key={movie._id || movie.slug} className="group">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                    <img
                      src={movie.poster_url || movie.thumb_url}
                      alt={movie.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/placeholder-movie.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {movie.name}
                    </h3>
                    {movie.origin_name && (
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {movie.origin_name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {movie.quality && (
                        <span className="px-2 py-1 bg-red-600 text-xs rounded">
                          {movie.quality}
                        </span>
                      )}
                      {movie.year && (
                        <span className="text-xs text-gray-400">
                          {movie.year}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Trước
                </button>
                
                <span className="text-gray-400">
                  Trang {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">Không có kết quả nào</h3>
            <p className="text-gray-400 mb-4">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            <div className="bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400">💡</span>
                <span className="font-medium">Gợi ý</span>
              </div>
              <p className="text-sm text-blue-200">
                Thử tìm kiếm với từ khóa đơn giản hơn hoặc xóa bộ lọc để xem tất cả phim mới cập nhật.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;

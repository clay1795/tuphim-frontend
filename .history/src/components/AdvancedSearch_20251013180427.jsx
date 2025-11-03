import { useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl, buildApiUrl } from '../utils/apiConfig.js';
import { useSearchParams } from 'react-router-dom';
import SeparatedMovieCard from './SeparatedMovieCard';
import SeriesMovieCard from './SeriesMovieCard';
import movieGroupingService from '../services/movieGroupingService';
import SkeletonLoader from './SkeletonLoader';

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
  const [groupBySeries, setGroupBySeries] = useState(true);
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
        fetch('${getApiUrl()}/movies/categories'),
        fetch('${getApiUrl()}/movies/countries')
      ]);
      
      const categoriesResult = await categoriesResponse.json();
      const countriesResult = await countriesResponse.json();
      
      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }
      
      if (countriesResult.success) {
        setCountries(countriesResult.data);
      }

    } catch (error) {
      console.error('Error loading filter data:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

    const performSearch = useCallback(async (page = 1, newFilters = filters, mode = searchMode) => {
     try {
       setLoading(true);
       
       // Check cache first for instant results (like KKPhim.com)
       const cacheKey = `movies_${JSON.stringify(newFilters)}_${mode}`;
       const cachedData = localStorage.getItem(cacheKey);
       
       if (cachedData && page === 1) {
         try {
           const parsedData = JSON.parse(cachedData);
           const isExpired = Date.now() - parsedData.timestamp > 300000; // 5 minutes cache
           
           if (!isExpired && parsedData.items && parsedData.items.length > 0) {
             setMovies(parsedData.items);
             setTotalPages(parsedData.pagination?.totalPages || 1);
             setTotalResults(parsedData.pagination?.totalItems || parsedData.items.length);
             setLoading(false);
             return;
           }
         } catch (error) {
           // Cache data corrupted, continue with fresh fetch
         }
       }
      

      let data;
      
      // Use instant search API with safe error handling
      try {

         if (newFilters.keyword) {

           // Use cache search for instant results
           const searchParams = new URLSearchParams({
             keyword: newFilters.keyword,
             page: page,
             limit: 24,
             type: newFilters.type || '',
             category: newFilters.category || '',
             country: newFilters.country || '',
             year: newFilters.year || '',
             sort: newFilters.sort || 'modified_time',
             sortType: newFilters.sortType || 'desc'
           });
           
           const response = await fetch(`${getApiUrl()}/mongo-movies/search?${searchParams.toString()}`);
           const result = await response.json();
           data = result.data;
        } else if (newFilters.category) {

          const searchParams = new URLSearchParams({
            page: page,
            limit: 24,
            sort_field: newFilters.sort || 'modified_time',
            sort_type: newFilters.sortType || 'desc',
            country: newFilters.country || '',
            year: newFilters.year || '',
            type: newFilters.type || ''
          });
          const response = await fetch(`${getApiUrl()}/movies/category/${newFilters.category}?${searchParams.toString()}`);
          const result = await response.json();
          data = result.data;
        } else if (newFilters.country) {

          const searchParams = new URLSearchParams({
            page: page,
            limit: 24,
            sort_field: newFilters.sort || 'modified_time',
            sort_type: newFilters.sortType || 'desc',
            category: newFilters.category || '',
            year: newFilters.year || '',
            type: newFilters.type || ''
          });
          const response = await fetch(`${getApiUrl()}/movies/country/${newFilters.country}?${searchParams.toString()}`);
          const result = await response.json();
          data = result.data;
        } else if (newFilters.year) {

          const searchParams = new URLSearchParams({
            page: page,
            limit: 24,
            sort_field: newFilters.sort || 'modified_time',
            sort_type: newFilters.sortType || 'desc',
            category: newFilters.category || '',
            country: newFilters.country || '',
            type: newFilters.type || ''
          });
          const response = await fetch(`${getApiUrl()}/movies/year/${newFilters.year}?${searchParams.toString()}`);
          const result = await response.json();
          data = result.data;
        } else if (newFilters.type) {

          // Use new movies API and filter by type on frontend
          const response = await fetch(`${getApiUrl()}/movies/new?page=${page}&version=v3`);
          const result = await response.json();
          data = result.data;
         } else {

           const response = await fetch(`${getApiUrl()}/movies/new?page=${page}&version=v3`);
           const result = await response.json();
           data = result.data;
         }
        
      } catch (apiError) {
        console.error('Instant search API failed, using fallback:', apiError);
        
        // Fallback to backend API call
        try {
          const response = await fetch(`${getApiUrl()}/movies/new?page=${page}&version=v3`);
          const result = await response.json();
          data = result.data;
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

      console.log('🔍 Debugging response structure:', {
        hasData: !!data,
        hasDataData: !!(data && data.data),
        hasDataItems: !!(data && data.data && data.data.items),
        isDataItemsArray: !!(data && data.data && data.data.items && Array.isArray(data.data.items)),
        hasItems: !!(data && data.items),
        isItemsArray: !!(data && data.items && Array.isArray(data.items)),
        dataKeys: data ? Object.keys(data) : [],
        dataDataKeys: (data && data.data) ? Object.keys(data.data) : []
      });
      
      // Handle different response structures
      let movieItems = [];
      let totalItems = 0;
      let totalPages = 1;
      
      if (data.items && Array.isArray(data.items)) {
        movieItems = data.items;
        totalItems = data.totalItems || movieItems.length;
        totalPages = data.totalPages || 1;

      } else if (data.data && data.data.items && Array.isArray(data.data.items)) {
        movieItems = data.data.items;
        totalItems = data.data.params?.pagination?.totalItems || movieItems.length;
        totalPages = data.data.params?.pagination?.totalPages || 1;

      } else if (data.data && Array.isArray(data.data)) {
        movieItems = data.data;
        totalItems = movieItems.length;
        totalPages = 1;

      } else {

        console.log('Full data structure:', JSON.stringify(data, null, 2));
      }
      
       // Apply type filter on frontend if needed (since backend API doesn't support type filtering in search)
       if (newFilters.type && movieItems.length > 0) {

         const originalCount = movieItems.length;
         const typeCounts = {};
         
         // Count types before filtering
         movieItems.forEach(movie => {
           const movieType = movie.type || movie.movieType || 'unknown';
           typeCounts[movieType] = (typeCounts[movieType] || 0) + 1;
         });

         const filteredItems = movieItems.filter(movie => {
           // Handle different movie object structures and naming conventions
           const movieType = movie.type || movie.movieType || movie.category || '';
           
           // Map frontend types to backend types
           let matches = false;
           if (newFilters.type === 'single') {
             matches = movieType === 'single' || movieType === 'phim-le' || movieType === 'phim lẻ' || movieType === 'movie';
           } else if (newFilters.type === 'series') {
             matches = movieType === 'series' || movieType === 'phim-bo' || movieType === 'phim bộ' || movieType === 'tv-series';
           } else if (newFilters.type === 'hoathinh') {
             matches = movieType === 'hoathinh' || movieType === 'hoạt hình' || movieType === 'animation' || movieType === 'cartoon';
           }
           
           // Only log first 5 filtered items to avoid spam
           if (movieItems.indexOf(movie) < 5) {
             if (!matches) {
               console.log(`❌ Filtered out: ${movie.name || movie.movieName} (type: ${movieType})`);
             } else {
               console.log(`✅ Kept: ${movie.name || movie.movieName} (type: ${movieType})`);
             }
           }
           
           return matches;
         });
         
         console.log(`🎯 Type filter result: ${originalCount} → ${filteredItems.length} movies (${newFilters.type})`);
         
         // If we have very few movies after filtering, suggest getting more pages
         if (filteredItems.length < 10) {

           // For animation (hoathinh), try alternative search strategies
           if (newFilters.type === 'hoathinh' && filteredItems.length === 0) {

             // Could implement fallback search here if needed
           }
         }
         
         movieItems = filteredItems;
         
         // Update pagination info for filtered results
         totalItems = filteredItems.length;
         totalPages = Math.ceil(filteredItems.length / 20) || 1;
       } else if (!newFilters.type && movieItems.length > 0) {

         // Log type distribution for debugging
         const typeCounts = {};
         movieItems.forEach(movie => {
           const movieType = movie.type || movie.movieType || 'unknown';
           typeCounts[movieType] = (typeCounts[movieType] || 0) + 1;
         });
         console.log(`📊 Type distribution (no filter):`, typeCounts);
       }
      
       if (movieItems.length > 0) {
         // Cache results for instant future access (like KKPhim.com)
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
         setTotalResults(totalItems);
         setSearchMode(data.instant ? 'instant' : data.extended ? 'extended' : data.fullDatabase ? 'full' : 'full');
         
         console.log(`Found ${movieItems.length} movies (${totalItems} total)`);
       } else {
         setMovies([]);
         setTotalPages(1);
         setTotalResults(0);

       }
    } catch (error) {
      console.error('Search error:', error);
      setMovies([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchMode]);

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

      // Clear existing timeout
      if (searchTimeoutRef.current) {

        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for auto-search

      searchTimeoutRef.current = setTimeout(() => {

        performSearch(1, newFilters, searchMode);
      }, 300); // 300ms debounce

    } else {
      // Immediate search for other filters

      performSearch(1, newFilters, searchMode);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    performSearch(page);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(1);
  };

  // Load filter data on component mount
  useEffect(() => {
    loadFilterData();
  }, []);

  // Listen for URL params changes
  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    const country = searchParams.get('country') || '';
    const year = searchParams.get('year') || '';
    const type = searchParams.get('type') || '';
    
    const newFilters = {
      keyword,
      category,
      country,
      year,
      type,
      sort: 'modified_time',
      sortType: 'desc'
    };
    
    setFilters(newFilters);
    
     // Perform search with new filters
     if (keyword || category || country || year || type) {
       performSearch(1, newFilters, 'full');
     } else {
       performSearch(1, newFilters, 'full');
     }
   }, [searchParams, performSearch]);

   // Trigger search when filters change (for sort dropdown)
   useEffect(() => {
     if (filters.sort && filters.sortType) {
       performSearch(1, filters, 'full');
     }
   }, [filters, performSearch]);

   useEffect(() => {
     const initializeSearch = async () => {

       setFullDatabaseLoading(true);

       // Initialize database with safe error handling

       try {
         // Get stats from instant search API safely
         const stats = { movies: 0, categories: 0, countries: 0, years: 0 };
         setSearchStats(stats);
         

         setFullDatabaseLoading(false);

         // Perform search with current database
         performSearch(1, filters, 'full');

       } catch (error) {
         console.error('❌ Error getting database stats:', error);

         // Fallback to basic stats
         setSearchStats({
           movies: 0,
           categories: 0,
           countries: 0,
           years: 0
         });


         setFullDatabaseLoading(false);

         // Perform basic search
         performSearch(1, filters, 'full');
       }
     };

     initializeSearch();

     // Cleanup function
     return () => {
       if (searchTimeoutRef.current) {
         clearTimeout(searchTimeoutRef.current);
       }
     };
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [performSearch]); // Include performSearch in dependencies

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
             'Tìm Kiếm Phim'}
          </h1>
          
          {/* Instant Search Status */}
          {searchStats.movies > 0 && (
            <div className="mb-4 p-3 bg-green-600/20 border border-green-600/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-green-400 font-medium">
                    ⚡ Instant Search Active
                  </h3>
                  <p className="text-green-300 text-sm">
                    {searchStats.categories} thể loại • {searchStats.countries} quốc gia
                  </p>
                </div>
                <div className="text-green-400 text-2xl">🚀</div>
              </div>
            </div>
          )}
          
           {/* Database Loading Status */}
           {fullDatabaseLoading && (
             <div className="mb-4 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-blue-400 font-medium">
                   🚀 Đang tải toàn bộ database...
                 </h3>
                 <div className="luxury-spinner luxury-spinner-sm">
                   <div className="luxury-ring luxury-ring-outer"></div>
                   <div className="luxury-ring luxury-ring-middle"></div>
                   <div className="luxury-ring luxury-ring-inner"></div>
                   <div className="luxury-core luxury-core-sm"></div>
                 </div>
               </div>
               <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                 <div 
                   className="bg-blue-600 h-3 rounded-full transition-all duration-300 animate-pulse"
                   style={{ width: `50%` }}
                 ></div>
               </div>
               <p className="text-blue-300 text-sm">
                 Đang tải dữ liệu phim...
               </p>
               <div className="mt-2 text-xs text-blue-400">
                 💡 Hệ thống đang tự động tải toàn bộ database để bạn có trải nghiệm tìm kiếm tức thì
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
                    const newFilters = { ...filters, sort, sortType };
                    setFilters(newFilters);
                    setCurrentPage(1);
                    
                    // Update URL params
                    const urlParams = new URLSearchParams(window.location.search);
                    urlParams.set('sort', sort);
                    urlParams.set('sortType', sortType);
                    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
                    
                    // Search will be triggered by useEffect when filters change
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
          
           {/* Debug Tools */}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="luxury-loader">
              <div className="luxury-spinner">
                <div className="luxury-ring luxury-ring-outer"></div>
                <div className="luxury-ring luxury-ring-inner"></div>
                <div className="luxury-core"></div>
              </div>
              <div className="luxury-text">Đang tải phim...</div>
            </div>
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {(groupBySeries ? movieGroupingService.groupMoviesBySeries(movies) : movies).map((movie, index) => (
                <div
                  key={movie.slug || movie._id}
                  className="animate-fadeInUp"
                  style={{
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {groupBySeries ? (
                    <SeriesMovieCard 
                      movie={movie}
                      index={index}
                    />
                  ) : (
                    <SeparatedMovieCard 
                      movie={movie}
                      index={index}
                    />
                  )}
                </div>
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
            {totalPages > 1 && (
              <div className="text-center text-gray-400 mt-4">
                Trang {currentPage} / {totalPages}
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
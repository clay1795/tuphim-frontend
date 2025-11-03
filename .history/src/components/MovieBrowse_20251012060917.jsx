import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SeparatedMovieCard from './SeparatedMovieCard';
import SkeletonLoader from './SkeletonLoader';
import { mongoMovieApi } from '../services/mongoMovieApi';

const MovieBrowse = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    keyword: '',
    countries: [],
    types: [],
    genres: [],
    versions: [],
    years: [],
    sort: 'modified_time',
    sortType: 'desc'
  });

  const loadMovies = async (page = 1, newFilters = filters) => {
    setLoading(true);
    try {
      console.log('Loading movies with filters:', newFilters, 'page:', page);
      
      // Build search parameters
      const searchParams = {
        page,
        sortField: newFilters.sort,
        sortType: newFilters.sortType
      };

      // Add filters if they exist
      if (newFilters.keyword) searchParams.keyword = newFilters.keyword;
      if (newFilters.genres.length > 0) searchParams.category = newFilters.genres[0];
      if (newFilters.countries.length > 0) searchParams.country = newFilters.countries[0];
      if (newFilters.years.length > 0) searchParams.year = newFilters.years[0];
      if (newFilters.types.length > 0) searchParams.type = newFilters.types[0];

      let data;
      
      // Check if we have any filters applied
      const hasFilters = newFilters.keyword || 
                        newFilters.genres.length > 0 || 
                        newFilters.countries.length > 0 || 
                        newFilters.years.length > 0 || 
                        newFilters.types.length > 0;
      
      if (hasFilters) {
        // Use MongoDB search API with filters
        console.log('Using MongoDB search API with filters');
        const searchOptions = {
          page,
          limit: 20,
          sort: newFilters.sort || 'last_sync',
          sortType: newFilters.sortType || 'desc',
          type: newFilters.types.length > 0 ? newFilters.types[0] : '',
          category: newFilters.genres.length > 0 ? newFilters.genres[0] : '',
          country: newFilters.countries.length > 0 ? newFilters.countries[0] : '',
          year: newFilters.years.length > 0 ? newFilters.years[0] : ''
        };
        
        const result = await mongoMovieApi.searchMovies(newFilters.keyword || '', searchOptions);
        data = result.data;
      } else {
        // Use MongoDB new movies API
        console.log('Using MongoDB new movies API');
        const result = await mongoMovieApi.getNewMovies(page, 20);
        data = result.data;
      }
      
      console.log('Browse movies API response:', data);
      console.log('API response keys:', Object.keys(data));
      console.log('API response structure:', JSON.stringify(data, null, 2));
      
      // Xử lý dữ liệu linh hoạt
      let movieData = [];
      
      if (data.items && Array.isArray(data.items)) {
        movieData = data.items;
        console.log('Found movies in data.items:', movieData.length);
      } else if (data.data && data.data.items && Array.isArray(data.data.items)) {
        movieData = data.data.items;
        console.log('Found movies in data.data.items:', movieData.length);
      } else if (data.data && Array.isArray(data.data)) {
        movieData = data.data;
        console.log('Found movies in data.data:', movieData.length);
      } else if (Array.isArray(data)) {
        movieData = data;
        console.log('Data is direct array:', movieData.length);
      } else if (data && typeof data === 'object') {
        const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
        console.log('Possible arrays found:', possibleArrays.length);
        if (possibleArrays.length > 0) {
          movieData = possibleArrays[0];
          console.log('Using first array with', movieData.length, 'items');
        }
      }
      
      console.log('Final browse movieData:', movieData.length, 'items');
      if (movieData.length > 0) {
        console.log('Sample movie data:', movieData[0]);
      }
      
      // If no movies found, try to get new movies as fallback
      if (movieData.length === 0 && !newFilters.keyword && newFilters.genres.length === 0 && newFilters.countries.length === 0 && newFilters.years.length === 0 && newFilters.types.length === 0) {
        console.log('No movies found, trying fallback to new movies');
        try {
          const response = await fetch(`http://localhost:3001/api/movies/new?page=${page}&version=v3`);
          const result = await response.json();
          const fallbackData = result.data;
          console.log('Fallback data:', fallbackData);
          
          if (fallbackData.items && Array.isArray(fallbackData.items)) {
            movieData = fallbackData.items;
          } else if (fallbackData.data && Array.isArray(fallbackData.data)) {
            movieData = fallbackData.data;
          } else if (Array.isArray(fallbackData)) {
            movieData = fallbackData;
          }
          
          console.log('Fallback movieData:', movieData.length, 'items');
          data = fallbackData;
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
      
      // Apply type filter on frontend if needed
      if (newFilters.types.length > 0 && movieData.length > 0) {
        console.log(`🎬 Filtering movies by types: ${newFilters.types.join(', ')}`);
        const originalCount = movieData.length;
        
        const filteredData = movieData.filter(movie => {
          const movieType = movie.type || movie.movieType || '';
          const matches = newFilters.types.includes(movieType);
          
          if (!matches) {
            console.log(`❌ Filtered out: ${movie.name || movie.movieName} (type: ${movieType})`);
          } else {
            console.log(`✅ Kept: ${movie.name || movie.movieName} (type: ${movieType})`);
          }
          
          return matches;
        });
        
        console.log(`🎯 Type filter result: ${originalCount} → ${filteredData.length} movies`);
        movieData = filteredData;
      }
      
      setMovies(movieData);
      
      // Handle pagination from different response structures
      let totalPages = 1;
      let totalResults = movieData.length;
      
      if (data.data && data.data.params && data.data.params.pagination) {
        totalPages = data.data.params.pagination.totalPages || 1;
        totalResults = data.data.params.pagination.totalItems || movieData.length;
      } else if (data.pagination) {
        totalPages = data.pagination.totalPages || 1;
        totalResults = data.pagination.totalItems || movieData.length;
      } else if (data.totalPages) {
        totalPages = data.totalPages;
        totalResults = data.totalItems || movieData.length;
      }
      
      setTotalPages(totalPages);
      setTotalResults(totalResults);
      setCurrentPage(page);
    } catch (error) {
      console.error('Load browse movies error:', error);
      setMovies([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies(1);
  }, []);

  const handlePageChange = (page) => {
    loadMovies(page);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: filters[filterType].includes(value) 
        ? filters[filterType].filter(item => item !== value)
        : [...filters[filterType], value]
    };
    setFilters(newFilters);
    setCurrentPage(1);
    loadMovies(1, newFilters);
  };

  const handleKeywordSearch = (keyword) => {
    const newFilters = { ...filters, keyword };
    setFilters(newFilters);
    setCurrentPage(1);
    loadMovies(1, newFilters);
  };

  const handleSortChange = (sort, sortType) => {
    const newFilters = { ...filters, sort, sortType };
    setFilters(newFilters);
    setCurrentPage(1);
    loadMovies(1, newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      keyword: '',
      countries: [],
      types: [],
      genres: [],
      versions: [],
      years: [],
      sort: 'modified_time',
      sortType: 'desc'
    };
    setFilters(newFilters);
    setCurrentPage(1);
    loadMovies(1, newFilters);
  };

  // Helper function to render clickable items (same as Header)
  const renderClickableItem = (text, onClick, isActive = false) => (
    <div 
      className={`text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
        isActive ? 'bg-purple-600' : ''
      }`}
      onClick={onClick}
    >
      {text}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-3">
          <nav className="text-sm text-gray-400">
            <span className="hover:text-white cursor-pointer">Trang Chủ</span>
            <span className="mx-2">&gt;</span>
            <span className="text-white">Duyệt Tìm Phim</span>
            <span className="mx-2">&gt;</span>
            <span className="text-white">Trang {currentPage}</span>
          </nav>
        </div>
      </div>

      {/* Filter Section - Header Style */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Bộ lọc</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Xóa tất cả
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Thể Loại Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm bg-gray-700 px-4 py-2 rounded-lg">
                <span>Thể Loại</span>
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
          
              <div className="absolute top-full left-0 mt-2 w-96 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999]">
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      {renderClickableItem('Hành Động', () => handleFilterChange('genres', 'Hành Động'), filters.genres.includes('Hành Động'))}
                      {renderClickableItem('Viễn Tưởng', () => handleFilterChange('genres', 'Viễn Tưởng'), filters.genres.includes('Viễn Tưởng'))}
                      {renderClickableItem('Bí Ẩn', () => handleFilterChange('genres', 'Bí Ẩn'), filters.genres.includes('Bí Ẩn'))}
                      {renderClickableItem('Tâm Lý', () => handleFilterChange('genres', 'Tâm Lý'), filters.genres.includes('Tâm Lý'))}
                      {renderClickableItem('Âm Nhạc', () => handleFilterChange('genres', 'Âm Nhạc'), filters.genres.includes('Âm Nhạc'))}
                      {renderClickableItem('Hài Hước', () => handleFilterChange('genres', 'Hài Hước'), filters.genres.includes('Hài Hước'))}
                      {renderClickableItem('Khoa Học', () => handleFilterChange('genres', 'Khoa Học'), filters.genres.includes('Khoa Học'))}
                      {renderClickableItem('Kinh Điển', () => handleFilterChange('genres', 'Kinh Điển'), filters.genres.includes('Kinh Điển'))}
                    </div>
                    
                    <div className="space-y-2">
                      {renderClickableItem('Cổ Trang', () => handleFilterChange('genres', 'Cổ Trang'), filters.genres.includes('Cổ Trang'))}
                      {renderClickableItem('Kinh Dị', () => handleFilterChange('genres', 'Kinh Dị'), filters.genres.includes('Kinh Dị'))}
                      {renderClickableItem('Phim 18+', () => handleFilterChange('genres', 'Phim 18+'), filters.genres.includes('Phim 18+'))}
                      {renderClickableItem('Thể Thao', () => handleFilterChange('genres', 'Thể Thao'), filters.genres.includes('Thể Thao'))}
                      {renderClickableItem('Gia Đình', () => handleFilterChange('genres', 'Gia Đình'), filters.genres.includes('Gia Đình'))}
                      {renderClickableItem('Hình Sự', () => handleFilterChange('genres', 'Hình Sự'), filters.genres.includes('Hình Sự'))}
                      {renderClickableItem('Thần Thoại', () => handleFilterChange('genres', 'Thần Thoại'), filters.genres.includes('Thần Thoại'))}
                    </div>
                    
                    <div className="space-y-2">
                      {renderClickableItem('Chiến Tranh', () => handleFilterChange('genres', 'Chiến Tranh'), filters.genres.includes('Chiến Tranh'))}
                      {renderClickableItem('Tài Liệu', () => handleFilterChange('genres', 'Tài Liệu'), filters.genres.includes('Tài Liệu'))}
                      {renderClickableItem('Tình Cảm', () => handleFilterChange('genres', 'Tình Cảm'), filters.genres.includes('Tình Cảm'))}
                      {renderClickableItem('Phiêu Lưu', () => handleFilterChange('genres', 'Phiêu Lưu'), filters.genres.includes('Phiêu Lưu'))}
                      {renderClickableItem('Học Đường', () => handleFilterChange('genres', 'Học Đường'), filters.genres.includes('Học Đường'))}
                      {renderClickableItem('Võ Thuật', () => handleFilterChange('genres', 'Võ Thuật'), filters.genres.includes('Võ Thuật'))}
                      {renderClickableItem('Chính Kịch', () => handleFilterChange('genres', 'Chính Kịch'), filters.genres.includes('Chính Kịch'))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quốc Gia Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm bg-gray-700 px-4 py-2 rounded-lg">
                <span>Quốc Gia</span>
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
          
              <div className="absolute top-full left-0 mt-2 w-96 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999]">
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      {renderClickableItem('Trung Quốc', () => handleFilterChange('countries', 'Trung Quốc'), filters.countries.includes('Trung Quốc'))}
                      {renderClickableItem('Pháp', () => handleFilterChange('countries', 'Pháp'), filters.countries.includes('Pháp'))}
                      {renderClickableItem('Mexico', () => handleFilterChange('countries', 'Mexico'), filters.countries.includes('Mexico'))}
                      {renderClickableItem('Đan Mạch', () => handleFilterChange('countries', 'Đan Mạch'), filters.countries.includes('Đan Mạch'))}
                      {renderClickableItem('Hàn Quốc', () => handleFilterChange('countries', 'Hàn Quốc'), filters.countries.includes('Hàn Quốc'))}
                      {renderClickableItem('Canada', () => handleFilterChange('countries', 'Canada'), filters.countries.includes('Canada'))}
                      {renderClickableItem('Ba Lan', () => handleFilterChange('countries', 'Ba Lan'), filters.countries.includes('Ba Lan'))}
                      {renderClickableItem('UAE', () => handleFilterChange('countries', 'UAE'), filters.countries.includes('UAE'))}
                      {renderClickableItem('Nhật Bản', () => handleFilterChange('countries', 'Nhật Bản'), filters.countries.includes('Nhật Bản'))}
                      {renderClickableItem('Thổ Nhĩ Kỳ', () => handleFilterChange('countries', 'Thổ Nhĩ Kỳ'), filters.countries.includes('Thổ Nhĩ Kỳ'))}
                      {renderClickableItem('Brazil', () => handleFilterChange('countries', 'Brazil'), filters.countries.includes('Brazil'))}
                      {renderClickableItem('Nam Phi', () => handleFilterChange('countries', 'Nam Phi'), filters.countries.includes('Nam Phi'))}
                    </div>
                    
                    <div className="space-y-2">
                      {renderClickableItem('Thái Lan', () => handleFilterChange('countries', 'Thái Lan'), filters.countries.includes('Thái Lan'))}
                      {renderClickableItem('Đức', () => handleFilterChange('countries', 'Đức'), filters.countries.includes('Đức'))}
                      {renderClickableItem('Thụy Điển', () => handleFilterChange('countries', 'Thụy Điển'), filters.countries.includes('Thụy Điển'))}
                      {renderClickableItem('Thụy Sĩ', () => handleFilterChange('countries', 'Thụy Sĩ'), filters.countries.includes('Thụy Sĩ'))}
                      {renderClickableItem('Âu Mỹ', () => handleFilterChange('countries', 'Âu Mỹ'), filters.countries.includes('Âu Mỹ'))}
                      {renderClickableItem('Tây Ban Nha', () => handleFilterChange('countries', 'Tây Ban Nha'), filters.countries.includes('Tây Ban Nha'))}
                      {renderClickableItem('Malaysia', () => handleFilterChange('countries', 'Malaysia'), filters.countries.includes('Malaysia'))}
                      {renderClickableItem('Châu Phi', () => handleFilterChange('countries', 'Châu Phi'), filters.countries.includes('Châu Phi'))}
                      {renderClickableItem('Đài Loan', () => handleFilterChange('countries', 'Đài Loan'), filters.countries.includes('Đài Loan'))}
                      {renderClickableItem('Nga', () => handleFilterChange('countries', 'Nga'), filters.countries.includes('Nga'))}
                      {renderClickableItem('Ý', () => handleFilterChange('countries', 'Ý'), filters.countries.includes('Ý'))}
                      {renderClickableItem('Việt Nam', () => handleFilterChange('countries', 'Việt Nam'), filters.countries.includes('Việt Nam'))}
                    </div>
                    
                    <div className="space-y-2">
                      {renderClickableItem('Hồng Kông', () => handleFilterChange('countries', 'Hồng Kông'), filters.countries.includes('Hồng Kông'))}
                      {renderClickableItem('Hà Lan', () => handleFilterChange('countries', 'Hà Lan'), filters.countries.includes('Hà Lan'))}
                      {renderClickableItem('Philippines', () => handleFilterChange('countries', 'Philippines'), filters.countries.includes('Philippines'))}
                      {renderClickableItem('Ukraina', () => handleFilterChange('countries', 'Ukraina'), filters.countries.includes('Ukraina'))}
                      {renderClickableItem('Ấn Độ', () => handleFilterChange('countries', 'Ấn Độ'), filters.countries.includes('Ấn Độ'))}
                      {renderClickableItem('Indonesia', () => handleFilterChange('countries', 'Indonesia'), filters.countries.includes('Indonesia'))}
                      {renderClickableItem('Bồ Đào Nha', () => handleFilterChange('countries', 'Bồ Đào Nha'), filters.countries.includes('Bồ Đào Nha'))}
                      {renderClickableItem('Ả Rập Xê Út', () => handleFilterChange('countries', 'Ả Rập Xê Út'), filters.countries.includes('Ả Rập Xê Út'))}
                      {renderClickableItem('Anh', () => handleFilterChange('countries', 'Anh'), filters.countries.includes('Anh'))}
                      {renderClickableItem('Úc', () => handleFilterChange('countries', 'Úc'), filters.countries.includes('Úc'))}
                      {renderClickableItem('Na Uy', () => handleFilterChange('countries', 'Na Uy'), filters.countries.includes('Na Uy'))}
                      {renderClickableItem('Quốc Gia Khác', () => handleFilterChange('countries', 'Quốc Gia Khác'), filters.countries.includes('Quốc Gia Khác'))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Năm Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm bg-gray-700 px-4 py-2 rounded-lg">
                <span>Năm</span>
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
          
              <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999]">
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      {renderClickableItem('2026', () => handleFilterChange('years', 2026), filters.years.includes(2026))}
                      {renderClickableItem('2023', () => handleFilterChange('years', 2023), filters.years.includes(2023))}
                      {renderClickableItem('2020', () => handleFilterChange('years', 2020), filters.years.includes(2020))}
                      {renderClickableItem('2017', () => handleFilterChange('years', 2017), filters.years.includes(2017))}
                      {renderClickableItem('2014', () => handleFilterChange('years', 2014), filters.years.includes(2014))}
                      {renderClickableItem('2011', () => handleFilterChange('years', 2011), filters.years.includes(2011))}
                      {renderClickableItem('2008', () => handleFilterChange('years', 2008), filters.years.includes(2008))}
                      {renderClickableItem('2005', () => handleFilterChange('years', 2005), filters.years.includes(2005))}
                      {renderClickableItem('2002', () => handleFilterChange('years', 2002), filters.years.includes(2002))}
                    </div>
                    
                    <div className="space-y-2">
                      {renderClickableItem('2025', () => handleFilterChange('years', 2025), filters.years.includes(2025))}
                      {renderClickableItem('2022', () => handleFilterChange('years', 2022), filters.years.includes(2022))}
                      {renderClickableItem('2019', () => handleFilterChange('years', 2019), filters.years.includes(2019))}
                      {renderClickableItem('2016', () => handleFilterChange('years', 2016), filters.years.includes(2016))}
                      {renderClickableItem('2013', () => handleFilterChange('years', 2013), filters.years.includes(2013))}
                      {renderClickableItem('2010', () => handleFilterChange('years', 2010), filters.years.includes(2010))}
                      {renderClickableItem('2007', () => handleFilterChange('years', 2007), filters.years.includes(2007))}
                      {renderClickableItem('2004', () => handleFilterChange('years', 2004), filters.years.includes(2004))}
                      {renderClickableItem('2001', () => handleFilterChange('years', 2001), filters.years.includes(2001))}
                    </div>
                    
                    <div className="space-y-2">
                      {renderClickableItem('2024', () => handleFilterChange('years', 2024), filters.years.includes(2024))}
                      {renderClickableItem('2021', () => handleFilterChange('years', 2021), filters.years.includes(2021))}
                      {renderClickableItem('2018', () => handleFilterChange('years', 2018), filters.years.includes(2018))}
                      {renderClickableItem('2015', () => handleFilterChange('years', 2015), filters.years.includes(2015))}
                      {renderClickableItem('2012', () => handleFilterChange('years', 2012), filters.years.includes(2012))}
                      {renderClickableItem('2009', () => handleFilterChange('years', 2009), filters.years.includes(2009))}
                      {renderClickableItem('2006', () => handleFilterChange('years', 2006), filters.years.includes(2006))}
                      {renderClickableItem('2003', () => handleFilterChange('years', 2003), filters.years.includes(2003))}
                      {renderClickableItem('2000', () => handleFilterChange('years', 2000), filters.years.includes(2000))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loại Phim Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm bg-gray-700 px-4 py-2 rounded-lg">
                <span>Loại Phim</span>
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
          
              <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999]">
                <div className="p-6">
                  <div className="space-y-2">
                    {renderClickableItem('Phim Lẻ', () => handleFilterChange('types', 'Phim Lẻ'), filters.types.includes('Phim Lẻ'))}
                    {renderClickableItem('Phim Bộ', () => handleFilterChange('types', 'Phim Bộ'), filters.types.includes('Phim Bộ'))}
                    {renderClickableItem('TV Shows', () => handleFilterChange('types', 'TV Shows'), filters.types.includes('TV Shows'))}
                    {renderClickableItem('Hoạt Hình', () => handleFilterChange('types', 'Hoạt Hình'), filters.types.includes('Hoạt Hình'))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sắp Xếp Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm bg-gray-700 px-4 py-2 rounded-lg">
                <span>Sắp Xếp</span>
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
          
              <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999]">
                <div className="p-6">
                  <div className="space-y-2">
                    {renderClickableItem('Mới cập nhật', () => handleSortChange('modified_time', 'desc'), filters.sort === 'modified_time')}
                    {renderClickableItem('Thời gian đăng', () => handleSortChange('created_time', 'desc'), filters.sort === 'created_time')}
                    {renderClickableItem('Năm sản xuất', () => handleSortChange('year', 'desc'), filters.sort === 'year')}
                    {renderClickableItem('Xem nhiều nhất', () => handleSortChange('view', 'desc'), filters.sort === 'view')}
                    {renderClickableItem('Tên A-Z', () => handleSortChange('name', 'asc'), filters.sort === 'name' && filters.sortType === 'asc')}
                    {renderClickableItem('Tên Z-A', () => handleSortChange('name', 'desc'), filters.sort === 'name' && filters.sortType === 'desc')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 24 }, (_, i) => (
              <SkeletonLoader key={i} />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {movies.map((movie, index) => (
                <SeparatedMovieCard 
                  key={movie.slug || movie._id || index}
                  movie={movie}
                  index={index}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 7) {
                      page = i + 1;
                    } else if (currentPage <= 4) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      page = totalPages - 6 + i;
                    } else {
                      page = currentPage - 3 + i;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
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
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-xl mb-4">
              {filters.keyword ? `Không tìm thấy kết quả cho "${filters.keyword}"` : 'Không có phim nào'}
            </div>
            <div className="text-gray-500 text-sm mb-6">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </div>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 font-semibold"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieBrowse;

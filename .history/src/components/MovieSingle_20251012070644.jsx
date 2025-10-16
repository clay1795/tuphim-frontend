import { useEffect, useState } from "react";
import MovieGrid from "./MovieGrid";
import movieApi from "../services/movieApi";

const MovieSingle = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadMovies = async (page = 1) => {
    setLoading(true);
    try {
      // Sử dụng API mới để lấy phim lẻ trực tiếp
      console.log('Loading single movies, page:', page);
      const data = await movieApi.getMoviesByType('Phim Lẻ', { page });
      console.log('Single movies API response:', data);
      console.log('Data structure:', Object.keys(data));
      
      // Xử lý dữ liệu linh hoạt hơn - cập nhật theo API mới
      let movieData = [];
      
      console.log('=== PROCESSING API DATA ===');
      console.log('Raw data type:', typeof data);
      console.log('Raw data keys:', Object.keys(data));
      
      // Thử các property phổ biến theo API KKPhim
      const possibleDataKeys = ['items', 'data', 'movies', 'results', 'content', 'list', 'docs', 'records'];
      
      for (const key of possibleDataKeys) {
        if (data[key] && Array.isArray(data[key])) {
          movieData = data[key];
          console.log(`Found movie data in key "${key}":`, movieData.length, 'items');
          break;
        }
      }
      
      // Nếu không tìm thấy, tìm array đầu tiên trong object
      if (movieData.length === 0 && data && typeof data === 'object') {
        const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          movieData = possibleArrays[0];
          const foundKey = Object.keys(data).find(key => data[key] === movieData);
          console.log(`Found array in object key "${foundKey}":`, movieData.length, 'items');
        }
      }
      
      // Nếu data chính nó là array
      if (movieData.length === 0 && Array.isArray(data)) {
        movieData = data;
        console.log('Data itself is array:', movieData.length, 'items');
      }
      
      // Fallback cuối cùng: sử dụng API phim mới cập nhật và filter
      if (movieData.length === 0) {
        console.log('All attempts failed, trying fallback with new movies API...');
        try {
          const fallbackResponse = await fetch('https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1&limit=24');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('Fallback API response:', fallbackData);
            
            // Tìm array trong fallback data
            let fallbackMovies = [];
            if (fallbackData.items && Array.isArray(fallbackData.items)) {
              fallbackMovies = fallbackData.items;
            } else if (fallbackData.data && Array.isArray(fallbackData.data)) {
              fallbackMovies = fallbackData.data;
            } else if (Array.isArray(fallbackData)) {
              fallbackMovies = fallbackData;
            }
            
            console.log('Fallback movies found:', fallbackMovies.length);
            
            if (fallbackMovies.length > 0) {
              // Filter cho phim lẻ (single movies) - logic dựa trên status
              const singleMovies = fallbackMovies.filter(movie => {
                const episodeTotal = movie.episode_total ? parseInt(movie.episode_total) : 0;
                const status = movie.status ? movie.status.toLowerCase() : '';
                const movieName = movie.name ? movie.name.toLowerCase() : '';
                
                // Kiểm tra status để xác định phim lẻ
                const isSingleByStatus = 
                  status === 'full' ||
                  status === 'completed' ||
                  status === 'hoàn tất' ||
                  (status.includes('hoàn tất') && episodeTotal === 1);
                
                // Kiểm tra các dấu hiệu rõ ràng của phim bộ
                const hasSeriesIndicators = 
                  episodeTotal >= 2 ||
                  status.includes('tập') ||
                  status.includes('ongoing') ||
                  status.includes('updating') ||
                  movieName.includes('tập') ||
                  movieName.includes('season') ||
                  movieName.includes('phần') ||
                  movieName.includes('series') ||
                  movieName.includes('bộ') ||
                  movieName.includes('part') ||
                  movieName.includes('uncut ver.') ||
                  movieName.includes('uncut version') ||
                  movieName.includes('dã ngoại') ||
                  movieName.includes('senpai') ||
                  movieName.includes('quái vật') ||
                  movieName.includes('ba mươi') || // Phim này có 20 tập
                  movieName.includes('thirsty thirty');
                
                // Phim lẻ: có status single VÀ không có dấu hiệu series
                const isSingle = isSingleByStatus && !hasSeriesIndicators;
                
                console.log(`Movie: ${movie.name}, Episodes: ${episodeTotal}, Status: ${status}, IsSingleByStatus: ${isSingleByStatus}, HasSeriesIndicators: ${hasSeriesIndicators}, IsSingle: ${isSingle}`);
                
                return isSingle;
              });
              
              console.log('Filtered single movies from fallback:', singleMovies.length);
              movieData = singleMovies;
            }
          }
        } catch (fallbackError) {
          console.error('Fallback API also failed:', fallbackError);
        }
      }
      
      console.log('Final processed movieData:', movieData.length, 'items');
      console.log('=== END PROCESSING ===');
      
      console.log('Final movieData:', movieData);
      console.log('Number of movies:', movieData.length);
      
      if (movieData.length === 0) {
        console.warn('No single movies found in API response');
        console.log('Full API response:', JSON.stringify(data, null, 2));
      }
      
      setMovies(movieData);
      setTotalPages(data.pagination?.totalPages || data.totalPages || data.total_pages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Load single movies error:', error);
      
      // Fallback: try to get new movies and filter for single movies
      try {
        console.log('Trying fallback: get new movies and filter for single movies');
        const fallbackData = await movieApi.getNewMovies(page);
        console.log('Fallback API response:', fallbackData);
        
        const allMovies = fallbackData.items || fallbackData.data || [];
        console.log('All movies from fallback:', allMovies.length);
        
        // Filter for single movies - logic dựa trên status
        const singleMovies = allMovies.filter(movie => {
          const episodeTotal = movie.episode_total ? parseInt(movie.episode_total) : 0;
          const status = movie.status ? movie.status.toLowerCase() : '';
          const movieName = movie.name ? movie.name.toLowerCase() : '';
          
          // Kiểm tra status để xác định phim lẻ
          const isSingleByStatus = 
            status === 'full' ||
            status === 'completed' ||
            status === 'hoàn tất' ||
            (status.includes('hoàn tất') && episodeTotal === 1);
          
          // Kiểm tra các dấu hiệu rõ ràng của phim bộ
          const hasSeriesIndicators = 
            episodeTotal >= 2 ||
            status.includes('tập') ||
            status.includes('ongoing') ||
            status.includes('updating') ||
            movieName.includes('tập') ||
            movieName.includes('season') ||
            movieName.includes('phần') ||
            movieName.includes('series') ||
            movieName.includes('bộ') ||
            movieName.includes('part') ||
            movieName.includes('uncut ver.') ||
            movieName.includes('uncut version') ||
            movieName.includes('dã ngoại') ||
            movieName.includes('senpai') ||
            movieName.includes('quái vật') ||
            movieName.includes('ba mươi') || // Phim này có 20 tập
            movieName.includes('thirsty thirty');
          
          // Phim lẻ: có status single VÀ không có dấu hiệu series
          const isSingle = isSingleByStatus && !hasSeriesIndicators;
          
          console.log(`Movie: ${movie.name}, Episodes: ${episodeTotal}, Status: ${status}, IsSingleByStatus: ${isSingleByStatus}, HasSeriesIndicators: ${hasSeriesIndicators}, IsSingle: ${isSingle}`);
          
          return isSingle;
        });
        
        console.log('Filtered single movies from fallback:', singleMovies.length);
        setMovies(singleMovies);
        setTotalPages(fallbackData.pagination?.totalPages || fallbackData.totalPages || 1);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setMovies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    loadMovies(page);
  };

  useEffect(() => {
    loadMovies(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <MovieGrid 
        movies={movies} 
        title="Phim lẻ mới cập nhật"
        showPagination={true}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="text-gray-800">Đang tải...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieSingle;

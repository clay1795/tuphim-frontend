import { useEffect, useState } from "react";
import MovieGrid from "./MovieGrid";
import movieApi from "../services/movieApi";

const MovieAnimation = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadMovies = async (page = 1) => {
    setLoading(true);
    try {
      // Sử dụng API mới để lấy phim hoạt hình trực tiếp
      console.log('Loading animation movies, page:', page);
      const data = await movieApi.getMoviesByType('Hoạt Hình', { page });
      console.log('Animation movies API response:', data);
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
              // Filter cho phim hoạt hình (animation) - logic cải thiện
              const animationMovies = fallbackMovies.filter(movie => {
                const hasAnimationCategory = movie.category && movie.category.some(cat => 
                  cat.name && (
                    cat.name.toLowerCase().includes('hoạt hình') ||
                    cat.name.toLowerCase().includes('animation') ||
                    cat.name.toLowerCase().includes('anime') ||
                    cat.name.toLowerCase().includes('cartoon')
                  )
                );
                const hasAnimationKeywords = movie.name && (
                  movie.name.toLowerCase().includes('anime') ||
                  movie.name.toLowerCase().includes('cartoon') ||
                  movie.name.toLowerCase().includes('hoạt hình') ||
                  movie.name.toLowerCase().includes('senpai') ||
                  movie.name.toLowerCase().includes('quái vật') ||
                  movie.name.toLowerCase().includes('dã ngoại') ||
                  movie.name.toLowerCase().includes('thịt quái vật')
                );
                
                const isAnimation = hasAnimationCategory || hasAnimationKeywords;
                console.log(`Movie: ${movie.name}, HasAnimationCategory: ${hasAnimationCategory}, HasAnimationKeywords: ${hasAnimationKeywords}, IsAnimation: ${isAnimation}`);
                
                return isAnimation;
              });
              
              console.log('Filtered animation movies from fallback:', animationMovies.length);
              movieData = animationMovies;
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
        console.warn('No animation movies found in API response');
        console.log('Full API response:', JSON.stringify(data, null, 2));
      }
      
      setMovies(movieData);
      setTotalPages(data.pagination?.totalPages || data.totalPages || data.total_pages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Load animation movies error:', error);
      
      // Fallback: try to get new movies and filter for animation
      try {
        console.log('Trying fallback: get new movies and filter for animation');
        const fallbackData = await movieApi.getNewMovies(page);
        console.log('Fallback API response:', fallbackData);
        
        const allMovies = fallbackData.items || fallbackData.data || [];
        console.log('All movies from fallback:', allMovies.length);
        
        // Filter for animation movies (category contains animation keywords)
        const animationMovies = allMovies.filter(movie => {
          const hasAnimationCategory = movie.category && movie.category.some(cat => 
            cat.name && (
              cat.name.toLowerCase().includes('hoạt hình') ||
              cat.name.toLowerCase().includes('animation') ||
              cat.name.toLowerCase().includes('anime') ||
              cat.name.toLowerCase().includes('cartoon')
            )
          );
          const hasAnimationKeywords = movie.name && (
            movie.name.toLowerCase().includes('anime') ||
            movie.name.toLowerCase().includes('cartoon') ||
            movie.name.toLowerCase().includes('hoạt hình')
          );
          return hasAnimationCategory || hasAnimationKeywords;
        });
        
        console.log('Filtered animation movies from fallback:', animationMovies.length);
        setMovies(animationMovies);
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
    <MovieGrid
      title="Phim Hoạt Hình"
      movies={movies}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      showPagination={true}
    />
  );
};

export default MovieAnimation;

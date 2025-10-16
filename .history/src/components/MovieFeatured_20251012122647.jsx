import { useEffect, useState } from "react";
import { getApiUrl, buildApiUrl } from '../utils/apiConfig.js';
import MovieGrid from "./MovieGrid";
// Removed simpleMovieApi import - using backend API

const MovieFeatured = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadMovies = async (page = 1) => {
    setLoading(true);
    try {
      // Sử dụng API MongoDB cho phim đề cử
      const apiUrl = `${getApiUrl()}/mongo-movies/new?page=${page}&limit=24`;
      console.log('Featured movies API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('Featured movies response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Featured movies data:', result);
      
      if (result.success && result.data && result.data.items) {
        const featuredMovies = result.data.items;
        setMovies(featuredMovies);
        setTotalPages(result.data.pagination?.totalPages || 1);
        setCurrentPage(page);
        console.log('Featured movies loaded:', featuredMovies.length);
      } else {
        console.log('No featured movies found');
        setMovies([]);
      }
    } catch (error) {
      console.error('Load featured movies error:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    loadMovies(page);
  };

  useEffect(() => {
    console.log('🎬 MovieFeatured mounted, loading movies...');
    loadMovies(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <MovieGrid 
        movies={movies} 
        title="Phim đề cử"
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

export default MovieFeatured;


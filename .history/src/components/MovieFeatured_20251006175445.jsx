import { useEffect, useState } from "react";
import MovieGrid from "./MovieGrid";
import simpleMovieApi from "../services/simpleMovieApi";

const MovieFeatured = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadMovies = async (page = 1) => {
    setLoading(true);
    try {
      // Sử dụng API phim mới cập nhật cho phim đề cử
      const data = await simpleMovieApi.getNewMovies(page);
      console.log('Featured movies data:', data);
      
      const movieData = data.items || data.data || [];
      // Lấy 20 phim đầu tiên làm phim đề cử
      const featuredMovies = movieData.slice(0, 20);
      setMovies(featuredMovies);
      setTotalPages(Math.ceil(featuredMovies.length / 20) || 1);
      setCurrentPage(page);
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


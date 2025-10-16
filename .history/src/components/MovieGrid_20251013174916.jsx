import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import movieApi from "../services/movieApi";
import SeparatedMovieCard from "./SeparatedMovieCard";
import SeriesMovieCard from "./SeriesMovieCard";
import movieGroupingService from "../services/movieGroupingService";

const MovieGrid = ({ 
  movies = [], 
  title = "", 
  showPagination = false, 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange = () => {},
  groupBySeries = true // Thêm option để bật/tắt nhóm theo series
}) => {
  const formatYear = (year) => {
    if (!year) return '';
    if (typeof year === 'number') return year;
    if (typeof year === 'string') {
      const parsed = parseInt(year);
      return isNaN(parsed) ? '' : parsed;
    }
    return '';
  };

  const getQualityBadge = (quality) => {
    if (!quality) return null;
    
    const qualityColors = {
      'HD': 'bg-green-500',
      'FHD': 'bg-blue-500',
      '4K': 'bg-purple-500',
      'CAM': 'bg-red-500',
      'TS': 'bg-orange-500',
      'TC': 'bg-yellow-500'
    };
    
    const color = qualityColors[quality] || 'bg-gray-500';
    
    return (
      <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${color} shadow-lg`}>
        {quality}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusColors = {
      'ongoing': 'bg-yellow-500',
      'completed': 'bg-green-500',
      'upcoming': 'bg-blue-500'
    };
    
    const color = statusColors[status] || 'bg-gray-500';
    const text = status === 'ongoing' ? 'Đang chiếu' : 
                 status === 'completed' ? 'Hoàn thành' : 
                 status === 'upcoming' ? 'Sắp chiếu' : status;
    
    return (
      <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${color} shadow-lg`}>
        {text}
      </span>
    );
  };

  // Nhóm phim theo series nếu được bật
  const processedMovies = groupBySeries 
    ? movieGroupingService.groupMoviesBySeries(movies)
    : movies;

  return (
    <div className="bg-gray-900 min-h-screen animate-fade-in">
      {title && (
        <div className="px-3 sm:px-6 py-4 sm:py-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 text-gradient">{title}</h2>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full"></div>
          {groupBySeries && processedMovies.length !== movies.length && (
            <p className="text-gray-400 text-sm mt-2">
              Hiển thị {processedMovies.length} series từ {movies.length} phim
            </p>
          )}
        </div>
      )}
      
      <div className="px-3 sm:px-6 pb-6 sm:pb-8">
        {processedMovies && processedMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8">
              {processedMovies.map((movie, index) => {
                console.log(`Rendering movie ${index + 1}:`, movie.name);
                return (
                  groupBySeries ? (
                    <SeriesMovieCard 
                      key={movie.slug || movie._id}
                      movie={movie}
                      index={index}
                    />
                  ) : (
                    <SeparatedMovieCard 
                      key={movie.slug || movie._id}
                      movie={movie}
                      index={index}
                    />
                  )
                );
              })}
            </div>
            
            {/* Pagination */}
            {showPagination && totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-modern disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
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
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-modern disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="animate-float">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">Không tìm thấy phim nào</p>
            <p className="text-gray-500 text-sm mt-2">Hãy thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  );
};

MovieGrid.propTypes = {
  movies: PropTypes.array,
  title: PropTypes.string,
  showPagination: PropTypes.bool,
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func
};

export default MovieGrid;
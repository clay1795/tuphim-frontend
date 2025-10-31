import PropTypes from "prop-types";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { MovieContext } from "../context/MovieDetailContext";
import movieApi from "../services/movieApi";

const MovieSearch = ({ data, showPagination = false, currentPage = 1, totalPages = 1, onPageChange }) => {
  const { handleVideoTrailer } = useContext(MovieContext);

  const formatYear = (year) => {
    if (!year) return '';
    // Nếu year đã là số, trả về trực tiếp
    if (typeof year === 'number') return year;
    // Nếu year là string, parse thành số
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
      <span className={`px-2 py-1 text-xs font-bold text-white rounded ${color}`}>
        {quality}
      </span>
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="px-6 py-4">
        <h2 className="text-2xl font-bold text-white mb-2">Kết quả tìm kiếm</h2>
        <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-yellow-500 rounded"></div>
      </div>
      
      <div className="px-6 pb-6">
        {data && data.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data.map((movie) => (
                <Link
                  key={movie.slug || movie._id}
                  to={`/phim/${movie.slug || movie._id}`}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105 block"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-lg">
                    {/* Movie Poster */}
                    <div className="aspect-[3/4] relative">
                      <img
                        src={movieApi.getWebpImage(movie.poster_url)}
                        alt={movie.name || movie.title}
                        className="movie-poster w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                        style={{ objectPosition: 'center center' }}
                        loading="lazy"
                        onError={(e) => {
                          console.log('Image load error for:', movie.name, 'URL:', movie.poster_url || movie.thumb_url);
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully for:', movie.name);
                        }}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-red-600 rounded-full p-3">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quality Badge */}
                      {movie.quality && (
                        <div className="absolute top-2 right-2">
                          {getQualityBadge(movie.quality)}
                        </div>
                      )}
                    </div>
                    
                    {/* Movie Info */}
                    <div className="p-3 bg-gray-800">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {movie.name || movie.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>{formatYear(movie.year)}</span>
                        {movie.episode_current && (
                          <span className="text-yellow-400 font-medium">
                            Tập {movie.episode_current}
                            {movie.episode_total && `/${movie.episode_total}`}
                          </span>
                        )}
                      </div>
                      
                      {/* Rating */}
                      {movie.rating && (
                        <div className="flex items-center space-x-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(movie.rating / 2) ? 'text-yellow-400' : 'text-gray-600'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-gray-400 text-xs">{movie.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Pagination */}
            {showPagination && totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                  Trước
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">Không tìm thấy phim nào</div>
            <div className="text-gray-500 text-sm mt-2">Hãy thử tìm kiếm với từ khóa khác</div>
          </div>
        )}
      </div>
    </div>
  );
};

MovieSearch.propTypes = {
  data: PropTypes.array.isRequired,
  showPagination: PropTypes.bool,
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
};

export default MovieSearch;

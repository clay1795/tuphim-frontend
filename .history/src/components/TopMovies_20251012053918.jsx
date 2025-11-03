import { Link } from "react-router-dom";
import movieApi from "../services/movieApi";
import MovieTooltip from "./MovieTooltip";

const TopMovies = ({ movies, title, type = "series" }) => {
  const formatYear = (year) => {
    if (!year) return '';
    if (typeof year === 'number') return year;
    if (typeof year === 'string') {
      const parsed = parseInt(year);
      return isNaN(parsed) ? '' : parsed;
    }
    return '';
  };

  return (
    <div className="bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">
            {title}
          </h2>
          <Link 
            to={type === "series" ? "/phim-bo" : "/phim-le"}
            className="text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            Xem toàn bộ →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {movies.slice(0, 10).map((movie, index) => (
            <MovieTooltip key={movie._id} movie={movie}>
              <Link
                to={`/phim/${movie.slug || movie._id}`}
                className="group flex items-center space-x-4 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:scale-105"
              >
              {/* Ranking */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gray-600'
                }`}>
                  {index + 1}
                </div>
              </div>
              
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={movieApi.getWebpImage(movie.poster_url)}
                  alt={movie.name}
                  className="w-16 h-20 object-cover object-center rounded-lg"
                  style={{ objectPosition: 'center center' }}
onError={(e) => {
  e.target.style.display = 'none';
  e.target.parentElement.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
}}
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1 group-hover:text-red-400 transition-colors">
                  {movie.name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>{formatYear(movie.year)}</span>
                  {movie.quality && (
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                      {movie.quality}
                    </span>
                  )}
                  {movie.episode_current && movie.episode_total && (
                    <span>
                      {movie.episode_current}/{movie.episode_total} tập
                    </span>
                  )}
                </div>
                {movie.tmdb?.vote_average && (
                  <div className="flex items-center space-x-1 mt-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-yellow-400 font-semibold">{movie.tmdb.vote_average}</span>
                  </div>
                )}
              </div>
              
              {/* Arrow */}
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              </Link>
            </MovieTooltip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopMovies;

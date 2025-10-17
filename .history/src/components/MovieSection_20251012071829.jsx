import { Link } from "react-router-dom";
import movieApi from "../services/movieApi";
import SeparatedMovieCard from "./SeparatedMovieCard";

const MovieSection = ({ 
  title, 
  movies, 
  linkTo, 
  description = "",
  showViewAll = true 
}) => {
  // Debug logging
  console.log(`MovieSection "${title}":`, {
    moviesCount: movies?.length || 0,
    sampleMovies: movies?.slice(0, 3).map(m => m.name) || []
  });
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
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {title}
            </h2>
            {description && (
              <p className="text-gray-400">{description}</p>
            )}
          </div>
          {showViewAll && linkTo && (
            <Link 
              to={linkTo}
              className="text-red-400 hover:text-red-300 transition-colors font-medium"
            >
              Xem toàn bộ →
            </Link>
          )}
        </div>
        
        {movies && movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
            {movies.map((movie, index) => (
              <SeparatedMovieCard 
                key={movie._id}
                movie={movie}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="animate-float">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">Không có phim nào</p>
            <p className="text-gray-500 text-sm mt-2">Hãy quay lại sau</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieSection;

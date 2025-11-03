import { Link } from "react-router-dom";
import SeparatedMovieCard from "./SeparatedMovieCard";

const MovieSectionCarousel = ({ 
  title, 
  movies, 
  linkTo, 
  description = "",
  showViewAll = true 
}) => {
  // Debug logging
  console.log(`MovieSectionCarousel "${title}":`, {
    moviesCount: movies?.length || 0,
    sampleMovies: movies?.slice(0, 3).map(m => m.name) || []
  });

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
              className="text-red-400 hover:text-red-300 transition-colors font-medium flex items-center space-x-2 bg-red-400/10 hover:bg-red-400/20 px-4 py-2 rounded-lg border border-red-400/30"
            >
              <span>Xem thêm</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
        
        {movies && movies.length > 0 ? (
          <div className="relative">
            {/* Horizontal scroll container */}
            <div className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {movies.map((movie, index) => (
                <div key={movie._id} className="flex-shrink-0 w-48">
                  <SeparatedMovieCard 
                    movie={movie}
                    index={index}
                  />
                </div>
              ))}
            </div>
            
            {/* Scroll indicators */}
            <div className="flex justify-center mt-4 space-x-2">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            </div>
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
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MovieSectionCarousel;

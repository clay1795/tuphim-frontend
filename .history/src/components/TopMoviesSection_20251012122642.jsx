import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getApiUrl } from "../utils/apiConfig";
import SeparatedMovieCard from "./SeparatedMovieCard";

const TopMoviesSection = ({ movies: propMovies = [] }) => {
  const [movies, setMovies] = useState(propMovies);
  const [loading, setLoading] = useState(false);

  const loadTopMovies = async () => {
    if (propMovies.length > 0) {
      setMovies(propMovies);
      return;
    }

    setLoading(true);
    try {
      console.log('Loading top movies...');
      
      // Sử dụng API MongoDB để lấy top movies
      const apiUrl = `${getApiUrl()}/mongo-movies/new?page=1&limit=6`;
      console.log('Top movies API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('Top movies response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Top movies API response:', result);
      
      if (result.success && result.data && result.data.items) {
        // Lấy 6 phim đầu tiên làm top movies
        const topMovies = result.data.items.slice(0, 6);
        setMovies(topMovies);
        console.log('Top movies loaded:', topMovies.length);
      } else {
        console.log('No top movies found');
        setMovies([]);
      }
    } catch (error) {
      console.error('Load top movies error:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🎬 TopMoviesSection mounted, loading movies...');
    loadTopMovies();
  }, []);
  const formatYear = (year) => {
    if (!year) return '';
    if (typeof year === 'number') return year;
    if (typeof year === 'string') {
      const parsed = parseInt(year);
      return isNaN(parsed) ? '' : parsed;
    }
    return '';
  };

  const getRatingBadge = (rating) => {
    if (!rating) return null;
    
    const ratingColors = {
      'T18': 'bg-red-600',
      'T16': 'bg-orange-500',
      'T13': 'bg-yellow-500',
      'T6': 'bg-green-500',
      'P': 'bg-blue-500'
    };
    
    const color = ratingColors[rating] || 'bg-gray-500';
    
    return (
      <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${color} shadow-lg`}>
        {rating}
      </span>
    );
  };

  return (
    <div className="bg-gray-900 py-8">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold text-white mb-6">Top 6 Phim Nổi Bật</h2>
        
        {movies && movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
            {movies.slice(0, 6).map((movie, index) => (
              <div key={movie.slug || movie._id} className="relative">
                {/* Number badge */}
                <div className="absolute -top-2 -left-2 z-20">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-2xl border-2 border-white">
                    {index + 1}
                  </div>
                </div>
                
                <SeparatedMovieCard 
                  movie={movie}
                  index={index}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="animate-float">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">Không có phim nổi bật</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopMoviesSection;

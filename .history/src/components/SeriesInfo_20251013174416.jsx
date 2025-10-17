import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import SeriesGroupingService from '../services/seriesGroupingService';

const SeriesInfo = ({ movie, allMovies = [] }) => {
  const [seriesInfo, setSeriesInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movie || !allMovies.length) {
      setLoading(false);
      return;
    }

    try {
      const details = SeriesGroupingService.getSeriesDetails(movie.slug || movie._id, allMovies);
      setSeriesInfo(details);
    } catch (error) {
      console.error('Error getting series details:', error);
    } finally {
      setLoading(false);
    }
  }, [movie, allMovies]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!seriesInfo || !seriesInfo.isSeries || !seriesInfo.allParts || seriesInfo.allParts.length <= 1) {
    return null;
  }

  const { baseName, allParts, currentMovie } = seriesInfo;
  const currentPartNumber = SeriesGroupingService.getSeriesPartNumber(currentMovie.name);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      {/* Series Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            📺 {baseName}
          </h3>
          <p className="text-gray-400 text-sm">
            Series với {allParts.length} phần • Đang xem: Phần {currentPartNumber}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium border border-red-600/30">
            {allParts.length} Phần
          </span>
        </div>
      </div>

      {/* Series Parts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {allParts.map((part) => {
        const partNumber = SeriesGroupingService.getSeriesPartNumber(part.name);
        const isCurrentPart = part.slug === currentMovie.slug || part._id === currentMovie._id;
          
          return (
            <Link
              key={part.slug || part._id}
              to={`/phim/${part.slug || part._id}`}
              className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
                isCurrentPart 
                  ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20' 
                  : 'hover:scale-105 hover:shadow-lg'
              }`}
            >
              {/* Part Poster */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={part.poster_url || part.thumb_url}
                  alt={`${baseName} - Phần ${partNumber}`}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Current Part Indicator */}
                {isCurrentPart && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Đang xem
                  </div>
                )}
                
                {/* Part Number */}
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold border border-white/20">
                  Phần {partNumber}
                </div>
                
                {/* Quality Badge */}
                {part.quality && (
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${
                      part.quality === 'HD' ? 'bg-green-500' :
                      part.quality === 'FHD' ? 'bg-blue-500' :
                      part.quality === '4K' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}>
                      {part.quality}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Part Info */}
              <div className="p-2">
                <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-red-400 transition-colors duration-300">
                  Phần {partNumber}
                </h4>
                {part.year && (
                  <p className="text-gray-400 text-xs mt-1">
                    {part.year}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Series Stats */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{allParts.length}</div>
            <div className="text-gray-400 text-sm">Tổng phần</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{currentPartNumber}</div>
            <div className="text-gray-400 text-sm">Phần hiện tại</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {allParts.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-gray-400 text-sm">Hoàn thành</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {Math.max(...allParts.map(p => parseInt(p.year || 0)))}
            </div>
            <div className="text-gray-400 text-sm">Năm mới nhất</div>
          </div>
        </div>
      </div>
    </div>
  );
};

SeriesInfo.propTypes = {
  movie: PropTypes.shape({
    slug: PropTypes.string,
    _id: PropTypes.string,
    name: PropTypes.string
  }),
  allMovies: PropTypes.arrayOf(PropTypes.shape({
    slug: PropTypes.string,
    _id: PropTypes.string,
    name: PropTypes.string
  }))
};

export default SeriesInfo;

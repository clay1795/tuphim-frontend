import { Link } from "react-router-dom";
import movieApi from "../services/movieApi";

const SeriesPartsSection = ({ seriesParts, currentMovieSlug }) => {
  if (!seriesParts || seriesParts.length <= 1) {
    return null; // Không hiển thị nếu không có nhiều phần
  }

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
      <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${color}`}>
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
      <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${color}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Các Phần Khác ({seriesParts.length} Phần)
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {seriesParts.map((part, index) => {
          const isCurrentPart = part.slug === currentMovieSlug;
          
          return (
            <Link
              key={part._id || part.slug}
              to={`/phim/${part.slug}`}
              className={`block bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 transition-all duration-300 ${
                isCurrentPart 
                  ? 'ring-2 ring-blue-500 bg-blue-900/30' 
                  : 'hover:scale-105 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Poster thumbnail */}
                <div className="relative flex-shrink-0">
                  <img
                    src={movieApi.getWebpImage(part.poster_url || part.thumb_url)}
                    alt={part.name}
                    className="w-16 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                    }}
                  />
                  {part.quality && (
                    <div className="absolute -top-1 -right-1">
                      {getQualityBadge(part.quality)}
                    </div>
                  )}
                </div>
                
                {/* Part info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm leading-tight ${
                    isCurrentPart ? 'text-blue-400' : 'text-white'
                  }`}>
                    {part.name}
                  </h4>
                  
                  {/* Part number */}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full border border-blue-600/30">
                      Phần {part.partNumber || index + 1}
                    </span>
                    {part.year && (
                      <span className="text-xs text-gray-400">
                        {formatYear(part.year)}
                      </span>
                    )}
                  </div>
                  
                  {/* Episode info */}
                  {part.episode_current && part.episode_total && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-400">Tập:</span>
                      <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full border border-red-600/30">
                        {part.episode_current}/{part.episode_total}
                      </span>
                    </div>
                  )}
                  
                  {/* Status */}
                  {part.status && (
                    <div className="mt-2">
                      {getStatusBadge(part.status)}
                    </div>
                  )}
                  
                  {/* Current part indicator */}
                  {isCurrentPart && (
                    <div className="mt-2">
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                        Đang xem
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
        <p className="text-sm text-gray-400">
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Click vào bất kỳ phần nào để xem chi tiết và danh sách tập phim.
        </p>
      </div>
    </div>
  );
};

export default SeriesPartsSection;


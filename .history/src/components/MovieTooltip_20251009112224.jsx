import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import movieApi from '../services/movieApi';
import { useAuth } from '../context/AuthContextSimple';

const MovieTooltip = ({ movie, children }) => {
  const { user, addToFavorites } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [userMessage, setUserMessage] = useState('');
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // Handle add to favorites
  const handleAddToFavorites = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      setUserMessage('Vui lòng đăng nhập để thêm vào yêu thích');
      setTimeout(() => setUserMessage(''), 3000);
      return;
    }

    try {
      const result = await addToFavorites({
        movieId: movie._id || movie.movieId,
        movieSlug: movie.slug || movie.movieSlug,
        movieName: movie.name || movie.movieName,
        poster_url: movie.poster_url,
        thumb_url: movie.thumb_url,
        banner_url: movie.banner_url,
        originalName: movie.original_name || movie.originalName || movie.name || movie.movieName
      });

      if (result.success) {
        setUserMessage('Đã thêm vào yêu thích');
        setTimeout(() => setUserMessage(''), 3000);
      } else {
        setUserMessage(result.message || 'Không thể thêm vào yêu thích');
        setTimeout(() => setUserMessage(''), 3000);
      }
    } catch (error) {
      setUserMessage('Có lỗi xảy ra');
      setTimeout(() => setUserMessage(''), 3000);
    }
  };

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

  const getDuration = (duration) => {
    if (!duration) return '';
    if (typeof duration === 'string') return duration;
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h ${minutes}m`;
    }
    return '';
  };

  const updatePosition = () => {
    if (triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = triggerRect.right + 20; // 20px gap from trigger
      let y = triggerRect.top;

      // Adjust if tooltip goes off screen
      if (x + tooltipRect.width > viewportWidth) {
        x = triggerRect.left - tooltipRect.width - 20;
      }
      if (y + tooltipRect.height > viewportHeight) {
        y = viewportHeight - tooltipRect.height - 20;
      }
      if (y < 0) {
        y = 20;
      }

      setPosition({ x, y });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    }
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
  };

  const handleTooltipMouseLeave = () => {
    if (!isPinned) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    }
  };

  const handleTooltipClick = (e) => {
    // Chỉ prevent default nếu không phải là click vào Link
    if (!e.target.closest('a')) {
      e.preventDefault();
      e.stopPropagation();
      setIsPinned(!isPinned);
      if (!isPinned) {
        setIsVisible(true);
      }
    }
  };

  const handleCloseTooltip = () => {
    setIsPinned(false);
    setIsVisible(false);
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 w-80 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden tooltip-fade-in movie-tooltip ${isPinned ? 'pinned-tooltip' : ''}`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            pointerEvents: 'auto',
          }}
          onClick={handleTooltipClick}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          {/* Close button for pinned tooltip */}
          {isPinned && (
            <button
              onClick={handleCloseTooltip}
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}

          {/* Pin indicator */}
          {isPinned && (
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Pinned</span>
              </div>
            </div>
          )}

          {/* Movie Poster */}
          <div className="relative h-48 overflow-hidden cursor-pointer">
            <img
              src={movieApi.getWebpImage(movie.poster_url || movie.thumb_url)}
              alt={movie.name || movie.movieName}
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: 'center center' }}
onError={(e) => {
  e.target.style.display = 'none';
  e.target.parentElement.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
}}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            {/* Click to pin overlay */}
            {!isPinned && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>Click to pin</span>
                </div>
              </div>
            )}
            
            {/* Quality badge */}
            {movie.quality && (
              <div className="absolute top-3 right-3">
                <span className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold">
                  {movie.quality}
                </span>
              </div>
            )}
          </div>

          {/* Movie Info */}
          <div className="p-4 space-y-3">
            {/* Movie Title */}
            <div>
              <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                {movie.name || movie.movieName}
              </h3>
              {(movie.name_en || movie.originalName) && (
                <p className="text-yellow-400 text-sm font-medium">
                  {movie.name_en || movie.originalName}
                </p>
              )}
            </div>

            {/* User Message */}
            {userMessage && (
              <div className={`p-2 rounded text-xs ${
                userMessage.includes('thành công') || userMessage.includes('Đã thêm')
                  ? 'bg-green-600/20 border border-green-500/50 text-green-300'
                  : 'bg-red-600/20 border border-red-500/50 text-red-300'
              }`}>
                {userMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Link
                to={`/phim/${movie.slug || movie.movieSlug || movie._id || movie.movieId}`}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Xem ngay</span>
              </Link>
              
              <button 
                onClick={handleAddToFavorites}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                title="Thêm vào yêu thích"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
              
              <Link
                to={`/phim/${movie.slug || movie.movieSlug || movie._id || movie.movieId}`}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </Link>
            </div>

            {/* Movie Metadata */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4 text-sm">
                {(movie.rating || movie.content_rating) && (
                  <div className="flex items-center space-x-1">
                    {getRatingBadge(movie.rating || movie.content_rating)}
                  </div>
                )}
                
                {(movie.year || movie.release_year) && (
                  <span className="text-white font-medium">
                    {formatYear(movie.year || movie.release_year)}
                  </span>
                )}
                
                {(movie.duration || movie.runtime) && (
                  <span className="text-white font-medium">
                    {getDuration(movie.duration || movie.runtime)}
                  </span>
                )}
                
                {/* Fallback info if no metadata available */}
                {!movie.rating && !movie.year && !movie.duration && !movie.content_rating && !movie.release_year && !movie.runtime && (
                  <span className="text-gray-400 text-sm">
                    Thông tin phim
                  </span>
                )}
              </div>

              {/* Genres */}
              {movie.category && movie.category.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {movie.category.map((cat, index) => (
                    <span key={index} className="text-white text-sm">
                      {cat.name}
                      {index < movie.category.length - 1 && <span className="mx-1">•</span>}
                    </span>
                  ))}
                </div>
              )}

              {/* Episode info */}
              {movie.episode_current && movie.episode_total && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Trạng thái:</span>
                  <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full border border-red-600/30">
                    Tập {movie.episode_current}/{movie.episode_total}
                  </span>
                </div>
              )}

              {/* Movie type info */}
              {movie.type && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Loại phim:</span>
                  <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full border border-blue-600/30">
                    {movie.type === 'single' ? 'Phim lẻ' : movie.type === 'series' ? 'Phim bộ' : movie.type}
                  </span>
                </div>
              )}

              {/* Episode status */}
              {movie.episode_current && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Tập hiện tại:</span>
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-full border border-green-600/30">
                    Tập {movie.episode_current}
                  </span>
                </div>
              )}

              {/* Total episodes */}
              {movie.episode_total && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Tổng tập:</span>
                  <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full border border-purple-600/30">
                    {movie.episode_total} tập
                  </span>
                </div>
              )}

              {/* Movie status */}
              {movie.status && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Trạng thái:</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    movie.status === 'ongoing' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' :
                    movie.status === 'completed' ? 'bg-green-600/20 text-green-400 border-green-600/30' :
                    movie.status === 'upcoming' ? 'bg-blue-600/20 text-blue-400 border-blue-600/30' :
                    'bg-gray-600/20 text-gray-400 border-gray-600/30'
                  }`}>
                    {movie.status === 'ongoing' ? 'Đang phát' :
                     movie.status === 'completed' ? 'Hoàn thành' :
                     movie.status === 'upcoming' ? 'Sắp ra mắt' :
                     movie.status}
                  </span>
                </div>
              )}

              {/* Movie quality */}
              {movie.quality && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Chất lượng:</span>
                  <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-1 rounded-full border border-orange-600/30">
                    {movie.quality}
                  </span>
                </div>
              )}

              {/* Movie language */}
              {movie.language && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Ngôn ngữ:</span>
                  <span className="text-xs bg-cyan-600/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-600/30">
                    {movie.language}
                  </span>
                </div>
              )}

              {/* Movie description */}
              {movie.description && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Mô tả:</span>
                  <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                    {movie.description}
                  </p>
                </div>
              )}

              {/* Movie director */}
              {movie.director && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Đạo diễn:</span>
                  <span className="text-xs text-white font-medium">
                    {movie.director}
                  </span>
                </div>
              )}

              {/* Movie cast */}
              {movie.cast && movie.cast.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Diễn viên:</span>
                  <div className="flex flex-wrap gap-1">
                    {movie.cast.slice(0, 3).map((actor, index) => (
                      <span key={index} className="text-xs text-white">
                        {actor}
                        {index < Math.min(movie.cast.length, 3) - 1 && <span className="mx-1">•</span>}
                      </span>
                    ))}
                    {movie.cast.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{movie.cast.length - 3} khác
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

MovieTooltip.propTypes = {
  movie: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

export default MovieTooltip;

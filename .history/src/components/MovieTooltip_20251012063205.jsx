import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import movieApi from '../services/movieApi';
import { useAuth } from '../context/AuthContextSimple';

const MovieTooltip = ({ movie, children }) => {
  const { user, addToFavorites } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeoutRef, setShowTimeoutRef] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [userMessage, setUserMessage] = useState('');
  const [enhancedMovie, setEnhancedMovie] = useState(movie);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // Preload image function
  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log('✅ Image preloaded successfully:', src);
        setIsImageLoaded(true);
        setImageLoadError(false);
        resolve(img);
      };
      img.onerror = () => {
        console.log('❌ Image preload failed:', src);
        setIsImageLoaded(false);
        setImageLoadError(true);
        reject(new Error('Image load failed'));
      };
      img.src = src;
    });
  };

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
        movieId: enhancedMovie._id || enhancedMovie.movieId,
        movieSlug: enhancedMovie.slug || enhancedMovie.movieSlug,
        movieName: enhancedMovie.name || enhancedMovie.movieName,
        poster_url: enhancedMovie.poster_url,
        thumb_url: enhancedMovie.thumb_url,
        banner_url: enhancedMovie.banner_url,
        originalName: enhancedMovie.original_name || enhancedMovie.originalName || enhancedMovie.name || enhancedMovie.movieName
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

  // Format episode status to avoid duplicate "Tập" text
  const formatEpisodeStatus = (episodeCurrent, episodeTotal, status) => {
    if (!episodeCurrent) return null;
    
    // Check if episode_current already has format like "8/8" or "Tập 8/8"
    const episodeStr = episodeCurrent.toString();
    
    // If already has "/" format, extract the numbers properly
    if (episodeStr.includes('/')) {
      const parts = episodeStr.split('/');
      const currentPart = parts[0].replace(/[^\d]/g, ''); // Remove "Tập" etc
      const totalPart = parts[1].replace(/[^\d]/g, '');
      
      // Check if it's completed
      const isCompleted = status === 'completed' || 
                         status === 'hoàn thành' || 
                         status === 'finished' ||
                         status === 'ended' ||
                         status === 'complete' ||
                         parseInt(currentPart) >= parseInt(totalPart);
      
      console.log('🎬 Episode Status Debug (with /):', {
        episodeCurrent,
        episodeTotal,
        status,
        currentPart,
        totalPart,
        isCompleted
      });
      
      if (isCompleted) {
        return `Hoàn Tất (${currentPart}/${totalPart})`;
      }
      
      return `Tập ${currentPart}/${totalPart}`;
    }
    
    // Extract just the number from episode_current (remove "Tập" if present)
    const currentNum = episodeStr.replace(/[^\d]/g, '');
    const totalNum = episodeTotal ? episodeTotal.toString().replace(/[^\d]/g, '') : null;
    
    // More comprehensive check for completed status
    const isCompleted = status === 'completed' || 
                       status === 'hoàn thành' || 
                       status === 'finished' ||
                       status === 'ended' ||
                       status === 'complete' ||
                       // Check if current episode equals total episodes
                       (totalNum && parseInt(currentNum) >= parseInt(totalNum)) ||
                       // Check if episode_current contains "Hoàn Tất" or similar
                       episodeStr.toLowerCase().includes('hoàn tất') ||
                       episodeStr.toLowerCase().includes('complete') ||
                       episodeStr.toLowerCase().includes('finished');
    
    console.log('🎬 Episode Status Debug (without /):', {
      episodeCurrent,
      episodeTotal,
      status,
      currentNum,
      totalNum,
      isCompleted,
      comparison: totalNum ? `${currentNum} >= ${totalNum} = ${parseInt(currentNum) >= parseInt(totalNum)}` : 'no total'
    });
    
    if (isCompleted) {
      if (totalNum && currentNum !== totalNum) {
        return `Hoàn Tất (${totalNum}/${totalNum})`;
      }
      if (totalNum) {
        return `Hoàn Tất (${currentNum}/${totalNum})`;
      }
      return `Hoàn Tất (${currentNum})`;
    }
    
    // For currently airing series
    if (totalNum) {
      return `Tập ${currentNum}/${totalNum}`;
    }
    
    return `Tập ${currentNum}`;
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
    if (!duration) return 'N/A';
    
    console.log('🔍 getDuration input:', { duration, type: typeof duration });
    
    // If it's already a formatted string like "2h 30m", return as is
    if (typeof duration === 'string') {
      // Check if it already has proper format
      if (duration.includes('h') || duration.includes('m') || duration.includes('phút') || duration.includes('giờ')) {
        console.log('✅ Already formatted:', duration);
        return duration;
      }
      
      // Try to parse string duration - look for various patterns
      const patterns = [
        /(\d+)\s*phút/i,           // "90 phút"
        /(\d+)\s*min/i,            // "90 min"
        /(\d+)\s*minutes/i,        // "90 minutes"
        /(\d+)\s*giờ/i,            // "1 giờ"
        /(\d+)\s*hour/i,           // "1 hour"
        /(\d+)\s*h/i,              // "1h"
        /(\d+)\s*m/i,              // "90m"
        /(\d+)/                    // Just numbers
      ];
      
      for (const pattern of patterns) {
        const match = duration.match(pattern);
        if (match) {
          let minutes = parseInt(match[1]);
          
          // If it's hours, convert to minutes
          if (pattern.source.includes('giờ') || pattern.source.includes('hour') || pattern.source.includes('h')) {
            minutes = minutes * 60;
          }
          
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          
          let result;
          if (hours > 0) {
            result = `${hours}h ${remainingMinutes}m`;
          } else {
            result = `${remainingMinutes}m`;
          }
          
          console.log('✅ Parsed duration:', { original: duration, minutes, result });
          return result;
        }
      }
      
      console.log('❌ Could not parse duration:', duration);
      return duration;
    }
    
    // If it's a number (minutes)
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      
      let result;
      if (hours > 0) {
        result = `${hours}h ${minutes}m`;
      } else {
        result = `${minutes}m`;
      }
      
      console.log('✅ Number duration:', { original: duration, result });
      return result;
    }
    
    console.log('❌ Unknown duration type:', { duration, type: typeof duration });
    return 'N/A';
  };

  const updatePosition = () => {
    if (triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Center tooltip over the trigger element
      let x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
      let y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);

      // Adjust if tooltip goes off screen horizontally
      if (x < 20) {
        x = 20;
      }
      if (x + tooltipRect.width > viewportWidth - 20) {
        x = viewportWidth - tooltipRect.width - 20;
      }

      // Adjust if tooltip goes off screen vertically
      if (y < 20) {
        y = 20;
      }
      if (y + tooltipRect.height > viewportHeight - 20) {
        y = viewportHeight - tooltipRect.height - 20;
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
      if (showTimeoutRef) {
        clearTimeout(showTimeoutRef);
      }
    };
  }, [showTimeoutRef]);

  // Reset enhancedMovie when movie prop changes
  useEffect(() => {
    setEnhancedMovie(movie);
    console.log('🔄 MovieTooltip movie changed:', {
      name: movie.name || movie.movieName,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      banner_url: movie.banner_url
    });
  }, [movie]);

  // Fetch enhanced movie details from API
  const fetchMovieDetails = async (movieId, movieSlug) => {
    if (isLoadingDetails) return;
    
    console.log('🎬 Fetching movie details for:', { movieId, movieSlug });
    setIsLoadingDetails(true);
    
    try {
      // Try direct API call first (more reliable)
      // Try both slug and ID approaches
      let apiUrl;
      if (movieSlug) {
        apiUrl = `https://phimapi.com/v1/api/item/get?slug=${movieSlug}`;
      } else if (movieId) {
        apiUrl = `https://phimapi.com/v1/api/item/get?id=${movieId}`;
      } else {
        console.log('❌ No slug or ID available');
        setIsLoadingDetails(false);
        return;
      }
      console.log('📡 API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 API Response:', data);
        
        if (data && data.data && data.data.movie) {
          const movieData = data.data.movie;
          console.log('🎬 Movie data received:', {
            name: movieData.name,
            year: movieData.year,
            rating: movieData.rating,
            duration: movieData.duration,
            category: movieData.category?.length,
            description: movieData.description?.length
          });
          
          // Merge with existing data to preserve user-specific info
          setEnhancedMovie(prev => ({
            ...prev,
            ...movieData,
            // Keep user-specific data
            addedAt: prev.addedAt || movieData.addedAt,
            watchedAt: prev.watchedAt || movieData.watchedAt,
            // Preserve original image URLs if new ones are not better
            poster_url: movieData.poster_url || prev.poster_url,
            thumb_url: movieData.thumb_url || prev.thumb_url,
            banner_url: movieData.banner_url || prev.banner_url
          }));
          
          setIsLoadingDetails(false);
          return;
        }
      } else if (response.status === 404) {
        console.log('🔄 404 error, trying alternative endpoint...');
        // Try alternative API endpoint
        const altApiUrl = `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(enhancedMovie.name || enhancedMovie.movieName)}`;
        console.log('📡 Alternative API URL:', altApiUrl);
        
        const altResponse = await fetch(altApiUrl);
        if (altResponse.ok) {
          const altData = await altResponse.json();
          console.log('📡 Alternative API Response:', altData);
          
          if (altData && altData.data && altData.data.items && altData.data.items.length > 0) {
            const foundMovie = altData.data.items[0]; // Take first result
            console.log('🎬 Found movie via search:', foundMovie.name);
            
            setEnhancedMovie(prev => ({
              ...prev,
              ...foundMovie,
              // Keep user-specific data
              addedAt: prev.addedAt || foundMovie.addedAt,
              watchedAt: prev.watchedAt || foundMovie.watchedAt,
              // Preserve original image URLs if new ones are not better
              poster_url: foundMovie.poster_url || prev.poster_url,
              thumb_url: foundMovie.thumb_url || prev.thumb_url,
              banner_url: foundMovie.banner_url || prev.banner_url
            }));
            
            setIsLoadingDetails(false);
            return;
          }
        }
      }
    } catch (error) {
      console.log('❌ Direct API failed:', error);
    }
    
    // No fallback needed since we're already using direct API
    console.log('❌ Direct API fetch failed, no fallback available');
    setIsLoadingDetails(false);
  };

  const handleMouseEnter = async () => {
    // Clear any existing hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    // Reset image load states
    setIsImageLoaded(false);
    setImageLoadError(false);
    
    // Preload image first
    const imageSrc = movieApi.getWebpImage(enhancedMovie.thumb_url || movie.thumb_url);
    console.log('🖼️ Preloading image:', imageSrc);
    
    try {
      await preloadImage(imageSrc);
      console.log('✅ Image preloaded, showing tooltip');
    } catch (error) {
      console.log('❌ Image preload failed, showing tooltip anyway');
      // Show tooltip even if image fails to load
    }
    
    // Set 1 second delay before showing tooltip (after image is loaded)
    const showTimeout = setTimeout(() => {
      setIsVisible(true);
      
      // Check if we need to fetch more details
      const hasBasicInfo = enhancedMovie.rating || enhancedMovie.year || enhancedMovie.duration || 
                          enhancedMovie.category || enhancedMovie.description || enhancedMovie.director || 
                          enhancedMovie.cast || enhancedMovie.origin_name;
      
      const hasSlugOrId = enhancedMovie.slug || enhancedMovie.movieSlug || enhancedMovie._id || enhancedMovie.movieId;
      
      console.log('🔍 Checking enhancement needs:', {
        hasBasicInfo,
        hasSlugOrId,
        currentData: {
          rating: enhancedMovie.rating,
          year: enhancedMovie.year,
          duration: enhancedMovie.duration,
          category: enhancedMovie.category?.length,
          description: enhancedMovie.description?.length,
          origin_name: enhancedMovie.origin_name
        }
      });
      
      // Always try to enhance if we don't have basic info and have a way to fetch
      if (!hasBasicInfo && hasSlugOrId && !isLoadingDetails) {
        console.log('🚀 Triggering enhancement fetch...');
        fetchMovieDetails(enhancedMovie._id || enhancedMovie.movieId, enhancedMovie.slug || enhancedMovie.movieSlug);
      }
    }, 1000);
    
    setShowTimeoutRef(showTimeout);
  };

  const handleMouseLeave = () => {
    // Clear show timeout if mouse leaves before delay
    if (showTimeoutRef) {
      clearTimeout(showTimeoutRef);
      setShowTimeoutRef(null);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
  };

  const handleTooltipMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
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
          className="fixed z-50 w-96 rounded-xl shadow-2xl overflow-hidden movie-tooltip hover-lift"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            pointerEvents: 'auto',
            animation: 'tooltipSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >

          {/* Movie Thumbnail - Increased size with animation */}
          <div className="relative h-56 overflow-hidden cursor-pointer animate-in slide-in-from-top-2 duration-500 delay-100">
            <img
              src={movieApi.getWebpImage(enhancedMovie.thumb_url || movie.thumb_url)}
              alt={enhancedMovie.name || enhancedMovie.movieName}
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              style={{ objectPosition: 'center center' }}
              onLoad={() => {
                console.log('✅ Tooltip thumbnail loaded:', enhancedMovie.thumb_url || movie.thumb_url);
              }}
              onError={(e) => {
                console.log('❌ Tooltip thumbnail failed:', {
                  src: e.target.src,
                  poster_url: enhancedMovie.poster_url,
                  thumb_url: enhancedMovie.thumb_url,
                  original_poster: movie.poster_url,
                  original_thumb: movie.thumb_url
                });
                
                // Try fallback to poster_url if thumb_url fails
                const fallbackSrc = enhancedMovie.poster_url || movie.poster_url;
                if (fallbackSrc && e.target.src !== movieApi.getWebpImage(fallbackSrc)) {
                  console.log('🔄 Trying fallback to poster:', fallbackSrc);
                  e.target.src = movieApi.getWebpImage(fallbackSrc);
                  return;
                }
                
                // If all fails, hide image and show gradient
                e.target.style.display = 'none';
                e.target.parentElement.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
              }}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            
            {/* Quality badge */}
            {enhancedMovie.quality && (
              <div className="absolute top-3 right-3">
                <span className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold">
                  {enhancedMovie.quality}
                </span>
              </div>
            )}
          </div>

          {/* Movie Info */}
          <div className="p-4 space-y-3 animate-in slide-in-from-bottom-2 duration-500 delay-200">
            {/* Movie Title */}
            <div className="animate-in slide-in-from-left-2 duration-500 delay-300">
              <h3 className="text-white font-bold text-lg mb-1 line-clamp-2 transition-colors duration-300 hover:text-yellow-400">
                {enhancedMovie.name || enhancedMovie.movieName}
              </h3>
              {(enhancedMovie.name_en || enhancedMovie.originalName || enhancedMovie.origin_name) && (
                <p className="text-yellow-400 text-sm font-medium transition-all duration-300 hover:text-yellow-300">
                  {enhancedMovie.name_en || enhancedMovie.originalName || enhancedMovie.origin_name}
                </p>
              )}
              {/* Loading indicator */}
              {isLoadingDetails && (
                <div className="flex items-center space-x-2 mt-2 animate-in fade-in duration-300">
                  <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                  <span className="text-yellow-400 text-xs">Đang tải thông tin...</span>
                </div>
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

            {/* Action Buttons - Equal Height with animations */}
            <div className="flex items-stretch space-x-2 animate-in slide-in-from-bottom-3 duration-500 delay-400">
              {/* Xem ngay button - Yellow, dominant */}
              <Link
                to={`/phim/${enhancedMovie.slug || enhancedMovie.movieSlug || enhancedMovie._id || enhancedMovie.movieId}`}
                className="flex-grow bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg transform"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Xem ngay</span>
              </Link>
              
              {/* Thích button - Gray, compact */}
              <button 
                onClick={handleAddToFavorites}
                className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg border border-gray-600 transition-all duration-300 flex items-center justify-center space-x-1 hover:scale-105 hover:shadow-lg transform"
                title="Thêm vào yêu thích"
              >
                <svg className="w-4 h-4 transition-transform duration-300 hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="text-sm">Thích</span>
              </button>
              
              {/* Chi tiết button - Gray, compact */}
              <Link
                to={`/phim/${enhancedMovie.slug || enhancedMovie.movieSlug || enhancedMovie._id || enhancedMovie.movieId}`}
                className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg border border-gray-600 transition-all duration-300 flex items-center justify-center space-x-1 hover:scale-105 hover:shadow-lg transform"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110">
                  <span className="text-black text-xs font-bold">i</span>
                </div>
                <span className="text-sm">Chi tiết</span>
              </Link>
            </div>

            {/* Movie Metadata - All in One Row */}
            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-500 delay-500">
              {/* Single row: Rating, Year, Duration, Type, Episode, Quality - All horizontal */}
              <div className="flex items-center flex-wrap gap-3 text-sm">
                {/* Rating */}
                {(enhancedMovie.rating || enhancedMovie.content_rating) && (
                  <div className="flex items-center space-x-1">
                    {getRatingBadge(enhancedMovie.rating || enhancedMovie.content_rating)}
                  </div>
                )}
                
                {/* Year */}
                {(enhancedMovie.year || enhancedMovie.release_year) && (
                  <span className="text-white font-medium">
                    {formatYear(enhancedMovie.year || enhancedMovie.release_year)}
                  </span>
                )}
                
                {/* Duration */}
                {(enhancedMovie.duration || enhancedMovie.runtime) && (
                  <span className="text-white font-medium">
                    {getDuration(enhancedMovie.duration || enhancedMovie.runtime)}
                  </span>
                )}

                {/* Movie type */}
                {enhancedMovie.type && (
                  <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full border border-blue-600/30">
                    {enhancedMovie.type === 'single' ? 'Phim lẻ' : enhancedMovie.type === 'series' ? 'Phim bộ' : enhancedMovie.type}
                  </span>
                )}

                {/* Episode status or Duration */}
                {enhancedMovie.episode_current && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    (() => {
                      // Check if it's a single movie or animation with 1 episode
                      const isSingleMovie = enhancedMovie.type === 'single' || 
                                          enhancedMovie.type === 'movie' ||
                                          (enhancedMovie.episode_total && parseInt(enhancedMovie.episode_total.toString().replace(/[^\d]/g, '')) === 1) ||
                                          (enhancedMovie.category && enhancedMovie.category.some(cat => 
                                            cat.name && (cat.name.toLowerCase().includes('hoạt hình') || cat.name.toLowerCase().includes('animation'))
                                          ));
                      
                      if (isSingleMovie) {
                        // For single movies, always show green (completed)
                        return 'bg-green-600/20 text-green-400 border-green-600/30';
                      }
                      
                      // For series, use existing logic
                      const episodeStr = enhancedMovie.episode_current.toString();
                      let isCompleted = false;
                      
                      // Check if episode_current has "/" format
                      if (episodeStr.includes('/')) {
                        const parts = episodeStr.split('/');
                        const currentPart = parts[0].replace(/[^\d]/g, '');
                        const totalPart = parts[1].replace(/[^\d]/g, '');
                        
                        isCompleted = enhancedMovie.status === 'completed' || 
                                     enhancedMovie.status === 'hoàn thành' || 
                                     enhancedMovie.status === 'finished' ||
                                     enhancedMovie.status === 'ended' ||
                                     enhancedMovie.status === 'complete' ||
                                     parseInt(currentPart) >= parseInt(totalPart);
                      } else {
                        // Original logic for non-"/" format
                        const currentNum = episodeStr.replace(/[^\d]/g, '');
                        const totalNum = enhancedMovie.episode_total ? enhancedMovie.episode_total.toString().replace(/[^\d]/g, '') : null;
                        
                        isCompleted = enhancedMovie.status === 'completed' || 
                                     enhancedMovie.status === 'hoàn thành' || 
                                     enhancedMovie.status === 'finished' ||
                                     enhancedMovie.status === 'ended' ||
                                     enhancedMovie.status === 'complete' ||
                                     (totalNum && parseInt(currentNum) >= parseInt(totalNum)) ||
                                     episodeStr.toLowerCase().includes('hoàn tất') ||
                                     episodeStr.toLowerCase().includes('complete') ||
                                     episodeStr.toLowerCase().includes('finished');
                      }
                      
                      return isCompleted 
                        ? 'bg-green-600/20 text-green-400 border-green-600/30'
                        : 'bg-orange-600/20 text-orange-400 border-orange-600/30';
                    })()
                  }`}>
                    {(() => {
                      // Check if it's a single movie or animation with 1 episode
                      const isSingleMovie = enhancedMovie.type === 'single' || 
                                          enhancedMovie.type === 'movie' ||
                                          (enhancedMovie.episode_total && parseInt(enhancedMovie.episode_total.toString().replace(/[^\d]/g, '')) === 1) ||
                                          (enhancedMovie.category && enhancedMovie.category.some(cat => 
                                            cat.name && (cat.name.toLowerCase().includes('hoạt hình') || cat.name.toLowerCase().includes('animation'))
                                          ));
                      
                      if (isSingleMovie) {
                        // Show duration for single movies - try multiple fields
                        const duration = enhancedMovie.duration || 
                                       enhancedMovie.runtime || 
                                       enhancedMovie.time || 
                                       enhancedMovie.length || 
                                       enhancedMovie.duration_minutes ||
                                       enhancedMovie.movie_duration;
                        
                        console.log('🎬 Duration Debug:', {
                          movieName: enhancedMovie.name || enhancedMovie.movieName,
                          duration: duration,
                          durationType: typeof duration,
                          allDurationFields: {
                            duration: enhancedMovie.duration,
                            runtime: enhancedMovie.runtime,
                            time: enhancedMovie.time,
                            length: enhancedMovie.length,
                            duration_minutes: enhancedMovie.duration_minutes,
                            movie_duration: enhancedMovie.movie_duration
                          }
                        });
                        
                        const formattedDuration = getDuration(duration);
                        console.log('🎬 Formatted Duration:', formattedDuration);
                        return formattedDuration || 'N/A';
                      }
                      
                      // Show episode status for series
                      return formatEpisodeStatus(enhancedMovie.episode_current, enhancedMovie.episode_total, enhancedMovie.status);
                    })()}
                  </span>
                )}

                {/* Movie quality */}
                {enhancedMovie.quality && (
                  <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full border border-red-600/30">
                    {enhancedMovie.quality}
                  </span>
                )}
                
                {/* Fallback info if no metadata available */}
                {!enhancedMovie.rating && !enhancedMovie.year && !enhancedMovie.duration && !enhancedMovie.content_rating && !enhancedMovie.release_year && !enhancedMovie.runtime && !enhancedMovie.type && !enhancedMovie.episode_current && !enhancedMovie.quality && !isLoadingDetails && (
                  <span className="text-gray-400 text-sm">
                    Thông tin phim
                  </span>
                )}
              </div>

              {/* Genres */}
              {(enhancedMovie.category && enhancedMovie.category.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  {enhancedMovie.category.map((cat, index) => (
                    <span key={index} className="text-white text-sm">
                      {cat.name}
                      {index < enhancedMovie.category.length - 1 && <span className="mx-1">•</span>}
                    </span>
                  ))}
                </div>
              )}

              {/* Third row: Additional info - Horizontal layout */}
              <div className="flex items-center flex-wrap gap-3">
                {/* Total episodes */}
                {enhancedMovie.episode_total && (
                  <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full border border-purple-600/30">
                    {enhancedMovie.episode_total} tập
                  </span>
                )}

                {/* Movie status */}
                {enhancedMovie.status && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    enhancedMovie.status === 'ongoing' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' :
                    enhancedMovie.status === 'completed' ? 'bg-green-600/20 text-green-400 border-green-600/30' :
                    enhancedMovie.status === 'upcoming' ? 'bg-blue-600/20 text-blue-400 border-blue-600/30' :
                    'bg-gray-600/20 text-gray-400 border-gray-600/30'
                  }`}>
                    {enhancedMovie.status === 'ongoing' ? 'Đang phát' :
                     enhancedMovie.status === 'completed' ? 'Hoàn thành' :
                     enhancedMovie.status === 'upcoming' ? 'Sắp ra mắt' :
                     enhancedMovie.status}
                  </span>
                )}

                {/* Movie language */}
                {enhancedMovie.language && (
                  <span className="text-xs bg-cyan-600/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-600/30">
                    {enhancedMovie.language}
                  </span>
                )}

                {/* Watch time info for history */}
                {(enhancedMovie.watchedAt || movie.watchedAt) && (
                  <span className="text-xs text-gray-300">
                    Xem: {new Date(enhancedMovie.watchedAt || movie.watchedAt).toLocaleDateString('vi-VN')}
                  </span>
                )}

                {/* Added time info for user tabs */}
                {(enhancedMovie.addedAt || movie.addedAt) && (
                  <span className="text-xs text-gray-300">
                    Thêm: {new Date(enhancedMovie.addedAt || movie.addedAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>

              {/* Movie description */}
              {enhancedMovie.description && (
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                  {enhancedMovie.description}
                </p>
              )}

              {/* Fourth row: Director and Cast - Horizontal layout */}
              <div className="flex items-center flex-wrap gap-3">
                {/* Movie director */}
                {enhancedMovie.director && (
                  <span className="text-xs text-white font-medium">
                    ĐD: {enhancedMovie.director}
                  </span>
                )}

                {/* Movie cast */}
                {enhancedMovie.cast && enhancedMovie.cast.length > 0 && (
                  <span className="text-xs text-white">
                    DV: {enhancedMovie.cast.slice(0, 2).map(actor => actor).join(', ')}
                    {enhancedMovie.cast.length > 2 && ` +${enhancedMovie.cast.length - 2}`}
                  </span>
                )}
              </div>
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

// CSS Animation Styles
const tooltipStyles = `
  @keyframes tooltipSlideIn {
    0% {
      opacity: 0;
      transform: translateY(-20px) scale(0.9) rotateX(-10deg);
      filter: blur(4px);
    }
    50% {
      opacity: 0.8;
      transform: translateY(-5px) scale(0.98) rotateX(-2deg);
      filter: blur(1px);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1) rotateX(0deg);
      filter: blur(0px);
    }
  }
  
  @keyframes tooltipSlideOut {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1) rotateX(0deg);
      filter: blur(0px);
    }
    100% {
      opacity: 0;
      transform: translateY(-15px) scale(0.95) rotateX(5deg);
      filter: blur(2px);
    }
  }
  
  @keyframes tooltipGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
    }
  }
  
  .movie-tooltip {
    animation: tooltipSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    backdrop-filter: blur(10px);
    background: linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
    border: 1px solid rgba(59, 130, 246, 0.2);
  }
  
  .movie-tooltip:hover {
    animation: tooltipGlow 2s ease-in-out infinite;
  }
  
  .movie-tooltip.fade-out {
    animation: tooltipSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  /* Staggered animation for child elements */
  .movie-tooltip > * {
    animation-delay: calc(var(--animation-delay, 0) * 0.1s);
  }
  
  /* Enhanced hover effects */
  .movie-tooltip .hover-lift {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .movie-tooltip .hover-lift:hover {
    transform: translateY(-2px);
  }
`;

// Inject styles into the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = tooltipStyles;
  document.head.appendChild(styleElement);
}

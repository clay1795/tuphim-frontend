import { useEffect, useState, useCallback } from "react";
import { getApiUrl, buildApiUrl } from '../utils/apiConfig.js';
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
// Removed simpleMovieApi import - using backend API
import { useAuth } from "../context/AuthContextSimple";

const Banner = ({ onFeaturedMovieChange }) => {
  const { user, addToFavorites } = useAuth();
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [suggestedMovies, setSuggestedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMessage, setUserMessage] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Handle add to favorites
  const handleAddToFavorites = async (movie) => {
    if (!user) {
      setUserMessage('Vui lòng đăng nhập để thêm vào yêu thích');
      setTimeout(() => setUserMessage(''), 3000);
      return;
    }

    try {
      const result = await addToFavorites({
        movieId: movie._id,
        movieSlug: movie.slug,
        movieName: movie.name,
        poster_url: movie.poster_url,
        thumb_url: movie.thumb_url,
        banner_url: movie.banner_url,
        originalName: movie.original_name || movie.name
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

  // Helper function to get optimized image URL
  const getOptimizedImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    // Nếu là URL từ TMDB, trả về trực tiếp
    if (imageUrl.includes('image.tmdb.org')) {
      return imageUrl;
    }
    
    // Nếu đã là URL từ phimimg.com, trả về nguyên
    if (imageUrl.includes('phimimg.com')) {
      return imageUrl;
    }
    
    // Nếu là URL từ KKPhim, chuyển đổi sang phimimg.com
    if (imageUrl.includes('kkphim') || imageUrl.includes('phimapi')) {
      return imageUrl.replace(/https?:\/\/[^/]+/, 'https://phimimg.com');
    }
    
    return imageUrl;
  };

  const loadFeaturedMovie = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading featured movie...');
      
      // Try to fetch real data from API
      console.log('Fetching real movie data from API...');
      
      const response = await fetch(`${getApiUrl()}/mongo-movies/new?page=1&limit=24`);
      const data = await response.json();
      console.log('Banner API Response:', data);
      console.log('Items length:', data.data?.items?.length);
      
      if (data.success && data.data && data.data.items && data.data.items.length > 0) {
        const movie = data.data.items[0];
        console.log('Setting featured movie:', movie);
        console.log('Movie content:', movie.content);
        console.log('Movie name:', movie.name);
        console.log('Movie origin_name:', movie.origin_name);
        
        // Nếu không có content, thử lấy thông tin chi tiết
        if (!movie.content && movie.slug) {
          try {
            console.log('Fetching detailed movie info for:', movie.slug);
            const response = await fetch(`${getApiUrl()}/mongo-movies/detail/${movie.slug}`);
            const result = await response.json();
            const detailedMovie = result.data;
            console.log('Detailed movie info:', detailedMovie);
            if (detailedMovie && detailedMovie.content) {
              movie.content = detailedMovie.content;
              console.log('Updated movie with detailed content:', movie.content);
            }
          } catch (detailError) {
            console.log('Could not fetch detailed movie info:', detailError);
          }
        }
        
        setFeaturedMovie(movie);
        // Truyền featuredMovie lên App
        if (onFeaturedMovieChange) {
          onFeaturedMovieChange(movie);
        }
        
        // Lấy 4 phim đề xuất (bỏ qua phim đầu tiên)
        const suggestions = data.data.items.slice(1, 5);
        console.log('Suggested movies data:', suggestions);
        console.log('Suggested movies image URLs:', suggestions.map(m => ({
          name: m.name,
          banner_url: m.banner_url,
          poster_url: m.poster_url,
          thumb_url: m.thumb_url,
          optimized_banner: getOptimizedImageUrl(m.banner_url || m.poster_url || m.thumb_url),
          optimized_poster: getOptimizedImageUrl(m.poster_url || m.thumb_url)
        })));
        setSuggestedMovies(suggestions);
      } else {
        console.log('No movies found in API response, using fallback data');
        // Fallback data khi không có dữ liệu
        setFeaturedMovie({
          _id: 'fallback-movie',
          name: 'Phim Hay Mới Nhất',
          slug: 'phim-hay-moi-nhat',
          thumb_url: '/src/assets/temp-1.jpeg',
          poster_url: '/src/assets/temp-1.jpeg',
          banner_url: '/src/assets/temp-1.jpeg',
          year: '2024',
          content: 'Khám phá những bộ phim hay nhất, mới nhất với chất lượng HD. Trải nghiệm xem phim tuyệt vời với giao diện hiện đại và tính năng đầy đủ.',
          category: [{ name: 'Hành Động' }, { name: 'Viễn Tưởng' }],
          origin_name: 'Latest Movies',
          quality: 'HD'
        });
        
        setSuggestedMovies([
          {
            _id: 'suggested1',
            name: 'Phim Đề Xuất 1',
            slug: 'phim-de-xuat-1',
            poster_url: '/src/assets/temp-1.jpeg',
            thumb_url: '/src/assets/temp-1.jpeg'
          },
          {
            _id: 'suggested2',
            name: 'Phim Đề Xuất 2',
            slug: 'phim-de-xuat-2',
            poster_url: '/src/assets/temp-1.jpeg',
            thumb_url: '/src/assets/temp-1.jpeg'
          },
          {
            _id: 'suggested3',
            name: 'Phim Đề Xuất 3',
            slug: 'phim-de-xuat-3',
            poster_url: '/src/assets/temp-1.jpeg',
            thumb_url: '/src/assets/temp-1.jpeg'
          },
          {
            _id: 'suggested4',
            name: 'Phim Đề Xuất 4',
            slug: 'phim-de-xuat-4',
            poster_url: '/src/assets/temp-1.jpeg',
            thumb_url: '/src/assets/temp-1.jpeg'
          }
        ]);
        
        if (onFeaturedMovieChange) {
          onFeaturedMovieChange({
            _id: 'fallback-movie',
            name: 'Phim Hay Mới Nhất',
            slug: 'phim-hay-moi-nhat'
          });
        }
      }
    } catch (error) {
      console.error('Error loading featured movie:', error);
      
      // Check if it's a rate limiting error
      if (error.message.includes('Too many requests') || error.message.includes('rate limit')) {
        console.log('Rate limit hit, using fallback data');
        setFeaturedMovie({
          _id: 'rate-limit-fallback',
          name: 'Phim đang tải...',
          slug: 'phim-dang-tai',
          thumb_url: '/src/assets/temp-1.jpeg',
          poster_url: '/src/assets/temp-1.jpeg',
          year: '2024',
          content: 'Đang tải nội dung phim, vui lòng chờ...',
          category: [{ name: 'Đang tải' }]
        });
        setSuggestedMovies([]);
        return;
      }
      
      // Fallback to sample data only on network errors
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.log('Network error, using fallback data');
        setFeaturedMovie({
          _id: 'sample',
          name: 'Phim Hay Mới Nhất',
          slug: 'phim-hay-moi-nhat',
          thumb_url: '/src/assets/temp-1.jpeg',
          poster_url: '/src/assets/temp-1.jpeg',
          banner_url: '/src/assets/temp-1.jpeg',
          year: '2024',
          rating: 8.5,
          quality: 'HD',
          category: [{ name: 'Hành động' }],
          country: [{ name: 'Việt Nam' }],
          content: 'Khám phá những bộ phim hay nhất, mới nhất với chất lượng HD. Trải nghiệm xem phim tuyệt vời với giao diện hiện đại và tính năng đầy đủ.',
          tmdb: { vote_average: 8.5 }
        });
        
        // Sample suggested movies
        setSuggestedMovies([
          {
            _id: 'sample1',
            name: 'Phim đề xuất 1',
            slug: 'phim-de-xuat-1',
            poster_url: '/src/assets/temp-1.jpeg',
            thumb_url: '/src/assets/temp-1.jpeg'
          },
          {
            _id: 'sample2',
            name: 'Phim đề xuất 2',
            slug: 'phim-de-xuat-2',
            poster_url: '/src/assets/temp-1.jpeg',
            thumb_url: '/src/assets/temp-1.jpeg'
          },
          {
            _id: 'sample3',
            name: 'Phim đề xuất 3',
            slug: 'phim-de-xuat-3',
            poster_url: '/src/assets/temp-1.jpeg',
            thumb_url: '/src/assets/temp-1.jpeg'
          },
          {
            _id: 'sample4',
            name: 'Phim đề xuất 4',
            slug: 'phim-de-xuat-4',
            poster_url: '/src/assets/temp-1.jpeg',
            thumb_url: '/src/assets/temp-1.jpeg'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [onFeaturedMovieChange]);

  useEffect(() => {
    if (!hasLoaded) {
      loadFeaturedMovie();
      setHasLoaded(true);
    }
  }, [loadFeaturedMovie, hasLoaded]);


  const getDynamicFontStyle = (movie) => {
    // Style đơn giản và ổn định cho tất cả phim
    return {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontWeight: '700',
      color: '#ffffff',
      textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
      letterSpacing: '0.5px'
    };
  };

  const handleMovieSwitch = (selectedMovie, selectedIndex) => {
    // Chuyển phim được chọn thành phim chính
    setFeaturedMovie(selectedMovie);
    // Truyền featuredMovie mới lên App
    if (onFeaturedMovieChange) {
      onFeaturedMovieChange(selectedMovie);
    }
    
    // Cập nhật danh sách đề xuất: thêm phim cũ vào đầu, loại bỏ phim đã chọn
    const newSuggestions = [featuredMovie, ...suggestedMovies.filter((_, i) => i !== selectedIndex)];
    setSuggestedMovies(newSuggestions.slice(0, 4));
  };



  if (loading) {
    return (
      <div className="relative h-[80vh] bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-medium">Đang tải phim...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!featuredMovie) {
    return (
      <div className="relative h-[80vh] bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-xl">Không có phim nào</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ===== HERO (≈80%) - Extended for full featured movie display ===== */}
      <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[380px] sm:min-h-[420px] md:min-h-[500px] lg:min-h-[600px] -mt-16 sm:-mt-20 banner-hero">
        {/* Background - Extended to cover header area */}
        <img
          key={featuredMovie._id}
          src={getOptimizedImageUrl(featuredMovie.banner_url || featuredMovie.thumb_url)}
          alt={featuredMovie.name}
          className="absolute inset-0 w-full h-full object-cover object-center animate-scaleIn transition-all duration-1000 ease-in-out"
          style={{
            top: '-64px', // Reduced for mobile
            height: 'calc(100% + 64px)',
            objectPosition: 'center center'
          }}
          onError={(e) => {
            console.log('Featured movie image error:', featuredMovie.name, 'URL:', featuredMovie.banner_url || featuredMovie.poster_url || featuredMovie.thumb_url);
            // Fallback to a default gradient background instead of placeholder image
            e.target.style.display = 'none';
            e.target.parentElement.style.background = 'linear-gradient(135deg, #1f2937 0%, #374151 100%)';
          }}
          onLoad={() => {
            console.log('Featured movie image loaded:', featuredMovie.name);
          }}
        />
        {/* Gradient overlay trái->phải để chữ nổi */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10"></div>

               {/* Content */}
               <div className="relative h-full">
                 {/* Movie Info - Left Aligned & Centered - Seamless */}
                 <div className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20">
                   <div key={featuredMovie._id} className="p-3 sm:p-6 max-w-xs sm:max-w-md animate-fadeInUp" style={{ background: 'none', backgroundColor: 'transparent' }}>
                     {/* Title - Dynamic Font based on thumbnail */}
                     <h1 
                       className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight mb-2 sm:mb-3 max-w-full"
                       style={{
                         ...getDynamicFontStyle(featuredMovie),
                         wordBreak: 'break-word',
                         overflowWrap: 'break-word',
                         hyphens: 'auto',
                         display: '-webkit-box',
                         WebkitLineClamp: '3',
                         WebkitBoxOrient: 'vertical',
                         overflow: 'hidden',
                         background: 'none',
                         backgroundColor: 'transparent'
                       }}
                     >
                       {featuredMovie.name?.toUpperCase()}
              </h1>
                     
                     {/* English Title */}
                     {(featuredMovie.origin_name || featuredMovie.name_en) && (
                       <h2 
                         className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 italic font-light mb-2 sm:mb-3 drop-shadow-lg max-w-full"
                         style={{
                           display: '-webkit-box',
                           WebkitLineClamp: '2',
                           WebkitBoxOrient: 'vertical',
                           overflow: 'hidden',
                           wordBreak: 'break-word',
                           overflowWrap: 'break-word',
                           background: 'none',
                           backgroundColor: 'transparent'
                         }}
                       >
                         {featuredMovie.origin_name || featuredMovie.name_en}
                       </h2>
                     )}

                     {/* Categories */}
                     {featuredMovie.category && featuredMovie.category.length > 0 && (
                       <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                         {featuredMovie.category.slice(0, 3).map((cat, index) => (
                           <span key={index} className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-white/20 border border-white/30 backdrop-blur-sm text-white drop-shadow-lg">
                             {cat.name}
                           </span>
                         ))}
                       </div>
                     )}

                     {/* User Message */}
                     {userMessage && (
                       <div className={`mb-4 p-3 rounded-lg backdrop-blur-sm ${
                         userMessage.includes('thành công') || userMessage.includes('Đã thêm')
                           ? 'bg-green-600/20 border border-green-500/50 text-green-300'
                           : 'bg-red-600/20 border border-red-500/50 text-red-300'
                       }`}>
                         {userMessage}
                       </div>
                     )}

                     {/* Movie Content */}
                     <div className="mb-3 sm:mb-4">
                       <p className="text-xs sm:text-sm text-gray-200 leading-relaxed drop-shadow-lg line-clamp-3 sm:line-clamp-4">
                         {featuredMovie.content || 
                          `Khám phá câu chuyện hấp dẫn của ${featuredMovie.name || 'bộ phim này'}. Một tác phẩm điện ảnh đầy cảm xúc và ý nghĩa, mang đến những trải nghiệm thú vị cho người xem.`}
              </p>
            </div>

                     {/* Actions */}
                     <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
                       {/* Play Button - Circular with gradient */}
                       <Link
                         to={`/phim/${featuredMovie.slug || featuredMovie._id}`}
                         className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 
                                   flex items-center justify-center shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105 touch-target"
                       >
                         <div className="w-0 h-0 border-l-[8px] sm:border-l-[10px] md:border-l-[12px] border-l-black border-t-[6px] sm:border-t-[7px] md:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[7px] md:border-b-[8px] border-b-transparent ml-0.5 sm:ml-1"></div>
                       </Link>
                       
                       {/* Heart and Info Buttons - Shared container */}
                       <div className="flex items-center gap-1 bg-gray-800/60 backdrop-blur-sm rounded-md sm:rounded-lg border border-gray-600/50 shadow-lg">
                         {/* Heart Button */}
                         <button 
                           onClick={() => handleAddToFavorites(featuredMovie)}
                           className="p-2 sm:p-3 hover:bg-white/10 transition-colors duration-300 rounded-l-md sm:rounded-l-lg touch-target"
                           title="Thêm vào yêu thích"
                         >
                           <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                           </svg>
                         </button>
                         
                         {/* Divider */}
                         <div className="w-px h-4 sm:h-6 bg-gray-600/50"></div>
                         
                         {/* Info Button */}
                         <Link
                           to={`/phim/${featuredMovie.slug || featuredMovie._id}`}
                           className="p-2 sm:p-3 hover:bg-white/10 transition-colors duration-300 rounded-r-md sm:rounded-r-lg touch-target"
                         >
                           <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center">
                             <span className="text-black text-xs font-bold">i</span>
                           </div>
                         </Link>
                       </div>
            </div>
          </div>
        </div>

                 {/* Suggested Movies - Mobile: Horizontal Scroll at Bottom, Desktop: Corner Panel */}
                 
                 {/* Mobile: Overlay on Main Banner */}
                 <div className="lg:hidden absolute bottom-4 left-4 right-4 z-20">
                   <div className="flex justify-center space-x-2">
                     {suggestedMovies.slice(0, 6).map((movie, index) => (
                       <div
                         key={`${movie._id || index}-${featuredMovie._id}`}
                         onClick={() => handleMovieSwitch(movie, index)}
                         className="relative group cursor-pointer touch-target flex-shrink-0"
                       >
                         <div className={`relative w-12 h-8 rounded overflow-hidden border transition-all duration-500 group-hover:scale-110 bg-gray-800 shadow-lg backdrop-blur-sm ${
                           movie._id === featuredMovie._id 
                             ? `border-yellow-400 shadow-yellow-400/50 ${
                                 index < 3 ? 'animate-slideFromLeft' : 'animate-slideFromRight'
                               }`
                             : `border-white/50 hover:border-yellow-400`
                         }`} style={{
                           animationDelay: movie._id === featuredMovie._id ? '0s' : `${index * 0.1}s`
                         }}>
                           <img
                             src={movie.thumbnail_url || movie.thumb_url || getOptimizedImageUrl(movie.poster_url)}
                             alt={movie.name}
                             className="w-full h-full object-cover object-center"
                             style={{
                               objectPosition: 'center center'
                             }}
                             onError={(e) => {
                               console.log('Suggested movie image error:', movie.name, 'URL:', movie.thumbnail_url || movie.thumb_url || movie.poster_url);
                               e.target.style.display = 'none';
                               e.target.parentElement.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                             }}
                             onLoad={() => {
                               console.log('Suggested movie image loaded:', movie.name);
                             }}
                           />
                           
                           {/* Hover Overlay */}
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded">
                             <div className="text-white text-[8px] font-bold bg-yellow-500 px-1 py-0.5 rounded shadow-lg">
                               ▶
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Desktop: Overlay on Main Banner */}
                 <div className="hidden lg:block absolute right-6 bottom-12 z-20">
                   <div className="flex space-x-2">
                     {suggestedMovies.slice(0, 6).map((movie, index) => (
                       <div
                         key={`${movie._id || index}-${featuredMovie._id}`}
                         onClick={() => handleMovieSwitch(movie, index)}
                         className="relative group cursor-pointer touch-target"
                       >
                         <div className={`relative w-20 h-12 rounded overflow-hidden border transition-all duration-500 group-hover:scale-110 bg-gray-800 shadow-lg backdrop-blur-sm ${
                           movie._id === featuredMovie._id 
                             ? `border-yellow-400 shadow-yellow-400/50 ${
                                 index < 3 ? 'animate-slideFromLeft' : 'animate-slideFromRight'
                               }`
                             : `border-white/50 hover:border-yellow-400`
                         }`} style={{
                           animationDelay: movie._id === featuredMovie._id ? '0s' : `${index * 0.1}s`
                         }}>
                           <img
                             src={movie.thumbnail_url || movie.thumb_url || getOptimizedImageUrl(movie.poster_url)}
                             alt={movie.name}
                             className="w-full h-full object-cover object-center"
                             style={{
                               objectPosition: 'center center'
                             }}
                             onError={(e) => {
                               e.target.style.display = 'none';
                               e.target.parentElement.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                             }}
                           />
                           
                           {/* Hover Overlay - No play button on desktop */}
                           <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded">
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
      </section>


    </>
  );
};

Banner.propTypes = {
  onFeaturedMovieChange: PropTypes.func,
};

export default Banner;
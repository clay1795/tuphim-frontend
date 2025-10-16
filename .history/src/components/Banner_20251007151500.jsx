import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import simpleMovieApi from "../services/simpleMovieApi";

const Banner = ({ onFeaturedMovieChange }) => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [suggestedMovies, setSuggestedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const loadFeaturedMovie = async () => {
    try {
      setLoading(true);
      const data = await simpleMovieApi.getNewMovies(1);
      console.log('Banner API Response:', data);
      console.log('Items length:', data.items?.length);
      
      if (data.items && data.items.length > 0) {
        const movie = data.items[0];
        console.log('Setting featured movie:', movie);
        console.log('Movie content:', movie.content);
        console.log('Movie name:', movie.name);
        console.log('Movie origin_name:', movie.origin_name);
        
        // Nếu không có content, thử lấy thông tin chi tiết
        if (!movie.content && movie.slug) {
          try {
            console.log('Fetching detailed movie info for:', movie.slug);
            const detailedMovie = await simpleMovieApi.getMovieDetail(movie.slug);
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
        const suggestions = data.items.slice(1, 5);
        console.log('Suggested movies data:', suggestions);
        console.log('Suggested movies image URLs:', suggestions.map(m => ({
          name: m.name,
          poster_url: m.poster_url,
          thumb_url: m.thumb_url,
          optimized_url: getOptimizedImageUrl(m.poster_url || m.thumb_url)
        })));
        setSuggestedMovies(suggestions);
      } else {
        console.log('No movies found in API response');
      }
    } catch (error) {
      console.error('Error loading featured movie:', error);
      // Fallback to sample data only on network errors
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setFeaturedMovie({
          _id: 'sample',
          name: 'Phim mẫu',
          slug: 'phim-mau',
          thumb_url: '/src/assets/temp-1.jpeg',
          poster_url: '/src/assets/temp-1.jpeg',
          year: '2024',
          rating: 8.5,
          quality: 'HD',
          category: [{ name: 'Hành động' }],
          country: [{ name: 'Việt Nam' }],
          content: 'Mô tả phim mẫu',
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
  };

  useEffect(() => {
    loadFeaturedMovie();
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

  const getDynamicFontStyle = (movie) => {
    // Lấy URL poster để phân tích
    const posterUrl = movie.poster_url || movie.thumb_url;
    
    // Tạo hash từ URL để có consistency
    const hash = posterUrl ? posterUrl.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0) : 0;
    
    // Phân tích dựa trên hash và đặc điểm poster
    const styleIndex = Math.abs(hash) % 8;
    
    // Thêm phân tích màu sắc dựa trên tên phim và thể loại
    const movieName = movie.name?.toLowerCase() || '';
    const primaryCategory = movie.category?.[0]?.name?.toLowerCase() || '';
    
    // Điều chỉnh style dựa trên nội dung phim
    let colorAdjustment = '';
    if (primaryCategory.includes('kinh dị') || primaryCategory.includes('horror') || 
        movieName.includes('horror') || movieName.includes('ghost') || movieName.includes('ma')) {
      colorAdjustment = 'horror';
    } else if (primaryCategory.includes('tình cảm') || primaryCategory.includes('romance') || 
               movieName.includes('love') || movieName.includes('romance') || movieName.includes('tình')) {
      colorAdjustment = 'romance';
    } else if (primaryCategory.includes('hành động') || primaryCategory.includes('action') || 
               movieName.includes('action') || movieName.includes('fight') || movieName.includes('chiến')) {
      colorAdjustment = 'action';
    } else if (primaryCategory.includes('khoa học') || primaryCategory.includes('sci-fi') || 
               movieName.includes('sci-fi') || movieName.includes('space') || movieName.includes('không gian')) {
      colorAdjustment = 'scifi';
    } else if (primaryCategory.includes('hài') || primaryCategory.includes('comedy') || 
               movieName.includes('comedy') || movieName.includes('funny') || movieName.includes('hài')) {
      colorAdjustment = 'comedy';
    } else if (primaryCategory.includes('hoạt hình') || primaryCategory.includes('animation') || 
               movieName.includes('animation') || movieName.includes('cartoon') || movieName.includes('anime')) {
      colorAdjustment = 'animation';
    }
    
    const fontStyles = [
      // Style 1: Bold & Dramatic (cho poster tối màu)
      {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontWeight: '900',
        letterSpacing: '0.1em',
        textShadow: '0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.6)',
        color: '#ff4444',
        transform: 'scale(1.05)'
      },
      // Style 2: Elegant & Romantic (cho poster sáng màu)
      {
        fontFamily: 'Brush Script MT, cursive',
        fontWeight: '400',
        letterSpacing: '0.02em',
        textShadow: '0 0 15px rgba(255, 192, 203, 0.8), 0 0 30px rgba(255, 192, 203, 0.6)',
        color: '#ff69b4',
        transform: 'scale(1.02)'
      },
      // Style 3: Sci-Fi & Futuristic (cho poster xanh dương)
      {
        fontFamily: 'Orbitron, monospace',
        fontWeight: '700',
        letterSpacing: '0.08em',
        textShadow: '0 0 15px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.6)',
        color: '#00bfff',
        transform: 'scale(1.03)'
      },
      // Style 4: Horror & Creepy (cho poster tối/xanh lá)
      {
        fontFamily: 'Creepster, Chiller, fantasy',
        fontWeight: '400',
        letterSpacing: '0.05em',
        textShadow: '0 0 15px rgba(0, 255, 0, 0.8), 0 0 30px rgba(0, 255, 0, 0.6)',
        color: '#00ff00',
        transform: 'scale(1.04)'
      },
      // Style 5: Fun & Playful (cho poster sáng/vàng)
      {
        fontFamily: 'Bubblegum Sans, cursive',
        fontWeight: '400',
        letterSpacing: '0.02em',
        textShadow: '0 0 15px rgba(255, 255, 0, 0.8), 0 0 30px rgba(255, 255, 0, 0.6)',
        color: '#ffff00',
        transform: 'scale(1.01)'
      },
      // Style 6: Comic & Animated (cho poster cam)
      {
        fontFamily: 'Comic Sans MS, cursive',
        fontWeight: '700',
        letterSpacing: '0.03em',
        textShadow: '0 0 15px rgba(255, 165, 0, 0.8), 0 0 30px rgba(255, 165, 0, 0.6)',
        color: '#ffa500',
        transform: 'scale(1.02)'
      },
      // Style 7: Classic & Timeless (cho poster trung tính)
      {
        fontFamily: 'Times New Roman, serif',
        fontWeight: '700',
        letterSpacing: '0.03em',
        textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6)',
        color: '#ffffff',
        transform: 'scale(1.01)'
      },
      // Style 8: Modern & Clean (cho poster hiện đại)
      {
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: '800',
        letterSpacing: '0.06em',
        textShadow: '0 0 15px rgba(128, 128, 128, 0.8), 0 0 30px rgba(128, 128, 128, 0.6)',
        color: '#cccccc',
        transform: 'scale(1.03)'
      }
    ];
    
    // Lấy base style
    const baseStyle = fontStyles[styleIndex];
    
    // Áp dụng color adjustment dựa trên nội dung phim
    if (colorAdjustment === 'horror') {
      return {
        ...baseStyle,
        color: '#00ff00',
        textShadow: '0 0 15px rgba(0, 255, 0, 0.8), 0 0 30px rgba(0, 255, 0, 0.6)',
        fontFamily: 'Creepster, Chiller, fantasy'
      };
    } else if (colorAdjustment === 'romance') {
      return {
        ...baseStyle,
        color: '#ff69b4',
        textShadow: '0 0 15px rgba(255, 192, 203, 0.8), 0 0 30px rgba(255, 192, 203, 0.6)',
        fontFamily: 'Brush Script MT, cursive'
      };
    } else if (colorAdjustment === 'action') {
      return {
        ...baseStyle,
        color: '#ff4444',
        textShadow: '0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.6)',
        fontFamily: 'Impact, Arial Black, sans-serif'
      };
    } else if (colorAdjustment === 'scifi') {
      return {
        ...baseStyle,
        color: '#00bfff',
        textShadow: '0 0 15px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.6)',
        fontFamily: 'Orbitron, monospace'
      };
    } else if (colorAdjustment === 'comedy') {
      return {
        ...baseStyle,
        color: '#ffff00',
        textShadow: '0 0 15px rgba(255, 255, 0, 0.8), 0 0 30px rgba(255, 255, 0, 0.6)',
        fontFamily: 'Bubblegum Sans, cursive'
      };
    } else if (colorAdjustment === 'animation') {
      return {
        ...baseStyle,
        color: '#ffa500',
        textShadow: '0 0 15px rgba(255, 165, 0, 0.8), 0 0 30px rgba(255, 165, 0, 0.6)',
        fontFamily: 'Comic Sans MS, cursive'
      };
    }
    
    return baseStyle;
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
      <div className="relative h-[80vh] bg-gradient-to-r from-gray-900 to-gray-800 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-xl">Đang tải...</div>
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
      <section className="relative h-[80vh] min-h-[600px] -mt-20">
        {/* Background - Extended to cover header area */}
        <img
          src={getOptimizedImageUrl(featuredMovie.banner_url || featuredMovie.poster_url || featuredMovie.thumb_url)}
          alt={featuredMovie.name}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000"
          style={{
            top: '-80px', // Extend image upward to cover header
            height: 'calc(100% + 80px)',
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
                 <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
                   <div className="p-6 max-w-md">
                     {/* Title - Dynamic Font */}
                     <h1 
                       className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-3"
                       style={getDynamicFontStyle(featuredMovie)}
                     >
                       {featuredMovie.name?.toUpperCase()}
              </h1>
                     
                     {/* English Title */}
                     {(featuredMovie.origin_name || featuredMovie.name_en) && (
                       <h2 className="text-lg md:text-xl text-gray-300 italic font-light mb-3 drop-shadow-lg">
                         {featuredMovie.origin_name || featuredMovie.name_en}
                       </h2>
                     )}

                     {/* Categories */}
                     {featuredMovie.category && featuredMovie.category.length > 0 && (
                       <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                         {featuredMovie.category.slice(0, 4).map((cat, index) => (
                           <span key={index} className="px-2 py-1 rounded bg-white/20 border border-white/30 backdrop-blur-sm text-white drop-shadow-lg">
                             {cat.name}
                           </span>
                         ))}
              </div>
                     )}

                     {/* Movie Content */}
                     <div className="mb-4">
                       <p className="text-sm text-gray-200 leading-relaxed drop-shadow-lg line-clamp-4">
                         {featuredMovie.content || 
                          `Khám phá câu chuyện hấp dẫn của ${featuredMovie.name || 'bộ phim này'}. Một tác phẩm điện ảnh đầy cảm xúc và ý nghĩa, mang đến những trải nghiệm thú vị cho người xem.`}
              </p>
            </div>

                     {/* Actions */}
                     <div className="flex items-center gap-4">
                       {/* Play Button - Circular with gradient */}
                       <Link
                         to={`/phim/${featuredMovie.slug || featuredMovie._id}`}
                         className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 
                                   flex items-center justify-center shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105"
                       >
                         <div className="w-0 h-0 border-l-[12px] border-l-black border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                       </Link>
                       
                       {/* Heart and Info Buttons - Shared container */}
                       <div className="flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
                         {/* Heart Button */}
                         <button className="p-3 hover:bg-white/10 transition-colors duration-300 rounded-l-lg">
                           <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                           </svg>
              </button>
                         
                         {/* Divider */}
                         <div className="w-px h-6 bg-gray-600/50"></div>
                         
                         {/* Info Button */}
                         <Link
                           to={`/phim/${featuredMovie.slug || featuredMovie._id}`}
                           className="p-3 hover:bg-white/10 transition-colors duration-300 rounded-r-lg"
                         >
                           <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                             <span className="text-black text-xs font-bold">i</span>
                           </div>
                         </Link>
                       </div>
            </div>
          </div>
        </div>

                 {/* Suggested Movies - Enhanced Style */}
                 <div className="absolute bottom-6 right-6 z-20 max-w-sm">
                   <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-white/30 shadow-2xl">
                     <h3 className="text-white text-sm font-semibold mb-3 text-center">Đề xuất cho bạn</h3>
                     <div className="grid grid-cols-3 gap-2">
                       {suggestedMovies.slice(0, 3).map((movie, index) => (
                         <div
                           key={movie._id || index}
                           onClick={() => handleMovieSwitch(movie, index)}
                           className="relative group cursor-pointer"
                         >
                           <div className="relative w-full h-24 rounded-lg overflow-hidden border-2 border-white/20 hover:border-yellow-400 transition-all duration-300 group-hover:scale-105 bg-gray-800">
                             <img
                               src={getOptimizedImageUrl(movie.banner_url || movie.poster_url || movie.thumb_url)}
                               alt={movie.name}
                               className="w-full h-full object-cover object-center"
                               style={{
                                 objectPosition: 'center center'
                               }}
                               onError={(e) => {
                                 console.log('Suggested movie image error:', movie.name, 'URL:', movie.banner_url || movie.poster_url || movie.thumb_url);
                                 // Fallback to a default background color
                                 e.target.style.display = 'none';
                                 e.target.parentElement.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                               }}
                               onLoad={() => {
                                 console.log('Suggested movie image loaded:', movie.name);
                               }}
                             />
                             
                             {/* Quality Badge */}
                             <div className="absolute top-1 left-1">
                               <span className="bg-red-600 text-white text-[8px] px-1 py-0.5 rounded font-bold">
                                 {movie.quality || 'HD'}
                               </span>
                             </div>
                             
                             {/* Episode Badge */}
                             {movie.episode_current && (
                               <div className="absolute top-1 right-1">
                                 <span className="bg-blue-600 text-white text-[8px] px-1 py-0.5 rounded font-bold">
                                   T{movie.episode_current}
                                 </span>
                               </div>
                             )}
                             
                             {/* Hover Overlay */}
                             <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                               <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                                 <div className="w-0 h-0 border-l-[8px] border-l-black border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent ml-0.5"></div>
                               </div>
                             </div>
                           </div>
                           
                           {/* Movie Title */}
                           <div className="mt-1 text-center">
                             <p className="text-white text-[10px] font-medium truncate group-hover:text-yellow-400 transition-colors">
                               {movie.name}
                             </p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
               </div>
      </section>


    </>
  );
};

export default Banner;
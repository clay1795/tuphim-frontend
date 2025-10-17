import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import kkphimApi from "../services/kkphimApi"; // Not used in this component

// Helper function for image optimization
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

// Helper function to get trailer URL from TMDB
const getTrailerUrl = (movie) => {
  if (!movie || !movie.tmdb || !movie.tmdb.id) return null;
  
  // Tạo trailer URL từ TMDB ID
  const tmdbId = movie.tmdb.id;
  const type = movie.tmdb.type || 'movie';
  
  // Sử dụng YouTube embed URL (có thể thay đổi thành trailer thật từ TMDB API)
  return `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1`;
};

const MovieDetailRoPhim = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeTab, setActiveTab] = useState('episodes');
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);

  useEffect(() => {
    const loadMovieDetail = async () => {
      try {
        setLoading(true);
        // Gọi backend API thay vì trực tiếp KKPhim API
        console.log('Fetching movie detail for slug:', slug);
        const response = await fetch(`http://localhost:3001/api/movies/detail/${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Movie Detail API Response:', data);

        // Xử lý dữ liệu từ backend API
        let movieData = null;
        let episodesData = [];

        if (data.success && data.data) {
          movieData = data.data.movie;
          episodesData = data.data.episodes || [];
        } else if (data.movie) {
          movieData = data.movie;
          episodesData = data.episodes || [];
        }

        if (movieData) {
          setMovie(movieData);
        } else {
          console.warn('No movie data found, using fallback');
          // Fallback data
          const fallbackMovie = {
            _id: slug,
            name: 'Phim không tìm thấy',
            slug: slug,
            thumb_url: 'https://via.placeholder.com/300x450?text=No+Image',
            year: new Date().getFullYear(),
            quality: 'HD',
            episode_current: 1,
            episode_total: 1,
            category: [{ name: 'Unknown' }],
            country: [{ name: 'Unknown' }],
            content: 'Không có mô tả cho phim này.',
            actor: [],
            director: [],
            status: 'ongoing',
            type: 'single'
          };
          setMovie(fallbackMovie);
        }

        if (episodesData && episodesData.length > 0) {
          setEpisodes(episodesData);
          setSelectedServer(episodesData[0]);
          if (episodesData[0].server_data && episodesData[0].server_data.length > 0) {
            setSelectedEpisode(episodesData[0].server_data[0]);
          }
        } else {
          console.warn('No episodes data found');
          // Fallback episodes
          const fallbackEpisodes = [{
            server_name: 'Server 1',
            server_data: [{
              name: 'Tập 1',
              slug: `${slug}-tap-1`,
              filename: 'episode-1.mp4'
            }]
          }];
          setEpisodes(fallbackEpisodes);
          setSelectedServer(fallbackEpisodes[0]);
          setSelectedEpisode(fallbackEpisodes[0].server_data[0]);
        }

        // Log final movie data
        console.log('Movie detail loaded successfully');
        console.log('Movie data:', movieData);
        console.log('Episodes data:', episodesData);
      } catch (error) {
        console.error('Error loading movie detail:', error);
        setError('Không thể tải thông tin phim');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadMovieDetail();
    }
  }, [slug]);


  const handlePlayEpisode = (episode) => {
    setSelectedEpisode(episode);
    setShowPlayer(true);
  };

  const handlePlayTrailer = () => {
    const trailer = getTrailerUrl(movie);
    if (trailer) {
      setTrailerUrl(trailer);
      setShowTrailer(true);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setTrailerUrl(null);
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



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Lỗi: {error}</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy phim.</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 1. HERO SECTION - Enhanced */}
      <div className="relative min-h-[80vh] bg-gray-900">
        {/* Enhanced Background with Multiple Gradients */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getOptimizedImageUrl(movie.poster_url || movie.thumb_url)})`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 pt-56 pb-8">
          <div className="container mx-auto px-2">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-px items-start">
                {/* Enhanced Poster */}
                <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <img
                      src={getOptimizedImageUrl(movie.poster_url || movie.thumb_url)}
                      alt={movie.name}
                      className="relative w-64 h-[24rem] object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-all duration-500 border-2 border-white/10"
                      onError={(e) => {
                        e.target.src = '/src/assets/temp-1.jpeg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => setShowPlayer(true)}
                        className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300"
                      >
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Quality Badge */}
                    {movie.quality && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          {movie.quality}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Aligned with poster */}
                  <div className="flex flex-col items-center gap-3 mt-4 w-64">
                    {/* Main Watch Button - Aligned with poster width */}
                    {episodes && episodes.length > 0 && (
                      <button
                        onClick={() => setShowPlayer(true)}
                        className="group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-8 py-3 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center space-x-2 shadow-2xl hover:shadow-yellow-500/25 transform hover:scale-105 w-full"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span>Xem Ngay</span>
                      </button>
                    )}

                    {/* Secondary Action Buttons - Centered */}
                    <div className="flex items-center justify-center gap-6 w-full">
                      <button className="group flex flex-col items-center space-y-1 hover:scale-110 transition-all duration-300">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-white/30">
                          <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </div>
                        <span className="text-white text-xs font-medium">Yêu thích</span>
                      </button>

                      <button className="group flex flex-col items-center space-y-1 hover:scale-110 transition-all duration-300">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-white/30">
                          <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                          </svg>
                        </div>
                        <span className="text-white text-xs font-medium">Thêm vào</span>
                      </button>
                    </div>

                    {/* Rating - Centered */}
                    <div className="flex items-center justify-center space-x-2 text-gray-300">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="font-semibold text-sm">4.8</span>
                      <span className="text-xs">(1,234 đánh giá)</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Movie Info */}
                <div className="lg:col-span-2 space-y-4 h-[24rem] flex flex-col justify-start">
                  {/* Enhanced Title */}
                  <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight tracking-wide drop-shadow-lg">
                      {movie.name}
                    </h1>
                    {(movie.origin_name || movie.name_en) && (
                      <p className="text-xl md:text-2xl text-gray-300 italic font-light">
                        {movie.origin_name || movie.name_en}
                        {movie.year && (
                          <span className="text-yellow-400 ml-2 font-semibold">({movie.year})</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Enhanced Categories */}
                  {movie.category && movie.category.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {movie.category.map((cat, index) => (
                        <span
                          key={index}
                          className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors duration-300"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Enhanced Description */}
                  {movie.content && (
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Nội dung phim</h3>
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <p className="text-gray-200 leading-relaxed text-base">
                          {movie.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THÔNG TIN CHI TIẾT - PhimBro Style */}
      <div className="bg-gray-900 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cột trái - Thông tin cơ bản */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Thông tin phim</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-gray-400 w-28 flex-shrink-0 text-sm">Xuất bản:</span>
                    <span className="text-white font-semibold text-sm">
                      {movie.release_date ? new Date(movie.release_date).toLocaleDateString('vi-VN') : (movie.year || 'Đang cập nhật')}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 w-28 flex-shrink-0 text-sm">Số tập:</span>
                    <span className="text-white font-semibold text-sm">
                      {movie.episode_total || 'Đang cập nhật'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 w-28 flex-shrink-0 text-sm">Thời lượng:</span>
                    <span className="text-white font-semibold text-sm">
                      {movie.time || 'Đang cập nhật'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 w-28 flex-shrink-0 text-sm">Năm phát hành:</span>
                    <span className="text-white font-semibold text-sm">
                      {formatYear(movie.year) || 'Đang cập nhật'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 w-28 flex-shrink-0 text-sm">Chất lượng:</span>
                    <span className="text-white font-semibold text-sm">
                      {movie.quality || 'HD'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 w-28 flex-shrink-0 text-sm">Ngôn ngữ:</span>
                    <span className="text-white font-semibold text-sm">
                      {movie.lang || 'Vietsub'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cột phải - Thông tin bổ sung */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Thông tin bổ sung</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-gray-400 w-28 flex-shrink-0 text-sm">Đạo diễn:</span>
                    <span className="text-white text-sm">
                      {movie.director || 'Đang cập nhật'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 w-28 flex-shrink-0 text-sm">Diễn viên:</span>
                    <div className="text-white text-sm flex-1">
                      {(movie.actor && movie.actor.length > 0) || (movie.cast && movie.cast.length > 0) || (movie.actors && movie.actors.length > 0) ? (
                        <span className="text-gray-300">
                          {(movie.actor || movie.cast || movie.actors || []).map((actor, index) => {
                            // Handle different actor data structures
                            let actorName = actor.name || actor.original_name || actor.actor_name || actor.actor || actor.character_name;
                            
                            // If actor is a string instead of object
                            if (typeof actor === 'string') {
                              actorName = actor;
                            }
                            
                            // If still no name, try to extract from any string value
                            if (!actorName) {
                              const stringValues = Object.values(actor).filter(val => typeof val === 'string' && val.trim().length > 0);
                              if (stringValues.length > 0) {
                                actorName = stringValues[0];
                              }
                            }
                            
                            // Final fallback
                            if (!actorName) {
                              const allValues = Object.values(actor).filter(val => val && val.toString().trim().length > 0);
                              if (allValues.length > 0) {
                                actorName = allValues[0].toString();
                              } else {
                                actorName = `Diễn viên ${index + 1}`;
                              }
                            }
                            
                            return actorName;
                          }).join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">Đang cập nhật</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 w-28 flex-shrink-0 text-sm">Thể loại:</span>
                    <div className="text-white text-sm">
                      {movie.category && movie.category.length > 0 ? (
                        <span>{movie.category.map(cat => cat.name || cat).join(', ')}</span>
                      ) : (
                        <span>Đang cập nhật</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 w-28 flex-shrink-0 text-sm">Quốc gia:</span>
                    <div className="text-white text-sm">
                      {movie.country && movie.country.length > 0 ? (
                        <span>{movie.country.map(country => country.name || country).join(', ')}</span>
                      ) : (
                        <span>Đang cập nhật</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BÌNH LUẬN - PhimBro Style */}
      <div className="bg-gray-900 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">Bình luận (0)</h2>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-300 mb-6">Vui lòng đăng nhập để tham gia bình luận.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Viết bình luận</label>
                  <textarea
                    className="w-full p-4 bg-gray-700 rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    rows="4"
                    placeholder="Viết bình luận của bạn..."
                  ></textarea>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input type="checkbox" className="text-yellow-500 rounded" />
                    <span className="text-sm">Tiết lộ?</span>
                  </label>
                  
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition-colors">
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. KHU VỰC TẬP PHIM & TÙY CHỌN */}
      <div className="bg-gray-800 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Tab gồm "Tập phim", "Gallery", "Đề xuất" */}
            <div className="flex flex-wrap border-b border-gray-700 mb-8">
              <button
                className={`px-4 py-3 text-base font-semibold whitespace-nowrap ${activeTab === 'episodes' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('episodes')}
              >
                Tập phim
              </button>
              <button
                className={`px-4 py-3 text-base font-semibold whitespace-nowrap ${activeTab === 'gallery' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('gallery')}
              >
                Gallery
              </button>
              <button
                className={`px-4 py-3 text-base font-semibold whitespace-nowrap ${activeTab === 'suggestions' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('suggestions')}
              >
                Đề xuất
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'episodes' && (
                <div className="space-y-6">
                  {/* 1. TẬP PHIM - Chọn phần (Phần 1, Phần 2...) */}
                  {episodes.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-4 text-lg">Chọn phần:</h4>
                      <div className="flex flex-wrap gap-3">
                        {episodes.map((server, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedSeason(server.server_name);
                              setSelectedServer(server);
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                              selectedSeason === server.server_name
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                          >
                            {server.server_name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Danh sách tập (Tập 1, Tập 2...) - bấm vào để mở player */}
                  {selectedServer && selectedServer.server_data && (
                    <div>
                      <h4 className="text-white font-semibold mb-4 text-lg">Danh sách tập:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {selectedServer.server_data.map((episode, index) => (
                          <button
                            key={index}
                            onClick={() => handlePlayEpisode(episode)}
                            className={`p-3 rounded-lg text-center transition-colors flex flex-col items-center group ${
                              selectedEpisode === episode
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <svg className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            <div className="font-semibold text-xs leading-tight">{episode.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tuỳ chọn âm thanh/phụ đề (Phụ đề, Thuyết minh giọng Nam) */}
                  <div>
                    <h4 className="text-white font-semibold mb-4 text-lg">Tuỳ chọn âm thanh/phụ đề:</h4>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                        <input type="radio" name="audio" value="subtitle" className="text-yellow-500" defaultChecked />
                        <span className="text-sm">Phụ đề</span>
                      </label>
                      <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                        <input type="radio" name="audio" value="dubbing" className="text-yellow-500" />
                        <span className="text-sm">Thuyết minh giọng Nam</span>
                      </label>
                    </div>
                  </div>

                  {/* Rút gọn/Hiển thị danh sách tập */}
                  <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-700">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Rút gọn
                    </button>
                    <span className="text-gray-400 text-sm">
                      Hiển thị {selectedServer?.server_data?.length || 0} tập
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div>
                  {/* 2. GALLERY - Videos và Ảnh */}
                  <div className="space-y-8">
                    {/* Mục Videos - hiển thị các video (nếu có) */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Videos</h3>
                      <div className="bg-gray-800 rounded-lg p-8 text-center">
                        <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        <p className="text-gray-400 text-lg font-semibold">Chưa có video nào</p>
                        <p className="text-gray-500 text-sm mt-2">Không có trailer hay clip hậu trường</p>
                      </div>
                    </div>

                    {/* Mục Ảnh – hiển thị bộ sưu tập ảnh, bấm ảnh để phóng to */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Ảnh</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {/* Poster chính */}
                        <div 
                          className="aspect-[2/3] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform group"
                          onClick={() => {
                            // TODO: Implement image modal/lightbox
                            console.log('Open poster in lightbox');
                          }}
                        >
                          <img
                            src={getOptimizedImageUrl(movie.poster_url || movie.thumb_url)}
                            alt={movie.name}
                            className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                            onError={(e) => e.target.src = '/src/assets/temp-1.jpeg'}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Ảnh hậu trường mẫu */}
                        {[1, 2, 3, 4, 5].map((index) => (
                          <div 
                            key={index} 
                            className="aspect-[2/3] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform group"
                            onClick={() => {
                              // TODO: Implement image modal/lightbox
                              console.log(`Open image ${index} in lightbox`);
                            }}
                          >
                            <img
                              src="/src/assets/temp-1.jpeg"
                              alt={`Hậu trường ${index}`}
                              className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {activeTab === 'suggestions' && (
                <div>
                  {/* 4. ĐỀ XUẤT - Phim liên quan */}
                  <h3 className="text-xl font-bold text-white mb-6">Phim liên quan</h3>
                  
                  {/* Lưới phim liên quan */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((index) => (
                      <div 
                        key={index} 
                        className="group cursor-pointer"
                        onClick={() => {
                          // TODO: Navigate to movie page
                          console.log(`Navigate to related movie ${index}`);
                        }}
                      >
                        <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-3">
                          <img
                            src="/src/assets/temp-1.jpeg"
                            alt={`Phim liên quan ${index}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                              HD
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                              Vietsub
                            </span>
                          </div>
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-yellow-400 transition-colors">
                          Phim liên quan {index}
                        </h3>
                        <p className="text-gray-400 text-xs">2024 • Tình cảm</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bấm vào poster để tới trang phim đó */}
                  <div className="mt-4 text-center">
                    <p className="text-gray-400 text-sm">
                      💡 Bấm vào poster để tới trang phim đó
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      





      {/* Video Player Modal */}
      {showPlayer && selectedEpisode && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-white text-lg font-semibold">
                  {movie.name} - {selectedEpisode.name}
                </h3>
                <button
                  onClick={() => setShowPlayer(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                {selectedEpisode.link_m3u8 ? (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={selectedEpisode.link_embed || selectedEpisode.link_m3u8}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; fullscreen; picture-in-picture"
                      onError={(e) => {
                        console.error('Iframe error:', e);
                        console.log('Iframe src:', selectedEpisode.link_embed || selectedEpisode.link_m3u8);
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Không có video để phát</p>
                    <p className="text-gray-500 text-sm mt-2">Link video: {selectedEpisode.link_m3u8 || 'Không có'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailRoPhim;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import movieApi from "../services/movieApi";

const MovieDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeTab, setActiveTab] = useState('episodes');

  useEffect(() => {
    const loadMovieDetail = async () => {
      try {
        setLoading(true);
        const data = await movieApi.getMovieDetail(slug);
        console.log('Movie Detail API Response:', data);
        
        if (data.movie) {
          console.log('Movie data:', data.movie);
          console.log('Movie actors:', data.movie.actor);
          console.log('Movie director:', data.movie.director);
          console.log('Movie cast:', data.movie.cast);
          console.log('Movie crew:', data.movie.crew);
          console.log('All movie keys:', Object.keys(data.movie));
          setMovie(data.movie);
        }
        
        if (data.episodes) {
          setEpisodes(data.episodes);
        }
        
        if (data.episodes && data.episodes.length > 0 && data.episodes[0].server_data && data.episodes[0].server_data.length > 0) {
          setSelectedEpisode(data.episodes[0].server_data[0]);
        }
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

  const handlePlayEpisode = (episode, serverIndex, episodeIndex) => {
    // Navigate to video player page with episode parameters
    navigate(`/xem-phim/${slug}?ver=1&ss=${serverIndex + 1}&ep=${episodeIndex + 1}`);
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


  const getQualityBadge = (quality) => {
    if (!quality) return null;
    
    const qualityColors = {
      'HD': 'bg-green-600',
      'FullHD': 'bg-blue-600',
      '4K': 'bg-purple-600',
      'SD': 'bg-gray-600'
    };
    
    const color = qualityColors[quality] || 'bg-gray-600';
    
    return (
      <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${color}`}>
        {quality}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="luxury-spinner">
          <div className="luxury-ring luxury-ring-outer"></div>
          <div className="luxury-ring luxury-ring-middle"></div>
          <div className="luxury-ring luxury-ring-inner"></div>
          <div className="luxury-core"></div>
        </div>
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
          <h2 className="text-2xl font-bold text-white mb-4">Đang tải thông tin phim...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-4">
        <div className="container mx-auto px-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        {/* Background Image - Using ONLY thumb_url for background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: movie.thumb_url ? `url(${movieApi.getWebpImage(movie.thumb_url)})` : 'none'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                {/* Poster */}
                <div className="lg:col-span-1">
                  <div className="relative">
                    <img
                      src={movieApi.getWebpImage(movie.poster_url || movie.thumb_url)}
                      alt={movie.name}
                      className="w-full rounded-lg shadow-2xl"
                      onError={(e) => {
                        e.target.src = '/src/assets/temp-1.jpeg';
                      }}
                    />
                    {movie.quality && (
                      <div className="absolute top-4 right-4">
                        {getQualityBadge(movie.quality)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-3">
                  <h1 className="text-4xl md:text-6xl font-bold text-red-500 mb-2 leading-tight">
                    {movie.name?.toUpperCase()}
                  </h1>
                  
                  {movie.name_en && (
                    <h2 className="text-xl md:text-2xl text-white font-medium mb-4">
                      {movie.name_en}
                    </h2>
                  )}

                  {/* Movie Info Badges */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    {movie.rating && (
                      <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {movie.rating}
                      </span>
                    )}
                    
                    {movie.year && (
                      <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {formatYear(movie.year)}
                      </span>
                    )}
                    
                    {movie.episode_total && movie.episode_total > 1 && (
                      <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Phần {movie.episode_current || 1}
                      </span>
                    )}
                    
                    {movie.episode_current && (
                      <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Tập {movie.episode_current}
                      </span>
                    )}
                  </div>

                  {/* Categories */}
                  {movie.category && movie.category.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {movie.category.map((cat, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Status */}
                  {movie.status && (
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-white text-sm">
                        {movie.status === 'Đang phát' ? `Đã hoàn thành: ${movie.episode_current || 0}/${movie.episode_total || 0} tập` : movie.status}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={() => {
                        // Navigate to video player with first available episode
                        if (episodes && episodes.length > 0 && episodes[0].server_data && episodes[0].server_data.length > 0) {
                          navigate(`/xem-phim/${slug}?ver=1&ss=1&ep=1`);
                        }
                      }}
                      className="flex items-center space-x-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-2xl group"
                    >
                      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <span className="text-base">Xem Ngay</span>
                    </button>

                    <div className="flex items-center space-x-3">
                      <button className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>

                      <button className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                      </button>

                      <button className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                        </svg>
                      </button>

                      <button className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                        </svg>
                      </button>

                      <div className="flex items-center space-x-1 text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="text-sm">0 Đánh giá</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('episodes')}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === 'episodes' 
                    ? 'border-red-500 text-red-500' 
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Tập phim
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === 'gallery' 
                    ? 'border-red-500 text-red-500' 
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab('cast')}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === 'cast' 
                    ? 'border-red-500 text-red-500' 
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Diễn viên
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === 'suggestions' 
                    ? 'border-red-500 text-red-500' 
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Đề xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Episodes Tab */}
          {activeTab === 'episodes' && episodes && episodes.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600">
                    <option>Phần 1</option>
                  </select>
                </div>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  <span>Rút gọn</span>
                </button>
              </div>
              
              {episodes.map((server, serverIndex) => (
                <div key={serverIndex} className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">{server.server_name}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {server.server_data.map((episode, index) => (
                      <button
                        key={index}
                        onClick={() => handlePlayEpisode(episode)}
                        className={`p-4 rounded-lg text-center transition-colors ${
                          selectedEpisode === episode
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <div className="font-semibold">Tập {index + 1}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Movie Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Synopsis */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Giới thiệu</h2>
                <p className="text-gray-300 leading-relaxed">
                  {movie.content || movie.description || 'Không có mô tả cho bộ phim này.'}
                </p>
              </div>

              {/* Movie Details */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Thông tin chi tiết</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tình trạng */}
                  <div className="flex">
                    <span className="text-gray-400 w-32">Tình trạng:</span>
                    <span className="text-white">
                      {movie.status || (movie.episode_current && movie.episode_total ? 
                        `Tập ${movie.episode_current}` : 'N/A')}
                    </span>
                  </div>
                  
                  {/* Số tập */}
                  <div className="flex">
                    <span className="text-gray-400 w-32">Số tập:</span>
                    <span className="text-white">
                      {movie.episode_total || (movie.episode_current ? movie.episode_current : 'N/A')}
                    </span>
                  </div>
                  
                  {/* Thời lượng */}
                  <div className="flex">
                    <span className="text-gray-400 w-32">Thời lượng:</span>
                    <span className="text-white">{movie.time || 'N/A'}</span>
                  </div>
                  
                  {/* Năm phát hành */}
                  <div className="flex">
                    <span className="text-gray-400 w-32">Năm phát hành:</span>
                    <span className="text-white">{formatYear(movie.year) || 'N/A'}</span>
                  </div>
                  
                  {/* Chất lượng */}
                  <div className="flex">
                    <span className="text-gray-400 w-32">Chất lượng:</span>
                    <span className="text-white">{movie.quality || 'N/A'}</span>
                  </div>
                  
                  {/* Ngôn ngữ */}
                  <div className="flex">
                    <span className="text-gray-400 w-32">Ngôn ngữ:</span>
                    <span className="text-white">{movie.language || 'N/A'}</span>
                  </div>
                  
                  {/* Đạo diễn */}
                  <div className="flex">
                    <span className="text-gray-400 w-32">Đạo diễn:</span>
                    <span className="text-white">
                      {(() => {
                        // Debug: Log director data
                        console.log('Director data:', movie.director);
                        
                        if (!movie.director) return 'Đang cập nhật';
                        
                        // Handle different data structures
                        if (Array.isArray(movie.director)) {
                          if (movie.director.length === 0) return 'Đang cập nhật';
                          
                          // Check if directors have name property
                          if (movie.director[0] && typeof movie.director[0] === 'object' && movie.director[0].name) {
                            return movie.director.map(dir => dir.name).join(', ');
                          }
                          // Check if directors are strings
                          else if (typeof movie.director[0] === 'string') {
                            return movie.director.join(', ');
                          }
                        }
                        
                        // Handle string case
                        if (typeof movie.director === 'string') {
                          return movie.director;
                        }
                        
                        return 'Đang cập nhật';
                      })()}
                    </span>
                  </div>
                  
                  {/* Diễn viên */}
                  <div className="flex">
                    <span className="text-gray-400 w-32">Diễn viên:</span>
                    <span className="text-white">
                      {(() => {
                        // Debug: Log actor data
                        console.log('Actor data:', movie.actor);
                        console.log('Cast data:', movie.cast);
                        
                        // Try different possible fields for actors
                        const actorData = movie.actor || movie.cast || movie.actors;
                        
                        if (!actorData) return 'Đang cập nhật';
                        
                        // Handle different data structures
                        if (Array.isArray(actorData)) {
                          if (actorData.length === 0) return 'Đang cập nhật';
                          
                          // Check if actors have name property
                          if (actorData[0] && typeof actorData[0] === 'object' && actorData[0].name) {
                            return actorData.slice(0, 8).map(actor => actor.name).join(', ');
                          }
                          // Check if actors are strings
                          else if (typeof actorData[0] === 'string') {
                            return actorData.slice(0, 8).join(', ');
                          }
                        }
                        
                        // Handle string case
                        if (typeof actorData === 'string') {
                          return actorData;
                        }
                        
                        return 'Đang cập nhật';
                      })()}
                    </span>
                  </div>
                  
                  {/* Thể loại */}
                  <div className="flex">
                    <span className="text-gray-400 w-32">Thể loại:</span>
                    <span className="text-white">
                      {movie.category && movie.category.length > 0 ? 
                        movie.category.map(cat => cat.name).join(', ') : 
                        'N/A'}
                    </span>
                  </div>
                  
                  {/* Quốc gia */}
                  <div className="flex">
                    <span className="text-gray-400 w-32">Quốc gia:</span>
                    <span className="text-white">
                      {movie.country && movie.country.length > 0 ? 
                        movie.country.map(country => country.name).join(', ') : 
                        'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mb-8">
                <div className="flex space-x-4 mb-6">
                  <button className="text-white border-b-2 border-red-500 pb-2">Bình luận (0)</button>
                  <button className="text-gray-400 hover:text-white transition-colors">Đánh giá</button>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <p className="text-gray-400 mb-4">Vui lòng đăng nhập để tham gia bình luận.</p>
                  
                  <div className="space-y-4">
                    <textarea
                      placeholder="Viết bình luận"
                      className="w-full bg-gray-700 text-white p-4 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                      rows="4"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 text-gray-400">
                          <input type="checkbox" className="rounded" />
                          <span>Tiết lộ?</span>
                        </label>
                        <span className="text-gray-500 text-sm">0/1000</span>
                      </div>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
                        Gửi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Cast Section */}
              {activeTab === 'cast' && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Diễn viên</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {movie.cast && movie.cast.length > 0 ? (
                      movie.cast.slice(0, 8).map((actor, index) => (
                        <div key={index} className="text-center">
                          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {actor.name ? actor.name.charAt(0) : '?'}
                            </span>
                          </div>
                          <p className="text-white text-sm">{actor.name || 'Unknown'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center text-gray-400">
                        Không có thông tin diễn viên
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Top Movies */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Top phim tuần này</h3>
                <div className="space-y-4">
                  <div className="text-gray-400 text-center py-8">
                    Không có dữ liệu
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Video Player Modal - RoPhim Style */}
      {showPlayer && selectedEpisode && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Background overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{
              backgroundImage: movie.thumb_url ? `url(${movieApi.getWebpImage(movie.thumb_url)})` : 'none'
            }}
          />
          
          {/* Player Container */}
          <div className="relative z-10 w-full max-w-7xl mx-4">
            {/* Player Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">
                {movie.name} - {selectedEpisode.name || 'Tập 1'}
              </h3>
              <button
                onClick={() => setShowPlayer(false)}
                className="text-white hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
              {selectedEpisode.link_m3u8 || selectedEpisode.link_embed ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  {/* Video Container with Play Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Large Play Button */}
                        <button className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 group">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Video Controls Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <div className="flex items-center justify-between text-white">
                        {/* Left Controls */}
                        <div className="flex items-center space-x-4">
                          {/* Rewind 10s */}
                          <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
                            </svg>
                            <span className="text-xs ml-1">10</span>
                          </button>

                          {/* Play/Pause */}
                          <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300">
                            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </button>

                          {/* Forward 10s */}
                          <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M13 6v12l8.5-6L13 6zM4 18l8.5-6L4 6v12z"/>
                            </svg>
                            <span className="text-xs ml-1">10</span>
                          </button>

                          {/* Volume */}
                          <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                          </button>
                        </div>

                        {/* Center - Time Display */}
                        <div className="flex items-center space-x-2 text-sm font-medium">
                          <span>00:00</span>
                          <span className="text-gray-400">/</span>
                          <span>24:35</span>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center space-x-4">
                          {/* Settings */}
                          <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                            </svg>
                          </button>

                          {/* Picture in Picture */}
                          <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 7h-8v6h8V7zm2-4H3C1.9 3 1 3.9 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                            </svg>
                          </button>

                          {/* Fullscreen */}
                          <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actual Video iframe (hidden behind overlay) */}
                    <iframe
                      src={selectedEpisode.link_embed || selectedEpisode.link_m3u8}
                      className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity duration-300"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; fullscreen; picture-in-picture"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <p className="text-gray-400 text-lg">Không có video để phát</p>
                  </div>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center space-x-4 text-gray-300">
                <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                  {movie.quality || 'HD'}
                </span>
                <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                  {movie.language || 'Vietsub'}
                </span>
                <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                  {formatYear(movie.year) || '2024'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
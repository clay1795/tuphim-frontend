import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import movieApi from "../services/movieApi";

const VideoPlayer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Get episode parameters from URL
  const ver = searchParams.get('ver') || '1';
  const ss = searchParams.get('ss') || '1';
  const ep = searchParams.get('ep') || '1';

  useEffect(() => {
    const loadMovieDetail = async () => {
      try {
        setLoading(true);
        const data = await movieApi.getMovieDetail(slug);
        
        if (data.movie) {
          setMovie(data.movie);
        }
        
        if (data.episodes) {
          setEpisodes(data.episodes);
          
          // Find and set selected episode based on URL params
          const targetServer = data.episodes[parseInt(ss) - 1];
          if (targetServer && targetServer.server_data) {
            const targetEpisode = targetServer.server_data[parseInt(ep) - 1];
            if (targetEpisode) {
              setSelectedEpisode(targetEpisode);
            }
          }
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
  }, [slug, ss, ep]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        // Toggle fullscreen
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        // Toggle mute
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        // Rewind 10s
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        // Forward 10s
      } else if (e.code === 'Escape') {
        if (showEpisodeList) {
          setShowEpisodeList(false);
        } else if (showKeyboardHelp) {
          setShowKeyboardHelp(false);
        }
      } else if (e.code === 'Slash' && e.shiftKey) {
        e.preventDefault();
        setShowKeyboardHelp(!showKeyboardHelp);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showEpisodeList]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleEpisodeChange = (newServerIndex, newEpisodeIndex) => {
    // Update URL parameters
    navigate(`/xem-phim/${slug}?ver=${ver}&ss=${newServerIndex + 1}&ep=${newEpisodeIndex + 1}`, { replace: true });
  };

  const handleMouseMove = () => {
    setShowControls(true);
    // Auto hide controls after 3 seconds
    setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !movie || !selectedEpisode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Không thể tải video</h2>
          <button
            onClick={() => navigate(`/phim/${slug}`)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Quay lại trang chi tiết
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-6">
          <button
            onClick={() => navigate(`/phim/${slug}`)}
            className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Quay lại</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-white text-lg font-bold">{movie.name}</h1>
            <p className="text-gray-300 text-sm">
              {episodes[parseInt(ss) - 1]?.server_name} - Tập {ep}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-white hover:text-red-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            
            <button className="text-white hover:text-red-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Player */}
      <div 
        className="relative w-full h-screen bg-black cursor-pointer"
        onMouseMove={handleMouseMove}
        onClick={handlePlayPause}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: movie.thumb_url ? `url(${movieApi.getWebpImage(movie.thumb_url)})` : 'none'
          }}
        />

        {/* Video Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {selectedEpisode.link_m3u8 || selectedEpisode.link_embed ? (
            <div className="relative w-full h-full max-w-7xl">
              {/* Video iframe */}
              <iframe
                src={selectedEpisode.link_embed || selectedEpisode.link_m3u8}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
              />
              
              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <button 
                    onClick={handlePlayPause}
                    className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 group"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <p className="text-gray-400 text-lg">Không có video để phát</p>
            </div>
          )}
        </div>

        {/* Video Controls Overlay */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 transition-opacity duration-300">
            <div className="flex items-center justify-between text-white max-w-7xl mx-auto">
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
                <button 
                  onClick={handlePlayPause}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
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

              {/* Center - Progress Bar */}
              <div className="flex-1 mx-8">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{formatTime(currentTime)}</span>
                  <div className="flex-1 bg-gray-600 rounded-full h-1 cursor-pointer">
                    <div 
                      className="bg-red-500 h-1 rounded-full transition-all duration-300" 
                      style={{ 
                        width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-4">
                {/* Settings */}
                <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                  </svg>
                </button>

                {/* Episode List */}
                <button 
                  onClick={() => setShowEpisodeList(!showEpisodeList)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
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
        )}
      </div>

      {/* Episode List Sidebar */}
      <div className={`absolute right-0 top-0 bottom-0 w-80 bg-black/95 backdrop-blur-sm transition-transform duration-300 ${
        showEpisodeList ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white text-lg font-bold">Danh sách tập</h3>
            <button
              onClick={() => setShowEpisodeList(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Episode List */}
          <div className="flex-1 overflow-y-auto">
            {episodes.map((server, serverIndex) => (
              <div key={serverIndex} className="p-4">
                <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                  {server.server_name}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {server.server_data.map((episode, episodeIndex) => (
                    <button
                      key={episodeIndex}
                      onClick={() => handleEpisodeChange(serverIndex, episodeIndex)}
                      className={`p-3 rounded-lg text-center transition-all duration-200 ${
                        parseInt(ss) === serverIndex + 1 && parseInt(ep) === episodeIndex + 1
                          ? 'bg-red-600 text-white shadow-lg'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-sm font-medium">
                        {episodeIndex + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-300 text-sm">
                <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                  {movie?.quality || 'HD'}
                </span>
                <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                  {movie?.language || 'Vietsub'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Help Overlay */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-bold">Phím tắt</h3>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 text-white">
              <div className="flex items-center justify-between">
                <span>Phát/Tạm dừng</span>
                <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">Space</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Toàn màn hình</span>
                <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">F</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Tắt tiếng</span>
                <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">M</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Tua lại 10s</span>
                <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">←</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Tua tới 10s</span>
                <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">→</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Danh sách tập</span>
                <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">E</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Đóng</span>
                <kbd className="bg-gray-700 px-2 py-1 rounded text-sm">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

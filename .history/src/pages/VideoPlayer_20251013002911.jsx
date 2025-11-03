import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getApiUrl } from '../utils/apiConfig.js';

const VideoPlayer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const progressRef = useRef(null);

  // State management
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(1494); // 24:54 in seconds
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  
  // UI states
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoveredTime, setHoveredTime] = useState(null);
  const [previewPosition, setPreviewPosition] = useState(null);

  // Get episode parameters from URL
  const ver = searchParams.get('ver') || '1';
  const ss = searchParams.get('ss') || '1';
  const ep = searchParams.get('ep') || '1';

  // Load movie data
  useEffect(() => {
    const loadMovieDetail = async () => {
      try {
        setLoading(true);
        console.log('Fetching movie detail for slug:', slug);
        const response = await fetch(`${getApiUrl()}/movies/detail/${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('VideoPlayer Movie Detail API Response:', data);

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
          console.warn('No movie data found in VideoPlayer');
          setError('Không thể tải thông tin phim');
          return;
        }

        if (episodesData && episodesData.length > 0) {
          setEpisodes(episodesData);
          
          const targetServer = episodesData[parseInt(ss) - 1];
          if (targetServer && targetServer.server_data) {
            const targetEpisode = targetServer.server_data[parseInt(ep) - 1];
            if (targetEpisode) {
              setSelectedEpisode(targetEpisode);
            }
          }
        } else {
          console.warn('No episodes data found in VideoPlayer');
          setError('Không có tập phim để phát');
        }

        console.log('VideoPlayer movie detail loaded successfully');
      } catch (error) {
        console.error('Error loading movie detail in VideoPlayer:', error);
        setError('Không thể tải thông tin phim');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadMovieDetail();
    }
  }, [slug, ss, ep]);

  // Event handlers with useCallback for performance
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    console.log('Play/Pause clicked, isPlaying:', !isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((time) => {
    setCurrentTime(time);
    console.log('Seek to:', time);
  }, []);

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    console.log('Volume changed to:', newVolume);
  }, []);

  const handleMuteToggle = useCallback(() => {
    setIsMuted(!isMuted);
    console.log('Mute toggled:', !isMuted);
  }, [isMuted]);

  const handleSpeedChange = useCallback((speed) => {
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
    console.log('Playback speed changed to:', speed);
  }, []);

  const handleQualityChange = useCallback((newQuality) => {
    setQuality(newQuality);
    setShowQualityMenu(false);
    console.log('Quality changed to:', newQuality);
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    console.log('Fullscreen toggled');
  }, []);

  const handleEpisodeChange = useCallback((newServerIndex, newEpisodeIndex) => {
    navigate(`/xem-phim/${slug}?ver=${ver}&ss=${newServerIndex + 1}&ep=${newEpisodeIndex + 1}`, { replace: true });
  }, [navigate, slug, ver]);

  // Progress bar interactions
  const handleProgressClick = useCallback((e) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      handleSeek(Math.max(0, Math.min(duration, newTime)));
    }
  }, [duration, handleSeek]);

  const handleProgressHover = useCallback((e) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const hoverX = e.clientX - rect.left;
      const hoverTime = (hoverX / rect.width) * duration;
      setHoveredTime(hoverTime);
      setPreviewPosition(e.clientX - rect.left);
    }
  }, [duration]);

  const handleProgressLeave = useCallback(() => {
    setHoveredTime(null);
    setPreviewPosition(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'KeyF':
          e.preventDefault();
          handleFullscreenToggle();
          break;
        case 'KeyM':
          e.preventDefault();
          handleMuteToggle();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 10));
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(Math.min(duration, currentTime + 10));
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'KeyE':
          e.preventDefault();
          setShowEpisodeList(!showEpisodeList);
          break;
        case 'KeyS':
          e.preventDefault();
          setShowSettings(!showSettings);
          break;
        case 'Escape':
          if (showEpisodeList) setShowEpisodeList(false);
          if (showSettings) setShowSettings(false);
          if (showKeyboardHelp) setShowKeyboardHelp(false);
          if (showQualityMenu) setShowQualityMenu(false);
          if (showSpeedMenu) setShowSpeedMenu(false);
          if (showVolumeSlider) setShowVolumeSlider(false);
          break;
        case 'Slash':
          if (e.shiftKey) {
            e.preventDefault();
            setShowKeyboardHelp(!showKeyboardHelp);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [
    handlePlayPause, handleFullscreenToggle, handleMuteToggle, handleSeek,
    currentTime, duration, volume, handleVolumeChange, showEpisodeList,
    showSettings, showKeyboardHelp, showQualityMenu, showSpeedMenu, showVolumeSlider
  ]);

  // Mouse movement handler
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Utility functions
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getQualityOptions = useCallback(() => {
    return [
      { label: 'Tự động', value: 'auto' },
      { label: '1080p', value: '1080p' },
      { label: '720p', value: '720p' },
      { label: '480p', value: '480p' },
      { label: '360p', value: '360p' }
    ];
  }, []);

  const getSpeedOptions = useCallback(() => {
    return [
      { label: '0.25x', value: 0.25 },
      { label: '0.5x', value: 0.5 },
      { label: '0.75x', value: 0.75 },
      { label: '1x', value: 1 },
      { label: '1.25x', value: 1.25 },
      { label: '1.5x', value: 1.5 },
      { label: '2x', value: 2 }
    ];
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-500/30 border-b-purple-500 rounded-full animate-spin animate-reverse"></div>
          </div>
          <p className="text-white text-lg font-medium">Đang tải video...</p>
          <p className="text-gray-400 text-sm mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !movie || !selectedEpisode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Không thể tải video</h2>
          <p className="text-gray-400 mb-6">{error || 'Video không khả dụng'}</p>
          <button
            onClick={() => navigate(`/phim/${slug}`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            Quay lại trang chi tiết
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => navigate(`/phim/${slug}`)}
              className="flex items-center space-x-3 text-white hover:text-blue-400 transition-all duration-300 group"
            >
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium">Quay lại</span>
            </button>
            
            <div className="text-center flex-1 max-w-lg mx-8">
              <h1 className="text-white text-lg font-semibold truncate">{movie.name}</h1>
              <p className="text-gray-300 text-sm">
                {episodes[parseInt(ss) - 1]?.server_name} - Tập {ep}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowKeyboardHelp(true)}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Player */}
      <div 
        className="relative w-full h-screen cursor-pointer group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
        onClick={handlePlayPause}
      >
        {/* Video Container - Direct iframe without custom controls */}
        <div className="relative w-full h-full">
          {selectedEpisode.link_m3u8 || selectedEpisode.link_embed ? (
            <div className="relative w-full h-full">
              {/* Video iframe - Full control to the external player */}
              <iframe
                src={selectedEpisode.link_embed || selectedEpisode.link_m3u8}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                style={{
                  pointerEvents: 'auto' // Allow iframe to handle all interactions
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white text-xl font-medium mb-2">Không có video để phát</p>
                <p className="text-gray-400">Vui lòng thử lại sau</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls Overlay - Hidden to avoid conflict with API player */}
        {false && (
        <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <div className="bg-gradient-to-t from-black/90 to-transparent backdrop-blur-md">
            {/* Progress Bar */}
            <div className="px-6 py-3">
              <div 
                ref={progressRef}
                className="relative h-1 bg-white/20 rounded-full cursor-pointer group"
                onClick={handleProgressClick}
                onMouseMove={handleProgressHover}
                onMouseLeave={handleProgressLeave}
              >
                {/* Progress */}
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                
                {/* Hover Preview */}
                {hoveredTime && previewPosition !== null && (
                  <>
                    <div 
                      className="absolute top-0 h-full w-0.5 bg-white rounded-full"
                      style={{ left: `${previewPosition}px` }}
                    />
                    <div 
                      className="absolute bottom-4 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded"
                      style={{ left: `${previewPosition}px` }}
                    >
                      {formatTime(hoveredTime)}
                    </div>
                  </>
                )}
                
                {/* Current Time Indicator */}
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, marginLeft: '-6px' }}
                />
              </div>
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between px-6 py-4">
              {/* Left Controls */}
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button 
                  onClick={handlePlayPause}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 group"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white ml-0.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                {/* Skip Back */}
                <button 
                  onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
                  </svg>
                  <span className="text-xs ml-1 font-medium">10</span>
                </button>

                {/* Skip Forward */}
                <button 
                  onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 6v12l8.5-6L13 6zM4 18l8.5-6L4 6v12z"/>
                  </svg>
                  <span className="text-xs ml-1 font-medium">10</span>
                </button>

                {/* Volume */}
                <div className="relative">
                  <button 
                    onClick={handleMuteToggle}
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                    className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 group"
                  >
                    <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      {isMuted ? (
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      ) : (
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      )}
                    </svg>
                  </button>

                  {/* Volume Slider */}
                  {showVolumeSlider && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/80 rounded-lg p-3 backdrop-blur-md">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                      />
                      <div className="text-white text-xs text-center mt-1">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Display */}
                <div className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-3">
                {/* Playback Speed */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 group"
                  >
                    <span className="text-white text-sm font-medium group-hover:scale-110 transition-transform">
                      {playbackRate}x
                    </span>
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg py-2 backdrop-blur-md min-w-[120px]">
                      {getSpeedOptions().map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSpeedChange(option.value)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            playbackRate === option.value
                              ? 'text-blue-400 bg-white/10'
                              : 'text-white hover:bg-white/5'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quality */}
                <div className="relative">
                  <button 
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 group"
                  >
                    <span className="text-white text-xs font-medium group-hover:scale-110 transition-transform">
                      {quality}
                    </span>
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg py-2 backdrop-blur-md min-w-[100px]">
                      {getQualityOptions().map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleQualityChange(option.value)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            quality === option.value
                              ? 'text-blue-400 bg-white/10'
                              : 'text-white hover:bg-white/5'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Settings */}
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                  </svg>
                </button>

                {/* Episode List */}
                <button 
                  onClick={() => setShowEpisodeList(!showEpisodeList)}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                  </svg>
                </button>

                {/* Fullscreen */}
                <button 
                  onClick={handleFullscreenToggle}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episode List Sidebar */}
      <div className={`fixed right-0 top-0 bottom-0 w-80 bg-black/95 backdrop-blur-xl transition-transform duration-300 z-40 ${
        showEpisodeList ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-white text-lg font-semibold">Danh sách tập</h3>
            <button
              onClick={() => setShowEpisodeList(false)}
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Episode List */}
          <div className="flex-1 overflow-y-auto p-6">
            {episodes.map((server, serverIndex) => (
              <div key={serverIndex} className="mb-6">
                <h4 className="text-gray-300 font-medium mb-3 text-sm uppercase tracking-wide">
                  {server.server_name}
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {server.server_data.map((episode, episodeIndex) => (
                    <button
                      key={episodeIndex}
                      onClick={() => handleEpisodeChange(serverIndex, episodeIndex)}
                      className={`p-3 rounded-lg text-center transition-all duration-200 text-sm font-medium ${
                        parseInt(ss) === serverIndex + 1 && parseInt(ep) === episodeIndex + 1
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {episodeIndex + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Sử dụng phím <kbd className="bg-white/10 px-2 py-1 rounded text-xs">E</kbd> để mở/đóng danh sách
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Phím tắt</h2>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-3">Điều khiển phát</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Phát/Tạm dừng</span>
                    <kbd className="bg-white/10 px-3 py-1 rounded text-sm">Space</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Tua lại 10s</span>
                    <kbd className="bg-white/10 px-3 py-1 rounded text-sm">←</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Tua tới 10s</span>
                    <kbd className="bg-white/10 px-3 py-1 rounded text-sm">→</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Tăng âm lượng</span>
                    <kbd className="bg-white/10 px-3 py-1 rounded text-sm">↑</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Giảm âm lượng</span>
                    <kbd className="bg-white/10 px-3 py-1 rounded text-sm">↓</kbd>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-3">Giao diện</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Toàn màn hình</span>
                    <kbd className="bg-white/10 px-3 py-1 rounded text-sm">F</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Tắt tiếng</span>
                    <kbd className="bg-white/10 px-3 py-1 rounded text-sm">M</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Danh sách tập</span>
                    <kbd className="bg-white/10 px-3 py-1 rounded text-sm">E</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Cài đặt</span>
                    <kbd className="bg-white/10 px-3 py-1 rounded text-sm">S</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Đóng</span>
                    <kbd className="bg-white/10 px-3 py-1 rounded text-sm">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-400 text-sm text-center">
                Nhấn <kbd className="bg-white/10 px-2 py-1 rounded text-xs">?</kbd> để mở/đóng bảng phím tắt
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed bottom-20 right-6 bg-black/90 backdrop-blur-xl rounded-xl p-6 z-40 min-w-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Cài đặt</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Tốc độ phát</label>
              <select
                value={playbackRate}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {getSpeedOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Chất lượng</label>
              <select
                value={quality}
                onChange={(e) => handleQualityChange(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {getQualityOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Âm lượng: {Math.round((isMuted ? 0 : volume) * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
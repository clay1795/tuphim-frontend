import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getApiUrl } from '../utils/apiConfig.js';
import { toast, Toaster } from "react-hot-toast";
import PropTypes from 'prop-types';
import { useVideoPlayer } from '../context/VideoPlayerContext.jsx';

// Episode Selector Component
const EpisodeSelector = ({ episodes, currentEpisode, currentServer, onEpisodeChange, maxVisible = 12 }) => {
  const [showAll, setShowAll] = useState(false);
  const totalEpisodes = episodes.length;
  
  // If episodes <= maxVisible, show all
  if (totalEpisodes <= maxVisible) {
    return (
      <div className="flex flex-wrap gap-2">
        {episodes.map((episode, episodeIndex) => {
          const hasDub = !!episode?.link_dub;
          return (
            <button
              key={episodeIndex}
              onClick={() => onEpisodeChange(currentServer, episodeIndex)}
              className={`px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] transition-colors relative ${
                currentEpisode === episodeIndex
                  ? "bg-[#FFC94A] text-black"
                  : "bg-[#272A3A] hover:bg-[#44475A]"
              }`}
              title={`Tập ${episodeIndex + 1}${hasDub ? " - Có thuyết minh" : " - Chỉ có phụ đề"}`}
            >
              {episodeIndex + 1}
              {hasDub && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFC94A] rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // For many episodes, show smart pagination
  const getVisibleEpisodes = () => {
    if (showAll) {
      return episodes;
    }
    
    // Show current episode and surrounding episodes
    const start = Math.max(0, currentEpisode - Math.floor(maxVisible / 2));
    const end = Math.min(totalEpisodes, start + maxVisible);
    const actualStart = Math.max(0, end - maxVisible);
    
    return episodes.slice(actualStart, end).map((episode, index) => ({
      episode,
      originalIndex: actualStart + index
    }));
  };

  const visibleEpisodes = getVisibleEpisodes();

  return (
    <div className="space-y-3">
      {/* Episode Grid */}
      <div className="flex flex-wrap gap-2">
        {!showAll && currentEpisode > Math.floor(maxVisible / 2) && (
          <button
            onClick={() => onEpisodeChange(currentServer, 0)}
            className="px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] bg-[#272A3A] hover:bg-[#44475A]"
          >
            « 1
          </button>
        )}
        
        {!showAll && currentEpisode > Math.floor(maxVisible / 2) + 1 && (
          <span className="px-2 py-1 text-[#F5F5F5]/60 text-sm">...</span>
        )}
        
        {visibleEpisodes.map((item, index) => {
          const episodeIndex = showAll ? index : item.originalIndex;
          const episode = showAll ? episodes[index] : item.episode;
          const isCurrent = currentEpisode === episodeIndex;
          const hasDub = !!episode?.link_dub;
          
          return (
            <button
              key={episodeIndex}
              onClick={() => onEpisodeChange(currentServer, episodeIndex)}
              className={`px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] transition-colors relative ${
                isCurrent
                  ? "bg-[#FFC94A] text-black"
                  : "bg-[#272A3A] hover:bg-[#44475A]"
              }`}
              title={`Tập ${episodeIndex + 1}${hasDub ? " - Có thuyết minh" : " - Chỉ có phụ đề"}`}
            >
              {episodeIndex + 1}
              {hasDub && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFC94A] rounded-full"></span>
              )}
            </button>
          );
        })}
        
        {!showAll && currentEpisode < totalEpisodes - Math.floor(maxVisible / 2) - 1 && (
          <span className="px-2 py-1 text-[#F5F5F5]/60 text-sm">...</span>
        )}
        
        {!showAll && currentEpisode < totalEpisodes - Math.floor(maxVisible / 2) && (
          <button
            onClick={() => onEpisodeChange(currentServer, totalEpisodes - 1)}
            className="px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] bg-[#272A3A] hover:bg-[#44475A]"
          >
            {totalEpisodes} »
          </button>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="text-[#F5F5F5]/60 text-sm">
          Tập {currentEpisode + 1} / {totalEpisodes}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] bg-[#272A3A] hover:bg-[#44475A] transition-colors"
          >
            {showAll ? "Thu gọn" : `Xem tất cả (${totalEpisodes})`}
          </button>
          {totalEpisodes > 20 && (
            <button
              onClick={() => {
                const randomEpisode = Math.floor(Math.random() * totalEpisodes);
                onEpisodeChange(currentServer, randomEpisode);
              }}
              className="px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] bg-[#272A3A] hover:bg-[#44475A] transition-colors"
              title="Tập ngẫu nhiên"
            >
              🎲 Ngẫu nhiên
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// PropTypes for EpisodeSelector
EpisodeSelector.propTypes = {
  episodes: PropTypes.array.isRequired,
  currentEpisode: PropTypes.number.isRequired,
  currentServer: PropTypes.number.isRequired,
  onEpisodeChange: PropTypes.func.isRequired,
  maxVisible: PropTypes.number
};

const VideoPlayer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getPreferencesForMovie, updatePreferences } = useVideoPlayer();

  // State management
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [audioType, setAudioType] = useState("subtitle");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [hasDubVersion, setHasDubVersion] = useState(false);

  // Get episode parameters from URL
  const ver = searchParams.get('ver') || '1';
  const ss = searchParams.get('ss') || '1';
  const ep = searchParams.get('ep') || '1';

  // Get user preferences from context
  const userPreferences = getPreferencesForMovie(slug);

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
          
          // Use URL parameters first, then fallback to user preferences
          const targetServerIndex = parseInt(ss) - 1;
          const targetEpisodeIndex = parseInt(ep) - 1;
          
          // If URL has default values (1,1,1), try to use user preferences
          let finalServerIndex = targetServerIndex;
          let finalEpisodeIndex = targetEpisodeIndex;
          
          if (ss === '1' && ep === '1' && userPreferences.serverIndex !== undefined) {
            finalServerIndex = userPreferences.serverIndex;
            finalEpisodeIndex = userPreferences.episodeIndex;
            
            // Update URL to reflect user preferences
            navigate(`/xem-phim/${slug}?ver=${ver}&ss=${finalServerIndex + 1}&ep=${finalEpisodeIndex + 1}`, { replace: true });
          }
          
          const targetServer = episodesData[finalServerIndex];
          if (targetServer) {
            setSelectedServer(targetServer);
            if (targetServer.server_data) {
              const targetEpisode = targetServer.server_data[finalEpisodeIndex];
              if (targetEpisode) {
                setSelectedEpisode(targetEpisode);
                // Set initial video URL based on user's preferred audio type
                const preferredAudio = userPreferences.audioType || audioType;
                if (preferredAudio === "dub" && targetEpisode.link_dub) {
                  setCurrentVideoUrl(targetEpisode.link_dub);
                  setAudioType("dub");
                } else {
                  setCurrentVideoUrl(targetEpisode.link_embed || targetEpisode.link_m3u8);
                  setAudioType("subtitle");
                }
                // Check if this episode has dubbed version
                setHasDubVersion(!!targetEpisode.link_dub);
              }
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

  // Sync video URL, audio type, and episode display
  useEffect(() => {
    if (selectedEpisode) {
      let newUrl = null;
      
      if (audioType === "subtitle") {
        newUrl = selectedEpisode.link_embed || selectedEpisode.link_m3u8;
      } else if (audioType === "dub") {
        newUrl = selectedEpisode.link_dub || selectedEpisode.link_embed || selectedEpisode.link_m3u8;
      }
      
      if (newUrl) {
        setCurrentVideoUrl(newUrl);
      }
      
      // Update dub availability for current episode
      setHasDubVersion(!!selectedEpisode.link_dub);
      
      // Auto-switch to subtitle if dub not available for current episode
      if (audioType === "dub" && !selectedEpisode.link_dub) {
        setAudioType("subtitle");
        toast.info("Tập này chỉ có phụ đề, đã chuyển về phụ đề");
      }
    }
  }, [selectedEpisode, audioType]);

  const handleEpisodeChange = useCallback((newServerIndex, newEpisodeIndex) => {
    // Check if new episode has dubbed version before changing
    const newEpisode = episodes[newServerIndex]?.server_data?.[newEpisodeIndex];
    const hasDubForNewEpisode = !!newEpisode?.link_dub;
    
    // If current audio type is dub but new episode doesn't have dub, switch to subtitle
    if (audioType === "dub" && !hasDubForNewEpisode) {
      setAudioType("subtitle");
      toast.info(`Tập ${newEpisodeIndex + 1} chỉ có phụ đề, đã chuyển về phụ đề`);
    }
    
    navigate(`/xem-phim/${slug}?ver=${ver}&ss=${newServerIndex + 1}&ep=${newEpisodeIndex + 1}`, { replace: true });
    
    // Reset play state when changing episode
    setIsPlaying(false);
  }, [navigate, slug, ver, episodes, audioType]);

  // Navigate to previous/next episode
  const navigateToEpisode = useCallback((direction) => {
    if (!selectedServer || !selectedServer.server_data) return;
    
    const currentEpisodeIndex = parseInt(ep) - 1;
    const newEpisodeIndex = currentEpisodeIndex + direction;
    
    if (newEpisodeIndex >= 0 && newEpisodeIndex < selectedServer.server_data.length) {
      // Check audio availability for new episode
      const newEpisode = selectedServer.server_data[newEpisodeIndex];
      const hasDubForNewEpisode = !!newEpisode?.link_dub;
      
      // Show info about audio type for new episode
      const audioInfo = hasDubForNewEpisode ? "có cả phụ đề và thuyết minh" : "chỉ có phụ đề";
      toast.success(`Chuyển sang tập ${newEpisodeIndex + 1} (${audioInfo})`);
      
      handleEpisodeChange(episodes.indexOf(selectedServer), newEpisodeIndex);
    } else {
      toast.error(direction > 0 ? "Đã đến tập cuối" : "Đã đến tập đầu");
    }
  }, [selectedServer, ep, episodes, handleEpisodeChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.code) {
        case 'KeyE':
          e.preventDefault();
          setShowEpisodeList(!showEpisodeList);
          break;
        case 'Escape':
          if (showEpisodeList) setShowEpisodeList(false);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateToEpisode(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateToEpisode(1);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showEpisodeList, selectedServer, episodes, navigateToEpisode]);

  const handleServerChange = useCallback((serverIndex) => {
    setSelectedServer(episodes[serverIndex]);
    if (episodes[serverIndex] && episodes[serverIndex].server_data && episodes[serverIndex].server_data.length > 0) {
      navigate(`/xem-phim/${slug}?ver=${ver}&ss=${serverIndex + 1}&ep=1`, { replace: true });
    }
  }, [navigate, slug, ver, episodes]);

  // Action functions similar to RophimPlayer
  const handlePlay = () => {
    setIsPlaying(true);
    setShowSkipIntro(true);
    setTimeout(() => setShowSkipIntro(false), 30000);
  };

  const skipIntro = () => {
    setShowSkipIntro(false);
    toast.success("Đã bỏ qua phần giới thiệu");
  };

  const setAudio = (type) => {
    // Don't allow switching to dub if not available
    if (type === "dub" && !hasDubVersion) {
      toast.error("Tập này không có bản thuyết minh");
      return;
    }
    
    setAudioType(type);
    
    // Update video URL based on audio type
    if (selectedEpisode) {
      let newUrl = null;
      
      if (type === "subtitle") {
        // Prefer subtitle version (usually link_embed or link_m3u8)
        newUrl = selectedEpisode.link_embed || selectedEpisode.link_m3u8;
      } else if (type === "dub" && hasDubVersion) {
        // Look for dubbed version (might be in different field)
        newUrl = selectedEpisode.link_dub || selectedEpisode.link_embed || selectedEpisode.link_m3u8;
      }
      
      if (newUrl && newUrl !== currentVideoUrl) {
        setCurrentVideoUrl(newUrl);
        setIsPlaying(false); // Reset play state
      }
    }
    
    const episodeInfo = `Tập ${parseInt(ep)}`;
    toast.success(`${episodeInfo}: ${type === "subtitle" ? "Đã chuyển sang Phụ đề" : "Đã chuyển sang Thuyết minh"}`);
  };

  const postComment = () => {
    if (!commentText.trim()) return toast.error("Nhập bình luận!");
    setComments([
      { id: Date.now(), name: "Bạn", time: "Vừa xong", text: commentText, likes: 0 },
      ...comments,
    ]);
    setCommentText("");
    toast.success("Đã gửi bình luận!");
  };


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0E18] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#FFC94A]/30 border-t-[#FFC94A] rounded-full animate-spin mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#FFC94A]/30 border-b-[#FFC94A] rounded-full animate-spin animate-reverse"></div>
          </div>
          <p className="text-[#F5F5F5] text-lg font-medium">Đang tải video...</p>
          <p className="text-[#F5F5F5]/60 text-sm mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#0E0E18] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#F5F5F5] mb-4">Không thể tải video</h2>
          <p className="text-[#F5F5F5]/60 mb-6">{error || 'Video không khả dụng'}</p>
          <button
            onClick={() => navigate(`/phim/${slug}`)}
            className="bg-[#FFC94A] hover:bg-[#FFC94A]/90 text-black px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Quay lại trang chi tiết
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E18] text-[#F5F5F5]">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0E0E18]/95 backdrop-blur-md border-b border-[#272A3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(`/phim/${slug}`)}
              className="flex items-center space-x-3 text-[#F5F5F5] hover:text-[#FFC94A] transition-all duration-300 group mr-6"
            >
              <div className="w-8 h-8 bg-[#272A3A] rounded-full flex items-center justify-center group-hover:bg-[#44475A] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium">Quay lại</span>
            </button>
            
            <div className="flex-1">
              <h1 className="text-[#F5F5F5] text-lg font-semibold truncate">{movie.name}</h1>
              <p className="text-[#F5F5F5]/60 text-sm">
                {selectedServer?.server_name} - Tập {ep}
                {selectedServer?.server_data && ` (${selectedServer.server_data.length} tập)`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#0E0E18] rounded-xl p-6 ring-1 ring-[#272A3A]">
          
          {/* Video Player */}
          <div className="relative aspect-video overflow-hidden rounded-lg bg-[#141420] ring-1 ring-[#272A3A] mb-6">
            {currentVideoUrl ? (
              <>
                <iframe
                  key={currentVideoUrl} // Force re-render when URL changes
                  src={currentVideoUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                  title={`${movie.name} - ${audioType === "subtitle" ? "Phụ đề" : "Thuyết minh"}`}
                />
                {!isPlaying && (
                  <button
                    onClick={handlePlay}
                    className="absolute inset-0 m-auto h-16 w-16 flex items-center justify-center text-2xl bg-white/10 hover:bg-white/20 backdrop-blur rounded-full"
                  >
                    ▶
                  </button>
                )}
                {showSkipIntro && (
                  <button
                    onClick={skipIntro}
                    className="absolute right-3 bottom-3 rounded bg-[#FFC94A] px-3 py-1 text-black text-sm shadow"
                  >
                    Bỏ qua giới thiệu
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-[#F5F5F5] text-xl font-medium mb-2">Không có video để phát</p>
                  <p className="text-[#F5F5F5]/60">Vui lòng thử lại sau</p>
                </div>
              </div>
            )}
          </div>

          {/* Movie Info */}
          <div className="space-y-3 mb-6">
            <h2 className="text-xl font-bold text-[#F5F5F5]">{movie.name}</h2>
            <p className="opacity-80 text-sm">
              ⭐ {movie.rating || '8.5'}/10 • {movie.year || '2024'} • {movie.quality || 'HD'}
            </p>
            <p className="text-sm opacity-90">{movie.content || 'Một câu chuyện hấp dẫn và thú vị.'}</p>
            
            {/* Audio Type Selection */}
            <div className="flex items-center gap-3">
              <span className="text-[#F5F5F5]/60 text-sm">Audio:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setAudio("subtitle")}
                  className={`px-3 py-1 rounded-full ring-1 text-xs transition-colors ${
                    audioType === "subtitle" 
                      ? "bg-[#FFC94A] text-black ring-[#FFC94A]" 
                      : "bg-transparent ring-[#44475A] hover:bg-[#272A3A]"
                  }`}
                >
                  Phụ đề
                </button>
                {hasDubVersion && (
                  <button
                    onClick={() => setAudio("dub")}
                    className={`px-3 py-1 rounded-full ring-1 text-xs transition-colors ${
                      audioType === "dub" 
                        ? "bg-[#FFC94A] text-black ring-[#FFC94A]" 
                        : "bg-transparent ring-[#44475A] hover:bg-[#272A3A]"
                    }`}
                  >
                    Thuyết minh
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#F5F5F5]/40 text-xs">
                  ({audioType === "subtitle" ? "Có phụ đề tiếng Việt" : "Lồng tiếng Việt"})
                </span>
                {hasDubVersion ? (
                  <span className="text-[#FFC94A]/60 text-xs">
                    ✓ Có thuyết minh
                  </span>
                ) : (
                  <span className="text-[#F5F5F5]/30 text-xs">
                    • Chỉ có phụ đề
                  </span>
                )}
              </div>
              <div className="text-[#F5F5F5]/30 text-xs mt-1">
                ⌨️ Phím tắt: ← → để chuyển tập, E để mở danh sách
              </div>
            </div>
          </div>

          {/* Server Selection */}
          {episodes.length > 1 && (
            <div className="mb-6">
              <h3 className="text-[#FFC94A] font-semibold mb-3">Chọn server phát:</h3>
              <div className="flex flex-wrap gap-2">
                {episodes.map((server, index) => (
                  <button
                    key={index}
                    onClick={() => handleServerChange(index)}
                    className={`px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] ${
                      selectedServer === server ? "bg-[#FFC94A] text-black" : "bg-[#272A3A]"
                    }`}
                  >
                    {server.server_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Episode List */}
          {selectedServer && selectedServer.server_data && (
            <div className="mb-6">
              <h3 className="text-[#FFC94A] font-semibold mb-3">
                Danh sách tập: {selectedServer.server_data.length} tập
              </h3>
              <EpisodeSelector
                episodes={selectedServer.server_data}
                currentEpisode={parseInt(ep) - 1}
                currentServer={episodes.indexOf(selectedServer)}
                onEpisodeChange={handleEpisodeChange}
                maxVisible={12}
              />
            </div>
          )}

          {/* Comments Section */}
          <div>
            <h3 className="mb-2 font-semibold text-[#FFC94A]">Bình luận</h3>
            <div className="flex items-center gap-3 mb-4">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Nhập bình luận..."
                className="flex-1 bg-[#0E0E18] px-3 py-2 text-sm rounded ring-1 ring-[#272A3A] text-[#F5F5F5] placeholder-[#F5F5F5]/50"
              />
              <button
                onClick={postComment}
                className="bg-[#FFC94A] text-black px-3 py-2 rounded text-sm hover:bg-[#FFC94A]/90 transition-colors"
              >
                Gửi
              </button>
            </div>
            {comments.map((c) => (
              <div key={c.id} className="flex flex-col mb-3 border-b border-[#272A3A] pb-2">
                <div className="text-sm font-semibold text-[#F5F5F5]">
                  {c.name} <span className="text-xs opacity-70 ml-2">{c.time}</span>
                </div>
                <p className="text-sm opacity-90 text-[#F5F5F5]">{c.text}</p>
                <div className="text-xs opacity-60 mt-1 text-[#F5F5F5]">❤️ {c.likes}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
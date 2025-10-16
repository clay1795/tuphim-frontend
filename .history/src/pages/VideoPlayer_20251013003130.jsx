import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getApiUrl } from '../utils/apiConfig.js';

const VideoPlayer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State management
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEpisodeList, setShowEpisodeList] = useState(false);

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
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showEpisodeList]);

  const handleEpisodeChange = useCallback((newServerIndex, newEpisodeIndex) => {
    navigate(`/xem-phim/${slug}?ver=${ver}&ss=${newServerIndex + 1}&ep=${newEpisodeIndex + 1}`, { replace: true });
  }, [navigate, slug, ver]);

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
      <div className="absolute top-0 left-0 right-0 z-50">
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
                onClick={() => setShowEpisodeList(!showEpisodeList)}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Player - Only iframe */}
      <div className="relative w-full h-screen">
        {selectedEpisode.link_m3u8 || selectedEpisode.link_embed ? (
          <iframe
            src={selectedEpisode.link_embed || selectedEpisode.link_m3u8}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            title={movie.name}
          />
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
    </div>
  );
};

export default VideoPlayer;
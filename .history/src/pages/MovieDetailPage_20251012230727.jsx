import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, Globe, Tag, Eye, ThumbsUp } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { useMovieDetailContext } from '../context/MovieDetailContext';

const MovieDetailPage = () => {
  const { movieId, slug } = useParams();
  const navigate = useNavigate();
  const { movieDetail, loading, fetchMovieDetail } = useMovieDetailContext();
  const [error, setError] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [showEpisodes, setShowEpisodes] = useState(false);

  // Use movieId if available, otherwise use slug
  const identifier = movieId || slug;

  useEffect(() => {
    if (identifier) {
      fetchMovieDetail(identifier).catch(err => {
        console.error('Failed to fetch movie detail:', err);
        setError(err);
      });
    }
  }, [identifier, fetchMovieDetail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error && !movieDetail) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-xl mb-4">Không thể tải thông tin phim</div>
          <div className="text-gray-400 mb-4">Vui lòng thử lại sau</div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!movieDetail) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  const handleEpisodeChange = (version) => {
    console.log('Episode changed:', version);
  };

  const handleFavorite = (movie) => {
    console.log('Added to favorites:', movie);
    // Implement favorite logic
  };

  const handleAddToList = (movie) => {
    console.log('Added to list:', movie);
    // Implement add to list logic
  };

  const handleShare = (movie) => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Xem phim ${movie.title} trên RoPhim`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link đã được copy!');
    }
  };

  const handleReport = (movie) => {
    console.log('Report movie:', movie);
    // Implement report logic
  };

  // Mock episodes data
  const episodes = Array.from({ length: movieDetail.totalEpisodes || 24 }, (_, i) => ({
    id: i + 1,
    title: `Tập ${i + 1}`,
    duration: '24:35',
    isWatched: Math.random() > 0.7
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-white hover:text-red-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </button>
            
            <h1 className="text-xl font-bold truncate max-w-md">
              {movieDetail.title}
            </h1>
            
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player - Takes up 2/3 on large screens */}
          <div className="lg:col-span-2">
            <VideoPlayer
              movieData={{
                ...movieDetail,
                embedUrl: movieDetail.embedUrl || `https://goatembed.com/${identifier}?version=1`
              }}
              currentEpisode={currentEpisode}
              onEpisodeChange={handleEpisodeChange}
              onFavorite={handleFavorite}
              onAddToList={handleAddToList}
              onShare={handleShare}
              onReport={handleReport}
            />
          </div>

          {/* Movie Info Sidebar */}
          <div className="space-y-6">
            {/* Movie Poster & Basic Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex space-x-4 mb-4">
                <img
                  src={movieDetail.poster || '/api/placeholder/200/300'}
                  alt={movieDetail.title}
                  className="w-24 h-36 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-bold mb-2">{movieDetail.title}</h2>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{movieDetail.rating || '8.5'}/10</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{movieDetail.year || '2024'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{movieDetail.duration || '120 phút'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>{movieDetail.country || 'Mỹ'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {(movieDetail.genres || ['Hành động', 'Tâm lý', 'Tội phạm']).map((genre, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-600 text-white text-xs rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{movieDetail.views || '1.2M'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{movieDetail.likes || '8.5K'}</span>
                </div>
              </div>
            </div>

            {/* Episodes List */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Danh sách tập</h3>
                <button
                  onClick={() => setShowEpisodes(!showEpisodes)}
                  className="text-red-500 hover:text-red-400 transition-colors"
                >
                  {showEpisodes ? 'Ẩn' : 'Hiện'}
                </button>
              </div>

              {showEpisodes && (
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {episodes.map((episode) => (
                      <button
                        key={episode.id}
                        onClick={() => setCurrentEpisode(episode.id)}
                        className={`p-2 rounded-lg text-left transition-colors ${
                          episode.id === currentEpisode
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{episode.title}</span>
                          {episode.isWatched && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {episode.duration}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Movie Description */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Nội dung phim</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {movieDetail.description || 
                  'Phim kể về một câu chuyện hấp dẫn với những tình tiết bất ngờ. Diễn viên thể hiện xuất sắc vai diễn của mình, tạo nên một bộ phim đáng xem.'}
              </p>
            </div>

            {/* Cast & Crew */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Diễn viên</h3>
              <div className="space-y-2">
                {(movieDetail.cast || ['Diễn viên A', 'Diễn viên B', 'Diễn viên C']).map((actor, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                      {actor.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-300">{actor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Movies */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Phim liên quan</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex space-x-3">
                    <img
                      src="/api/placeholder/60/90"
                      alt="Related movie"
                      className="w-15 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-1">Phim liên quan {item}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>2024</span>
                        <span>•</span>
                        <span>8.5/10</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;

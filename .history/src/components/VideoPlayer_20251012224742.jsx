import React, { useState, useRef, useEffect } from 'react';
import { Heart, Plus, Users, Share2, Flag, MessageCircle, Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

const VideoPlayer = ({ 
  movieData, 
  currentEpisode = 1, 
  onEpisodeChange,
  onFavorite,
  onAddToList,
  onShare,
  onReport
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState('vietsub');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Mock data cho versions
  const versions = [
    { id: 'vietsub', label: 'Phụ đề', url: movieData?.embedUrl || '', isActive: true },
    { id: 'vietnamese', label: 'Thuyết minh giọng Nam', url: movieData?.embedUrl || '', isActive: false }
  ];

  // Mock data cho comments
  const mockComments = [
    { id: 1, user: 'Nguyễn Văn A', avatar: '👤', text: 'Phim hay quá!', time: '2 phút trước', likes: 5 },
    { id: 2, user: 'Trần Thị B', avatar: '👩', text: 'Diễn viên đóng rất tốt', time: '5 phút trước', likes: 3 },
    { id: 3, user: 'Lê Văn C', avatar: '👨', text: 'Cốt truyện hấp dẫn', time: '10 phút trước', likes: 8 }
  ];

  useEffect(() => {
    setComments(mockComments);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
    setDuration(e.target.duration);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleVersionChange = (versionId) => {
    setSelectedVersion(versionId);
    const version = versions.find(v => v.id === versionId);
    if (version && onEpisodeChange) {
      onEpisodeChange(version);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        user: 'Bạn',
        avatar: '👤',
        text: newComment,
        time: 'Vừa xong',
        likes: 0
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-2xl">
      {/* Player Container */}
      <div 
        ref={playerRef}
        className="relative group bg-black"
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video/Iframe */}
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
          {movieData?.embedUrl ? (
            <iframe
              ref={videoRef}
              src={movieData.embedUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title={movieData.title}
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium">Video không khả dụng</p>
                <p className="text-sm text-gray-400">Vui lòng chọn tập phim khác</p>
              </div>
            </div>
          )}

          {/* Overlay Controls */}
          {showControls && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
              {/* Top Controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <h3 className="text-white text-lg font-semibold truncate">
                  {movieData?.title} - Tập {currentEpisode}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handlePlayPause}
                  className="p-4 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-12 h-12" />
                  ) : (
                    <Play className="w-12 h-12 ml-1" />
                  )}
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-4 left-4 right-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div 
                    className="w-full h-1 bg-white/30 rounded-full cursor-pointer"
                    onClick={handleSeek}
                  >
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePlayPause}
                      className="text-white hover:text-red-500 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleMuteToggle}
                        className="text-white hover:text-red-500 transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button className="text-white hover:text-red-500 transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleFullscreen}
                      className="text-white hover:text-red-500 transition-colors"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onFavorite && onFavorite(movieData)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
            >
              <Heart className="w-4 h-4" />
              <span>Yêu thích</span>
            </button>
            
            <button
              onClick={() => onAddToList && onAddToList(movieData)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm vào</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white">
              <Users className="w-4 h-4" />
              <span>Xem chung</span>
            </button>

            <button
              onClick={() => onShare && onShare(movieData)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>

            <button
              onClick={() => onReport && onReport(movieData)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
            >
              <Flag className="w-4 h-4" />
              <span>Báo lỗi</span>
            </button>
          </div>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Bình luận ({comments.length})</span>
          </button>
        </div>
      </div>

      {/* Version Switcher */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="text-white font-medium">Các bản chiếu:</span>
          {versions.map((version) => (
            <button
              key={version.id}
              onClick={() => handleVersionChange(version.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                version.id === selectedVersion
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{version.label}</span>
                {version.id === selectedVersion && (
                  <span className="text-xs bg-red-500 px-2 py-1 rounded">Đang xem</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="p-4 bg-gray-900">
          <div className="max-h-96 overflow-y-auto">
            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="mb-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm">
                  👤
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="w-full p-3 bg-gray-800 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows="2"
                    maxLength="1000"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">
                      {newComment.length}/1000
                    </span>
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Bình luận
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium text-sm">{comment.user}</span>
                        <span className="text-gray-400 text-xs">{comment.time}</span>
                      </div>
                      <p className="text-gray-200 text-sm">{comment.text}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <button className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs">{comment.likes}</span>
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors text-xs">
                        Trả lời
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

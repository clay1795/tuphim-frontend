import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';

const VideoPlayerDemo = () => {
  const navigate = useNavigate();
  const [currentEpisode, setCurrentEpisode] = useState(1);

  // Mock movie data for demo
  const mockMovieData = {
    _id: 'demo-movie-1',
    title: 'Phi Vụ Bẩn - Play Dirty',
    slug: 'phi-vu-ban',
    poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    embedUrl: 'https://goatembed.com/cs4GyL8G?version=1',
    year: 2024,
    rating: 8.5,
    duration: '120 phút',
    country: 'Mỹ',
    genres: ['Hành động', 'Tâm lý', 'Tội phạm'],
    views: '1.2M',
    likes: '8.5K',
    totalEpisodes: 1,
    description: 'Phim kể về một câu chuyện hấp dẫn với những tình tiết bất ngờ. Diễn viên thể hiện xuất sắc vai diễn của mình, tạo nên một bộ phim đáng xem với chất lượng hình ảnh tuyệt vời và cốt truyện hấp dẫn.',
    cast: ['Diễn viên A', 'Diễn viên B', 'Diễn viên C', 'Diễn viên D']
  };

  const handleEpisodeChange = (version) => {
    console.log('Episode changed:', version);
    setCurrentEpisode(version.id === 'vietsub' ? 1 : 2);
  };

  const handleFavorite = (movie) => {
    console.log('Added to favorites:', movie);
    alert(`Đã thêm "${movie.title}" vào danh sách yêu thích!`);
  };

  const handleAddToList = (movie) => {
    console.log('Added to list:', movie);
    alert(`Đã thêm "${movie.title}" vào danh sách!`);
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
    alert(`Đã báo cáo "${movie.title}"!`);
  };

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
            
            <h1 className="text-xl font-bold">Demo Video Player</h1>
            
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">VideoPlayer Component Demo</h2>
          <p className="text-gray-400">
            Đây là demo của VideoPlayer component được nâng cấp dựa trên UI của RoPhim.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player - Takes up 2/3 on large screens */}
          <div className="lg:col-span-2">
            <VideoPlayer
              movieData={mockMovieData}
              currentEpisode={currentEpisode}
              onEpisodeChange={handleEpisodeChange}
              onFavorite={handleFavorite}
              onAddToList={handleAddToList}
              onShare={handleShare}
              onReport={handleReport}
            />
          </div>

          {/* Demo Info Sidebar */}
          <div className="space-y-6">
            {/* Features List */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Tính năng VideoPlayer</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Video player với iframe embedding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Controls hiện đại (play, pause, volume, fullscreen)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Progress bar tương tác</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Version switcher (Phụ đề, Thuyết minh)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Action buttons (Yêu thích, Thêm vào, Chia sẻ, v.v.)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Hệ thống bình luận</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Responsive design cho mobile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Dark theme hiện đại</span>
                </div>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Cách sử dụng</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div>
                  <strong className="text-white">Hover vào video:</strong> Hiển thị controls
                </div>
                <div>
                  <strong className="text-white">Click vào progress bar:</strong> Nhảy đến thời điểm
                </div>
                <div>
                  <strong className="text-white">Version switcher:</strong> Chuyển đổi giữa Phụ đề và Thuyết minh
                </div>
                <div>
                  <strong className="text-white">Action buttons:</strong> Yêu thích, thêm vào danh sách, chia sẻ
                </div>
                <div>
                  <strong className="text-white">Bình luận:</strong> Click "Bình luận" để mở/đóng
                </div>
              </div>
            </div>

            {/* Technical Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Thông tin kỹ thuật</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div><strong className="text-white">Component:</strong> VideoPlayer.jsx</div>
                <div><strong className="text-white">Styling:</strong> Tailwind CSS + Custom CSS</div>
                <div><strong className="text-white">Icons:</strong> Lucide React</div>
                <div><strong className="text-white">Responsive:</strong> Mobile-first design</div>
                <div><strong className="text-white">Theme:</strong> Dark mode</div>
              </div>
            </div>

            {/* Test Actions */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Test Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentEpisode(prev => prev === 1 ? 2 : 1)}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                >
                  Toggle Episode ({currentEpisode})
                </button>
                <button
                  onClick={() => handleFavorite(mockMovieData)}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                >
                  Test Favorite
                </button>
                <button
                  onClick={() => handleShare(mockMovieData)}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                >
                  Test Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerDemo;

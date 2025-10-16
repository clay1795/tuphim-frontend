const TopComments = () => {
  const comments = [
    {
      id: 1,
      user: "Đinh Ngọc An",
      avatar: "👤",
      content: "Phim này như cái con cac tao",
      movie: "F1",
      rating: 1,
      time: "2 giờ trước"
    },
    {
      id: 2,
      user: "MovieLover",
      avatar: "🎬",
      content: "Cốt truyện hấp dẫn, không thể rời mắt được",
      movie: "Vay Bat",
      rating: 5,
      time: "4 giờ trước"
    },
    {
      id: 3,
      user: "CinemaGoer",
      avatar: "🎭",
      content: "Hiệu ứng hình ảnh đẹp mắt, đáng xem!",
      movie: "Giong To 2025",
      rating: 4,
      time: "6 giờ trước"
    },
    {
      id: 4,
      user: "FilmCritic",
      avatar: "📽️",
      content: "Phim có nhiều tình tiết bất ngờ, rất thú vị",
      movie: "Sac Xuan Treu Nguoi 2025",
      rating: 5,
      time: "8 giờ trước"
    },
    {
      id: 5,
      user: "MovieBuff",
      avatar: "🎪",
      content: "Đạo diễn đã làm rất tốt, phim rất có chiều sâu",
      movie: "Tuyet Canh Ba",
      rating: 4,
      time: "10 giờ trước"
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-400'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Top Bình Luận
          </h2>
          <p className="text-gray-400 text-lg">
            Những đánh giá mới nhất từ cộng đồng
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-xl">
                    {comment.avatar}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">{comment.user}</h4>
                    <span className="text-gray-400 text-sm">{comment.time}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(comment.rating)}
                    </div>
                    <span className="text-gray-400 text-sm">về phim</span>
                    <span className="text-red-400 font-medium">{comment.movie}</span>
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed">
                    "{comment.content}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300">
            Xem thêm bình luận
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopComments;


import { useState, useEffect } from 'react';

const TopComments = () => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Sample comments data
    const sampleComments = [
      {
        id: 1,
        user: 'NguyenVanA',
        movie: 'Avengers: Endgame',
        comment: 'Phim hay quá, cảm ơn admin đã chia sẻ!',
        rating: 5,
        time: '2 giờ trước'
      },
      {
        id: 2,
        user: 'TranThiB',
        movie: 'Spider-Man: No Way Home',
        comment: 'Tuyệt vời, chất lượng 4K rất tốt',
        rating: 5,
        time: '5 giờ trước'
      },
      {
        id: 3,
        user: 'LeVanC',
        movie: 'The Batman',
        comment: 'Phim tình tiết hấp dẫn, diễn viên đóng hay',
        rating: 4,
        time: '1 ngày trước'
      },
      {
        id: 4,
        user: 'PhamThiD',
        movie: 'Top Gun: Maverick',
        comment: 'Phim hành động xuất sắc, đáng xem!',
        rating: 5,
        time: '2 ngày trước'
      }
    ];
    
    setComments(sampleComments);
  }, []);

  return (
    <section className="py-12 bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Top Bình Luận
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {comment.user.charAt(0)}
                </div>
                <div className="ml-3">
                  <div className="text-white font-medium text-sm">{comment.user}</div>
                  <div className="text-gray-400 text-xs">{comment.time}</div>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="text-blue-400 text-sm font-medium mb-1">
                  {comment.movie}
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < comment.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                {comment.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopComments;

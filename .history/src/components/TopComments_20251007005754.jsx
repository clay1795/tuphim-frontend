import React from 'react';

const comments = [
  {
    id: 1,
    user: 'Nguyễn Văn A',
    avatar: 'NA',
    rating: 5,
    text: 'Phim hay tuyệt vời, kỹ xảo mãn nhãn, cốt truyện cuốn hút. Rất đáng xem!',
    time: '2 giờ trước',
  },
  {
    id: 2,
    user: 'Trần Thị B',
    avatar: 'TB',
    rating: 4,
    text: 'Diễn xuất đỉnh cao, nhưng đoạn cuối hơi khó hiểu một chút. Dù sao cũng rất ấn tượng.',
    time: '5 giờ trước',
  },
  {
    id: 3,
    user: 'Lê Văn C',
    avatar: 'LC',
    rating: 5,
    text: 'Đã xem đi xem lại 3 lần mà vẫn thấy hay. Âm nhạc và hình ảnh đều xuất sắc.',
    time: '1 ngày trước',
  },
  {
    id: 4,
    user: 'Phạm Thị D',
    avatar: 'PD',
    rating: 3,
    text: 'Phim ổn, giải trí tốt. Không quá đặc sắc nhưng cũng không tệ. Phù hợp xem cuối tuần.',
    time: '2 ngày trước',
  },
];

const TopComments = () => {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 bg-gray-900">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Top Bình Luận</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-800 rounded-lg shadow-lg p-6 flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
              {comment.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{comment.user}</h3>
                <span className="text-gray-400 text-sm">{comment.time}</span>
              </div>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < comment.rating ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopComments;

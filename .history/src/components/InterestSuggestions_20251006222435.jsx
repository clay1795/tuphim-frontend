import { Link } from 'react-router-dom';

const InterestSuggestions = () => {
  const suggestions = [
    { title: 'Phim Hành Động', link: '/hoat-hinh?category=action', icon: '💥' },
    { title: 'Phim Tình Cảm', link: '/hoat-hinh?category=romance', icon: '💕' },
    { title: 'Phim Hài', link: '/hoat-hinh?category=comedy', icon: '😂' },
    { title: 'Phim Kinh Dị', link: '/hoat-hinh?category=horror', icon: '👻' },
    { title: 'Phim Khoa Học Viễn Tưởng', link: '/hoat-hinh?category=sci-fi', icon: '🚀' },
    { title: 'Phim Trinh Thám', link: '/hoat-hinh?category=mystery', icon: '🔍' }
  ];

  return (
    <section className="py-12 bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Bạn đang quan tâm gì?
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {suggestions.map((suggestion, index) => (
            <Link
              key={index}
              to={suggestion.link}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-center transition-colors group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {suggestion.icon}
              </div>
              <div className="text-white font-medium text-sm">
                {suggestion.title}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InterestSuggestions;

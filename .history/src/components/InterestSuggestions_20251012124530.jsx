const InterestSuggestions = () => {
  const suggestions = [
    { name: 'Marvel', color: 'bg-red-600', icon: '🦸' },
    { name: '4K', color: 'bg-blue-600', icon: '📺' },
    { name: 'Sitcom', color: 'bg-green-600', icon: '😄' },
    { name: 'Lồng Tiếng Cực Mạnh', color: 'bg-purple-600', icon: '🎭' },
    { name: 'Xuyên Không', color: 'bg-yellow-600', icon: '⏰' },
    { name: 'Cổ Trang', color: 'bg-orange-600', icon: '🏮' },
    { name: 'Anime', color: 'bg-pink-600', icon: '🎌' },
    { name: 'Hành Động', color: 'bg-gray-600', icon: '💥' },
    { name: 'Tình Cảm', color: 'bg-rose-600', icon: '💕' },
    { name: 'Kinh Dị', color: 'bg-slate-600', icon: '👻' },
    { name: 'Hài Hước', color: 'bg-amber-600', icon: '😂' },
    { name: 'Khoa Học Viễn Tưởng', color: 'bg-cyan-600', icon: '🚀' }
  ];

  return (
    <div className="bg-gray-900 py-6 sm:py-8 md:py-12">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-4">
            Bạn đang quan tâm gì?
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg">
            Khám phá những chủ đề phim thú vị
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className={`${suggestion.color} hover:scale-102 sm:hover:scale-105 transition-all duration-300 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white font-semibold text-center group relative overflow-hidden touch-target`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">{suggestion.icon}</div>
                <div className="text-xs sm:text-sm font-medium leading-tight">{suggestion.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterestSuggestions;


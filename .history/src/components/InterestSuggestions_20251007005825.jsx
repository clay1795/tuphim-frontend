import React from 'react';
import { Link } from 'react-router-dom';

const suggestions = [
  { name: 'Hành Động', icon: '💥', link: '/tim-kiem?category=Hành Động' },
  { name: 'Tình Cảm', icon: '❤️', link: '/tim-kiem?category=Tình Cảm' },
  { name: 'Hài Hước', icon: '😂', link: '/tim-kiem?category=Hài Hước' },
  { name: 'Khoa Học', icon: '🔬', link: '/tim-kiem?category=Khoa Học Viễn Tưởng' },
  { name: 'Kinh Dị', icon: '👻', link: '/tim-kiem?category=Kinh Dị' },
  { name: 'Hoạt Hình', icon: '🎬', link: '/tim-kiem?category=Hoạt Hình' },
];

const InterestSuggestions = () => {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 bg-gray-900">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Bạn đang quan tâm gì?</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
        {suggestions.map((suggestion) => (
          <Link
            key={suggestion.name}
            to={suggestion.link}
            className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 group"
          >
            <span className="text-5xl mb-3 transition-transform duration-300 group-hover:rotate-6">
              {suggestion.icon}
            </span>
            <p className="text-lg font-semibold text-white group-hover:text-blue-400">
              {suggestion.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default InterestSuggestions;

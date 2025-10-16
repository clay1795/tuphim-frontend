import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import simpleMovieApi from '../services/simpleMovieApi';

const MovieDetailRoPhim = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        const data = await simpleMovieApi.getMovieDetail(slug);
        
        if (data) {
          setMovie(data);
        } else {
          setError('Không tìm thấy phim');
        }
      } catch (err) {
        console.error('Error fetching movie detail:', err);
        setError('Lỗi khi tải chi tiết phim.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadMovie();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải chi tiết phim...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold mb-4 text-red-400">
            {error || 'Không tìm thấy phim'}
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <img
              src={movie.thumb_url || movie.poster_url || '/placeholder-movie.jpg'}
              alt={movie.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{movie.name}</h1>
            
            {movie.origin_name && movie.origin_name !== movie.name && (
              <p className="text-xl text-gray-400 mb-4">{movie.origin_name}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {movie.year && (
                <div>
                  <span className="text-gray-400">Năm:</span>
                  <span className="ml-2 text-white">{movie.year}</span>
                </div>
              )}
              
              {movie.quality && (
                <div>
                  <span className="text-gray-400">Chất lượng:</span>
                  <span className="ml-2 text-green-400">{movie.quality}</span>
                </div>
              )}

              {movie.episode_current && movie.episode_total && (
                <div>
                  <span className="text-gray-400">Tập:</span>
                  <span className="ml-2 text-white">
                    {movie.episode_current}/{movie.episode_total}
                  </span>
                </div>
              )}

              {movie.tmdb?.vote_average && (
                <div>
                  <span className="text-gray-400">Đánh giá:</span>
                  <span className="ml-2 text-yellow-400">
                    {movie.tmdb.vote_average}/10
                  </span>
                </div>
              )}
            </div>

            {movie.category && movie.category.length > 0 && (
              <div className="mb-4">
                <span className="text-gray-400">Thể loại:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {movie.category.map((cat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                    >
                      {cat.name || cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.country && movie.country.length > 0 && (
              <div className="mb-4">
                <span className="text-gray-400">Quốc gia:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {movie.country.map((country, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-600 text-white rounded-full text-sm"
                    >
                      {country.name || country}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.content && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Nội dung</h3>
                <p className="text-gray-300 leading-relaxed">{movie.content}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors">
                Xem phim
              </button>
              <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors">
                Thêm vào danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailRoPhim;

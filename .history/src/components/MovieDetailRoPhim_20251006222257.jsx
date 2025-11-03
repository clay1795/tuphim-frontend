import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import simpleMovieApi from '../services/simpleMovieApi';

const MovieDetailRoPhim = () => {
  const { slug } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        const data = await simpleMovieApi.getMovieBySlug(slug);
        
        if (data) {
          setMovie(data);
        } else {
          setError('Không tìm thấy phim');
        }
      } catch (err) {
        console.error('Error loading movie:', err);
        setError('Lỗi khi tải phim');
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải phim...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || 'Không tìm thấy phim'}</div>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={movie.thumb_url || movie.poster_url || '/placeholder-movie.jpg'}
                alt={movie.name}
                className="w-full h-auto"
              />
            </div>
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold text-white mb-4">{movie.name}</h1>
              {movie.origin_name && (
                <p className="text-gray-400 mb-2">Tên gốc: {movie.origin_name}</p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-4">
                {movie.year && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded">
                    {movie.year}
                  </span>
                )}
                {movie.quality && (
                  <span className="bg-green-600 text-white px-3 py-1 rounded">
                    {movie.quality}
                  </span>
                )}
                {movie.episode_current && movie.episode_total && (
                  <span className="bg-purple-600 text-white px-3 py-1 rounded">
                    Tập {movie.episode_current}/{movie.episode_total}
                  </span>
                )}
              </div>

              {movie.category && movie.category.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-white font-semibold mb-2">Thể loại:</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.category.map((cat, index) => (
                      <span key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded">
                        {cat.name || cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.country && movie.country.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-white font-semibold mb-2">Quốc gia:</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.country.map((country, index) => (
                      <span key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded">
                        {country.name || country}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.content && (
                <div className="mb-4">
                  <h3 className="text-white font-semibold mb-2">Nội dung:</h3>
                  <p className="text-gray-300 leading-relaxed">{movie.content}</p>
                </div>
              )}

              <div className="mt-6">
                <Link
                  to="/"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  ← Quay về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailRoPhim;

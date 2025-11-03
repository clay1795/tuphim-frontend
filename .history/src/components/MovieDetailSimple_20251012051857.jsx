import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const MovieDetailSimple = () => {
  const { slug } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMovieDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading movie detail for slug:', slug);
        
        const response = await fetch(`http://localhost:3001/api/movies/detail/${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);

        // Simple data processing
        if (data.success && data.data && data.data.movie) {
          setMovie(data.data.movie);
        } else {
          throw new Error('No movie data found in response');
        }
        
      } catch (error) {
        console.error('Error loading movie detail:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadMovieDetail();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-4 text-red-400">Lỗi tải phim</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy phim</h2>
          <p className="text-gray-300 mb-6">Phim với slug "{slug}" không tồn tại.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{movie.name}</h1>
            <div className="flex items-center space-x-4 text-gray-300">
              <span>{movie.year}</span>
              <span>•</span>
              <span>{movie.quality}</span>
              <span>•</span>
              <span>{movie.type}</span>
            </div>
          </div>

          {/* Movie Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              <img
                src={movie.poster_url || movie.thumb_url || 'https://via.placeholder.com/300x450?text=No+Image'}
                alt={movie.name}
                className="w-full rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                }}
              />
            </div>

            {/* Details */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Description */}
                {movie.content && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Mô tả</h3>
                    <p className="text-gray-300 leading-relaxed">{movie.content}</p>
                  </div>
                )}

                {/* Categories */}
                {movie.category && movie.category.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Thể loại</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.category.map((cat, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Countries */}
                {movie.country && movie.country.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Quốc gia</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.country.map((country, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-600 text-white rounded-full text-sm"
                        >
                          {country.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actors */}
                {movie.actor && movie.actor.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Diễn viên</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.actor.map((actor, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm"
                        >
                          {actor.name || actor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Director */}
                {movie.director && movie.director.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Đạo diễn</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.director.map((director, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm"
                        >
                          {director.name || director}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
            <div className="text-sm text-gray-300">
              <div><strong>Slug:</strong> {slug}</div>
              <div><strong>Movie ID:</strong> {movie._id}</div>
              <div><strong>Status:</strong> {movie.status}</div>
              <div><strong>Episode Current:</strong> {movie.episode_current}</div>
              <div><strong>Episode Total:</strong> {movie.episode_total}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailSimple;








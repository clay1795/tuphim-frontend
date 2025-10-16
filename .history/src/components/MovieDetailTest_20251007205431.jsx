import { useState, useEffect } from 'react';

const MovieDetailTest = () => {
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testMovieDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/movies/detail/nhat-tieu-tuy-ca');
      const data = await response.json();
      
      if (response.ok) {
        setMovieData(data);
      } else {
        setError(`API Error: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testMovieDetail();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Movie Detail API Test</h2>
      
      <div className="mb-6">
        <button
          onClick={testMovieDetail}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Movie Detail API'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error</h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      {movieData && (
        <div className="space-y-6">
          {/* API Response Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">API Response Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Success:</span> 
                <span className={`ml-2 px-2 py-1 rounded ${movieData.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {movieData.success ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Message:</span> 
                <span className="ml-2">{movieData.message}</span>
              </div>
            </div>
          </div>

          {/* Movie Basic Info */}
          {movieData.data?.movie && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Movie Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> 
                  <span className="ml-2">{movieData.data.movie.name}</span>
                </div>
                <div>
                  <span className="font-medium">Slug:</span> 
                  <span className="ml-2">{movieData.data.movie.slug}</span>
                </div>
                <div>
                  <span className="font-medium">Year:</span> 
                  <span className="ml-2">{movieData.data.movie.year}</span>
                </div>
                <div>
                  <span className="font-medium">Quality:</span> 
                  <span className="ml-2">{movieData.data.movie.quality}</span>
                </div>
                <div>
                  <span className="font-medium">Type:</span> 
                  <span className="ml-2">{movieData.data.movie.type}</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <span className="ml-2">{movieData.data.movie.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Movie Description */}
          {movieData.data?.movie?.content && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {movieData.data.movie.content.substring(0, 500)}...
              </p>
            </div>
          )}

          {/* Categories */}
          {movieData.data?.movie?.category && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {movieData.data.movie.category.map((cat, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Countries */}
          {movieData.data?.movie?.country && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Countries</h3>
              <div className="flex flex-wrap gap-2">
                {movieData.data.movie.country.map((country, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                    {country.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Episodes */}
          {movieData.data?.episodes && movieData.data.episodes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Episodes ({movieData.data.episodes.length} servers)</h3>
              <div className="space-y-2">
                {movieData.data.episodes.slice(0, 3).map((episode, index) => (
                  <div key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <div className="font-medium">Server: {episode.server_name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Episodes: {episode.server_data?.length || 0}
                    </div>
                  </div>
                ))}
                {movieData.data.episodes.length > 3 && (
                  <div className="text-sm text-gray-500">... and {movieData.data.episodes.length - 3} more servers</div>
                )}
              </div>
            </div>
          )}

          {/* Raw Data (for debugging) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Raw API Response</h3>
            <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(movieData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailTest;


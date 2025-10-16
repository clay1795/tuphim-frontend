import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const MovieDetailDebug = () => {
  const { slug } = useParams();
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const testMovieDetail = async () => {
    setLoading(true);
    try {
      console.log('=== DEBUG: Starting movie detail fetch ===');
      console.log('Slug:', slug);
      
      const response = await fetch(`http://localhost:3001/api/movies/detail/${slug}`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw API Response:', data);
      
      // Test data processing
      let movieData = null;
      let episodesData = [];

      if (data.success && data.data) {
        movieData = data.data.movie;
        episodesData = data.data.episodes || [];
        console.log('Processing: data.success && data.data');
      } else if (data.movie) {
        movieData = data.movie;
        episodesData = data.episodes || [];
        console.log('Processing: data.movie');
      } else {
        console.log('Processing: fallback');
      }

      console.log('Processed movieData:', movieData);
      console.log('Processed episodesData:', episodesData);

      setDebugInfo({
        slug,
        responseStatus: response.status,
        responseOk: response.ok,
        rawData: data,
        processedMovieData: movieData,
        processedEpisodesData: episodesData,
        hasMovieData: !!movieData,
        hasEpisodesData: episodesData && episodesData.length > 0,
        error: null
      });

    } catch (error) {
      console.error('=== DEBUG: Error occurred ===', error);
      setDebugInfo({
        slug,
        error: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      testMovieDetail();
    }
  }, [slug]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">Movie Detail Debug</h2>
      
      <div className="mb-6">
        <button
          onClick={testMovieDetail}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Again'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Basic Info</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Slug:</span> {debugInfo.slug}</div>
            <div><span className="font-medium">Response Status:</span> {debugInfo.responseStatus}</div>
            <div><span className="font-medium">Response OK:</span> {debugInfo.responseOk ? 'Yes' : 'No'}</div>
            <div><span className="font-medium">Has Movie Data:</span> {debugInfo.hasMovieData ? 'Yes' : 'No'}</div>
            <div><span className="font-medium">Has Episodes Data:</span> {debugInfo.hasEpisodesData ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Error Info */}
        {debugInfo.error && (
          <div className="bg-red-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-red-200">Error</h3>
            <div className="text-red-300">
              <div><strong>Message:</strong> {debugInfo.error}</div>
              {debugInfo.stack && (
                <div className="mt-2">
                  <strong>Stack:</strong>
                  <pre className="text-xs bg-red-800 p-2 rounded mt-1 overflow-auto">
                    {debugInfo.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processed Movie Data */}
        {debugInfo.processedMovieData && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Processed Movie Data</h3>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Name:</span> {debugInfo.processedMovieData.name}</div>
              <div><span className="font-medium">Year:</span> {debugInfo.processedMovieData.year}</div>
              <div><span className="font-medium">Quality:</span> {debugInfo.processedMovieData.quality}</div>
              <div><span className="font-medium">Type:</span> {debugInfo.processedMovieData.type}</div>
            </div>
          </div>
        )}

        {/* Processed Episodes Data */}
        {debugInfo.processedEpisodesData && debugInfo.processedEpisodesData.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Processed Episodes Data</h3>
            <div className="text-sm">
              <div><span className="font-medium">Number of servers:</span> {debugInfo.processedEpisodesData.length}</div>
              {debugInfo.processedEpisodesData.slice(0, 2).map((ep, index) => (
                <div key={index} className="mt-2 p-2 bg-gray-700 rounded">
                  <div><strong>Server {index + 1}:</strong> {ep.server_name}</div>
                  <div><strong>Episodes:</strong> {ep.server_data?.length || 0}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Data */}
        {debugInfo.rawData && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Raw API Response</h3>
            <pre className="text-xs bg-gray-700 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(debugInfo.rawData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailDebug;




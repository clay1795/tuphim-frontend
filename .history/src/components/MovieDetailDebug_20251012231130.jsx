import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMovieDetailContext } from '../context/MovieDetailContext';

const MovieDetailDebug = () => {
  const { movieId, slug } = useParams();
  const { movieDetail, loading, fetchMovieDetail } = useMovieDetailContext();
  const [debugInfo, setDebugInfo] = useState({});
  
  const identifier = movieId || slug;

  useEffect(() => {
    if (identifier) {
      console.log('DEBUG: Starting fetch for:', identifier);
      setDebugInfo(prev => ({ ...prev, identifier, startTime: Date.now() }));
      
      fetchMovieDetail(identifier)
        .then(data => {
          console.log('DEBUG: Fetch completed:', data);
          setDebugInfo(prev => ({ 
            ...prev, 
            success: true, 
            data: data,
            endTime: Date.now(),
            duration: Date.now() - prev.startTime
          }));
        })
        .catch(err => {
          console.log('DEBUG: Fetch failed:', err);
          setDebugInfo(prev => ({ 
            ...prev, 
            success: false, 
            error: err.message,
            endTime: Date.now(),
            duration: Date.now() - prev.startTime
          }));
        });
    }
  }, [identifier, fetchMovieDetail]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Movie Detail Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
          <pre className="text-sm text-gray-300 overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Loading State</h2>
          <p className="text-sm text-gray-300">Loading: {loading ? 'true' : 'false'}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Movie Detail Data</h2>
          <pre className="text-sm text-gray-300 overflow-auto max-h-96">
            {JSON.stringify(movieDetail, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Identifier</h2>
          <p className="text-sm text-gray-300">Identifier: {identifier}</p>
          <p className="text-sm text-gray-300">Movie ID: {movieId || 'null'}</p>
          <p className="text-sm text-gray-300">Slug: {slug || 'null'}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailDebug;
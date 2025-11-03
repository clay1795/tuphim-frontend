import React, { useState, useEffect, useRef, useMemo } from 'react';
import SeparatedMovieCard from './SeparatedMovieCard';

const VirtualMovieGrid = ({ movies, loading }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef(null);
  const itemHeight = 400; // Estimated height per movie card
  const overscan = 10; // Extra items to render outside viewport

  // Calculate visible items based on scroll position
  const visibleMovies = useMemo(() => {
    return movies.slice(visibleRange.start, visibleRange.end);
  }, [movies, visibleRange]);

  // Handle scroll events
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const containerHeight = e.target.clientHeight;
    
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      movies.length
    );

    setVisibleRange({ start: Math.max(0, start - overscan), end });
  };

  // Update container height on mount
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-700 rounded-lg h-64 w-full mb-2"></div>
            <div className="bg-gray-700 rounded h-4 w-3/4 mb-1"></div>
            <div className="bg-gray-700 rounded h-3 w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-lg mb-4">Không có kết quả nào</div>
        <div className="text-gray-500 text-sm">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="text-sm text-gray-400 mb-4">
        Hiển thị {visibleRange.start + 1}-{Math.min(visibleRange.end, movies.length)} trong tổng số {movies.length.toLocaleString()} phim
      </div>

      {/* Virtual Grid */}
      <div 
        ref={containerRef}
        className="h-screen overflow-y-auto"
        onScroll={handleScroll}
        style={{ height: '70vh' }}
      >
        {/* Total height spacer */}
        <div style={{ height: movies.length * itemHeight }}>
          {/* Visible items */}
          <div 
            style={{ 
              transform: `translateY(${visibleRange.start * itemHeight}px)`,
              position: 'relative'
            }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {visibleMovies.map((movie, index) => (
                <SeparatedMovieCard 
                  key={movie.slug || movie._id}
                  movie={movie}
                  index={visibleRange.start + index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="text-center text-xs text-gray-500 mt-4">
        📜 Cuộn để xem thêm phim • {Math.round((visibleRange.end / movies.length) * 100)}% đã tải
      </div>
    </div>
  );
};

export default VirtualMovieGrid;

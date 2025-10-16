import { useState, useEffect } from 'react';
import { createDetailedMovieSections } from '../utils/movieFilters';
import MovieSection from './MovieSection';
import MovieSectionCarousel from './MovieSectionCarousel';

const MovieSectionsWithAPI = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSections = async () => {
      try {
        setLoading(true);
        console.log('Loading movie sections with API filtering...');
        
        const movieSections = await createDetailedMovieSections();
        console.log('Loaded sections:', movieSections.length);
        
        setSections(movieSections);
      } catch (err) {
        console.error('Error loading movie sections:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Đang tải phim...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-red-400 mb-4">Lỗi khi tải dữ liệu: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {sections.map((section) => {
        const Component = section.component === 'MovieSectionCarousel' ? MovieSectionCarousel : MovieSection;
        
        return (
          <Component
            key={section.key}
            title={section.title}
            description={section.description}
            movies={section.movies}
            linkTo={`/tim-kiem${section.searchParams}`}
          />
        );
      })}
    </>
  );
};

export default MovieSectionsWithAPI;

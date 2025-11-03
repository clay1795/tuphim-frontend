import { useState } from "react";
import MovieGrid from "./MovieGrid";
import movieGroupingService from "../services/movieGroupingService";

const SimpleSeriesTest = () => {
  const [showGrouped, setShowGrouped] = useState(true);

  // Sample data để test
  const sampleMovies = [
    {
      _id: '1',
      slug: 'one-punch-man-1',
      name: 'One Punch Man - Phần 1 HD Vietsub',
      origin_name: 'One Punch Man',
      year: 2015,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'HD',
      episode_current: '12',
      episode_total: '12'
    },
    {
      _id: '2',
      slug: 'one-punch-man-2',
      name: 'One Punch Man - Phần 2 HD Vietsub',
      origin_name: 'One Punch Man',
      year: 2019,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'HD',
      episode_current: '12',
      episode_total: '12'
    },
    {
      _id: '3',
      slug: 'one-punch-man-3',
      name: 'One Punch Man - Phần 3 HD Vietsub',
      origin_name: 'One Punch Man',
      year: 2025,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'FHD',
      episode_current: '12',
      episode_total: '12'
    },
    {
      _id: '4',
      slug: 'attack-on-titan-1',
      name: 'Attack on Titan - Phần 1',
      origin_name: 'Attack on Titan',
      year: 2013,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'FHD',
      episode_current: '25',
      episode_total: '25'
    },
    {
      _id: '5',
      slug: 'attack-on-titan-2',
      name: 'Attack on Titan - Phần 2',
      origin_name: 'Attack on Titan',
      year: 2017,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'FHD',
      episode_current: '12',
      episode_total: '12'
    },
    {
      _id: '6',
      slug: 'attack-on-titan-3',
      name: 'Attack on Titan - Phần 3',
      origin_name: 'Attack on Titan',
      year: 2018,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'FHD',
      episode_current: '22',
      episode_total: '22'
    },
    {
      _id: '7',
      slug: 'attack-on-titan-4',
      name: 'Attack on Titan - Phần 4',
      origin_name: 'Attack on Titan',
      year: 2020,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'FHD',
      episode_current: '16',
      episode_total: '16'
    },
    {
      _id: '8',
      slug: 'demon-slayer-1',
      name: 'Demon Slayer - Kimetsu no Yaiba - Phần 1',
      origin_name: 'Demon Slayer',
      year: 2019,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'HD',
      episode_current: '26',
      episode_total: '26'
    },
    {
      _id: '9',
      slug: 'demon-slayer-2',
      name: 'Demon Slayer - Kimetsu no Yaiba - Phần 2',
      origin_name: 'Demon Slayer',
      year: 2021,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'FHD',
      episode_current: '11',
      episode_total: '11'
    },
    {
      _id: '10',
      slug: 'jujutsu-kaisen-1',
      name: 'Jujutsu Kaisen - Phần 1',
      origin_name: 'Jujutsu Kaisen',
      year: 2020,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'HD',
      episode_current: '24',
      episode_total: '24'
    },
    {
      _id: '11',
      slug: 'jujutsu-kaisen-2',
      name: 'Jujutsu Kaisen - Phần 2',
      origin_name: 'Jujutsu Kaisen',
      year: 2023,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'FHD',
      episode_current: '23',
      episode_total: '23'
    },
    {
      _id: '12',
      slug: 'naruto-single',
      name: 'Naruto Movie: The Last',
      origin_name: 'Naruto',
      year: 2014,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'HD',
      episode_current: '1',
      episode_total: '1'
    }
  ];

  const analyzeMovies = () => {
    console.log('=== SIMPLE SERIES TEST ANALYSIS ===');
    console.log('Total movies:', sampleMovies.length);
    
    const grouped = movieGroupingService.groupMoviesBySeries(sampleMovies);
    console.log('Grouped movies:', grouped.length);
    
    // Analyze series
    const seriesMap = new Map();
    sampleMovies.forEach(movie => {
      const seriesKey = movieGroupingService.createSeriesKey(movie.name, movie.origin_name);
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, []);
      }
      seriesMap.get(seriesKey).push({
        name: movie.name,
        origin_name: movie.origin_name,
        partNumber: movieGroupingService.extractPartNumber(movie.name, movie.origin_name)
      });
    });
    
    console.log('Series analysis:');
    seriesMap.forEach((parts, seriesKey) => {
      console.log(`- ${seriesKey}: ${parts.length} parts`, parts);
    });
    
    console.log('Grouped result:');
    grouped.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.name} (${movie.seriesParts?.length || 1} parts)`);
    });
  };

  const groupedMovies = movieGroupingService.groupMoviesBySeries(sampleMovies);

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Simple Series Test</h1>
          
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setShowGrouped(!showGrouped)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showGrouped 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {showGrouped ? 'Hiển thị theo series' : 'Hiển thị tất cả phim'}
            </button>
            
            <button
              onClick={analyzeMovies}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Phân tích phim (Console)
            </button>
          </div>
          
          <div className="text-gray-400 text-sm">
            <p>Tổng phim: {sampleMovies.length}</p>
            <p>Phim sau nhóm: {groupedMovies.length}</p>
            <p>Giảm: {sampleMovies.length - groupedMovies.length} phim</p>
            <p>Series được nhận diện:</p>
            <ul className="ml-4 mt-2">
              <li>• One Punch Man (3 phần)</li>
              <li>• Attack on Titan (4 phần)</li>
              <li>• Demon Slayer (2 phần)</li>
              <li>• Jujutsu Kaisen (2 phần)</li>
              <li>• Naruto Movie (1 phim lẻ)</li>
            </ul>
          </div>
        </div>
        
        <MovieGrid
          movies={showGrouped ? groupedMovies : sampleMovies}
          title={showGrouped ? "Phim được nhóm theo series" : "Tất cả phim"}
          groupBySeries={showGrouped}
        />
      </div>
    </div>
  );
};

export default SimpleSeriesTest;


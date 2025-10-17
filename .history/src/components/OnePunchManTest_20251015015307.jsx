import { useState } from "react";
import MovieGrid from "./MovieGrid";
import movieGroupingService from "../services/movieGroupingService";

const OnePunchManTest = () => {
  const [showGrouped, setShowGrouped] = useState(true);

  // Dữ liệu test cụ thể cho One Punch Man - mô phỏng dữ liệu thực tế
  const onePunchManMovies = [
    {
      _id: '1',
      slug: 'one-punch-man-1',
      name: 'Đấm Phát Chết Luôn - Phần 1 HD Vietsub',
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
      name: 'Đấm Phát Chết Luôn - Phần 2 HD Vietsub',
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
      name: 'Đấm Phát Chết Luôn - Phần 3 HD Vietsub',
      origin_name: 'One Punch Man',
      year: 2025,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'FHD',
      episode_current: '12',
      episode_total: '12'
    },
    {
      _id: '4',
      slug: 'one-punch-man-special',
      name: 'One Punch Man OVA',
      origin_name: 'One Punch Man',
      year: 2016,
      poster_url: '/src/assets/temp-1.jpeg',
      quality: 'HD',
      episode_current: '1',
      episode_total: '1'
    }
  ];

  const testSeriesKey = () => {
    console.log('=== ONE PUNCH MAN SERIES KEY TEST ===');
    
    onePunchManMovies.forEach((movie, index) => {
      const seriesKey = movieGroupingService.createSeriesKey(movie.name, movie.origin_name);
      const partNumber = movieGroupingService.extractPartNumber(movie.name, movie.origin_name);
      
      console.log(`Movie ${index + 1}: "${movie.name}"`);
      console.log(`  Origin: "${movie.origin_name}"`);
      console.log(`  Series Key: "${seriesKey}"`);
      console.log(`  Part Number: ${partNumber}`);
      console.log('---');
    });
    
    const grouped = movieGroupingService.groupMoviesBySeries(onePunchManMovies);
    console.log('Grouped result:', grouped);
    console.log(`Total: ${onePunchManMovies.length} -> ${grouped.length} movies`);
  };

  const groupedMovies = movieGroupingService.groupMoviesBySeries(onePunchManMovies);

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">One Punch Man Series Test</h1>
          
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setShowGrouped(!showGrouped)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showGrouped 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {showGrouped ? 'Nhóm theo series' : 'Hiển thị tất cả'}
            </button>
            
            <button
              onClick={testSeriesKey}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Test Series Key (Console)
            </button>
          </div>
          
          <div className="text-gray-400 text-sm mb-6">
            <p><strong>Tổng phim One Punch Man:</strong> {onePunchManMovies.length}</p>
            <p><strong>Sau khi nhóm:</strong> {groupedMovies.length}</p>
            <p><strong>Giảm:</strong> {onePunchManMovies.length - groupedMovies.length} phim</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Dữ Liệu Test:</h3>
            <div className="space-y-2 text-sm text-gray-300">
              {onePunchManMovies.map((movie, index) => (
                <div key={movie._id} className="flex items-center space-x-4">
                  <span className="w-8 text-blue-400">{index + 1}.</span>
                  <span className="flex-1">{movie.name}</span>
                  <span className="text-yellow-400">Part: {movieGroupingService.extractPartNumber(movie.name, movie.origin_name)}</span>
                  <span className="text-green-400">Year: {movie.year}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">🎯 Kết Quả Mong Đợi:</h4>
            <ul className="text-blue-300 space-y-1 text-sm">
              <li>• <strong>Tất cả 4 phim</strong> One Punch Man sẽ được nhóm thành <strong>1 phim duy nhất</strong></li>
              <li>• Phim đại diện sẽ là <strong>Phần 3</strong> (mới nhất - 2025)</li>
              <li>• Badge sẽ hiển thị <strong>"4 Phần"</strong></li>
              <li>• Trong chi tiết sẽ thấy tất cả 4 phần: Phần 1, 2, 3, và OVA</li>
            </ul>
          </div>
        </div>
        
        <MovieGrid
          movies={showGrouped ? groupedMovies : onePunchManMovies}
          title={showGrouped ? "One Punch Man - Nhóm theo series" : "One Punch Man - Tất cả phim"}
          groupBySeries={showGrouped}
        />
      </div>
    </div>
  );
};

export default OnePunchManTest;

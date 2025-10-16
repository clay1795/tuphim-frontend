import { useState, useEffect } from 'react';
import movieApi from '../services/movieApi';

const AdvancedMovieFilter = ({ onFilterChange, onSearch }) => {
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    typeList: 'phim-moi-cap-nhat',
    sortField: 'modified_time',
    sortType: 'desc',
    sortLang: '',
    category: '',
    country: '',
    year: '',
    limit: 20
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [categoriesData, countriesData] = await Promise.all([
        movieApi.getCategories(),
        movieApi.getCountries()
      ]);
      
      setCategories(categoriesData.items || []);
      setCountries(countriesData.items || []);
      setYears(movieApi.utils.getAvailableYears());
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = (keyword) => {
    onSearch(keyword, filters);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-white text-lg font-semibold mb-4">Bộ lọc nâng cao</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Type List */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Loại phim
          </label>
          <select
            value={filters.typeList}
            onChange={(e) => handleFilterChange('typeList', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
          >
            <option value="phim-moi-cap-nhat">Phim mới cập nhật</option>
            <option value="phim-bo">Phim bộ</option>
            <option value="phim-le">Phim lẻ</option>
            <option value="tv-shows">TV Shows</option>
            <option value="hoat-hinh">Hoạt hình</option>
            <option value="phim-vietsub">Phim Vietsub</option>
            <option value="phim-thuyet-minh">Phim thuyết minh</option>
            <option value="phim-long-tieng">Phim lồng tiếng</option>
          </select>
        </div>

        {/* Sort Field */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Sắp xếp theo
          </label>
          <select
            value={filters.sortField}
            onChange={(e) => handleFilterChange('sortField', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
          >
            <option value="modified_time">Thời gian cập nhật</option>
            <option value="id">ID</option>
            <option value="year">Năm phát hành</option>
            <option value="last_episode_time">Tập mới nhất</option>
          </select>
        </div>

        {/* Sort Type */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Thứ tự
          </label>
          <select
            value={filters.sortType}
            onChange={(e) => handleFilterChange('sortType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>

        {/* Sort Lang */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Ngôn ngữ
          </label>
          <select
            value={filters.sortLang}
            onChange={(e) => handleFilterChange('sortLang', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
          >
            <option value="">Tất cả</option>
            <option value="viesub">Vietsub</option>
            <option value="thuyet-minh">Thuyết minh</option>
            <option value="long-tieng">Lồng tiếng</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Thể loại
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
          >
            <option value="">Tất cả</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Quốc gia
          </label>
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
          >
            <option value="">Tất cả</option>
            {countries.map((country) => (
              <option key={country.slug} value={country.slug}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Năm
          </label>
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
          >
            <option value="">Tất cả</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Limit */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Số lượng
          </label>
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={40}>40</option>
            <option value={50}>50</option>
            <option value={64}>64</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => handleSearch('')}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Áp dụng bộ lọc
        </button>
        <button
          onClick={() => {
            const resetFilters = {
              typeList: 'phim-moi-cap-nhat',
              sortField: 'modified_time',
              sortType: 'desc',
              sortLang: '',
              category: '',
              country: '',
              year: '',
              limit: 20
            };
            setFilters(resetFilters);
            onFilterChange(resetFilters);
          }}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default AdvancedMovieFilter;


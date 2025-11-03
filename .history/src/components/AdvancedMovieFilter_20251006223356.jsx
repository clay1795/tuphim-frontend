import React, { useState, useEffect } from 'react';

const AdvancedMovieFilter = ({ onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    // Simulate fetching filter options from an API
    const fetchFilterOptions = async () => {
      // In a real app, you'd fetch these from your API
      setCategories(['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Animation', 'Romance']);
      setCountries(['USA', 'Vietnam', 'Korea', 'China', 'Japan', 'France', 'UK']);
      setYears(['2023', '2022', '2021', '2020', '2019', 'Older']);
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    onFilterChange({
      category: selectedCategory,
      country: selectedCountry,
      year: selectedYear,
    });
  }, [selectedCategory, selectedCountry, selectedYear, onFilterChange]);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg mb-6">
      <h3 className="text-xl font-bold text-white mb-4">Bộ Lọc Nâng Cao</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="category" className="block text-gray-300 text-sm font-medium mb-2">Thể Loại</label>
          <select
            id="category"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tất cả</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="country" className="block text-gray-300 text-sm font-medium mb-2">Quốc Gia</label>
          <select
            id="country"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="">Tất cả</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year" className="block text-gray-300 text-sm font-medium mb-2">Năm Phát Hành</label>
          <select
            id="year"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Tất cả</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMovieFilter;

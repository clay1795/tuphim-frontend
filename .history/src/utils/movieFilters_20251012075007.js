// Utility functions để lọc phim theo chủ đề
export const filterMoviesByTheme = (movies, theme) => {
  if (!movies || movies.length === 0) return [];
  
  switch (theme) {
    case 'chinese':
      return movies.filter(movie => {
        const name = movie.name?.toLowerCase() || '';
        const country = movie.country?.map(c => c.name?.toLowerCase()).join(' ') || '';
        const description = movie.content?.toLowerCase() || '';
        
        return (
          name.includes('trung quốc') ||
          name.includes('china') ||
          name.includes('chinese') ||
          country.includes('trung quốc') ||
          country.includes('china') ||
          country.includes('chinese') ||
          description.includes('trung quốc') ||
          description.includes('china')
        );
      });
      
    case 'korean':
      return movies.filter(movie => {
        const name = movie.name?.toLowerCase() || '';
        const country = movie.country?.map(c => c.name?.toLowerCase()).join(' ') || '';
        const description = movie.content?.toLowerCase() || '';
        
        return (
          name.includes('hàn quốc') ||
          name.includes('korea') ||
          name.includes('korean') ||
          country.includes('hàn quốc') ||
          country.includes('korea') ||
          country.includes('korean') ||
          description.includes('hàn quốc') ||
          description.includes('korea')
        );
      });
      
    case 'japanese':
      return movies.filter(movie => {
        const name = movie.name?.toLowerCase() || '';
        const country = movie.country?.map(c => c.name?.toLowerCase()).join(' ') || '';
        const description = movie.content?.toLowerCase() || '';
        
        return (
          name.includes('nhật bản') ||
          name.includes('japan') ||
          name.includes('japanese') ||
          country.includes('nhật bản') ||
          country.includes('japan') ||
          country.includes('japanese') ||
          description.includes('nhật bản') ||
          description.includes('japan')
        );
      });
      
    case 'american':
      return movies.filter(movie => {
        const name = movie.name?.toLowerCase() || '';
        const country = movie.country?.map(c => c.name?.toLowerCase()).join(' ') || '';
        const description = movie.content?.toLowerCase() || '';
        
        return (
          name.includes('mỹ') ||
          name.includes('america') ||
          name.includes('american') ||
          name.includes('us') ||
          name.includes('usa') ||
          country.includes('mỹ') ||
          country.includes('america') ||
          country.includes('american') ||
          country.includes('us') ||
          country.includes('usa') ||
          description.includes('mỹ') ||
          description.includes('america')
        );
      });
      
    case 'disney':
      return movies.filter(movie => {
        const name = movie.name?.toLowerCase() || '';
        const description = movie.content?.toLowerCase() || '';
        const category = movie.category?.map(c => c.name?.toLowerCase()).join(' ') || '';
        
        return (
          name.includes('disney') ||
          name.includes('mickey') ||
          name.includes('frozen') ||
          name.includes('toy story') ||
          name.includes('finding nemo') ||
          name.includes('lion king') ||
          name.includes('aladdin') ||
          name.includes('beauty and the beast') ||
          name.includes('cinderella') ||
          name.includes('snow white') ||
          name.includes('moana') ||
          name.includes('encanto') ||
          name.includes('tangled') ||
          name.includes('wreck-it ralph') ||
          name.includes('big hero 6') ||
          name.includes('zootopia') ||
          name.includes('inside out') ||
          name.includes('coco') ||
          name.includes('soul') ||
          name.includes('luca') ||
          name.includes('turning red') ||
          name.includes('lightyear') ||
          name.includes('elemental') ||
          name.includes('wish') ||
          description.includes('disney') ||
          description.includes('pixar') ||
          category.includes('hoạt hình') ||
          category.includes('animation') ||
          category.includes('family') ||
          category.includes('gia đình') ||
          category.includes('children') ||
          category.includes('thiếu nhi')
        );
      });
      
    case 'anime':
      return movies.filter(movie => {
        const name = movie.name?.toLowerCase() || '';
        const description = movie.content?.toLowerCase() || '';
        const category = movie.category?.map(c => c.name?.toLowerCase()).join(' ') || '';
        
        return (
          name.includes('anime') ||
          name.includes('manga') ||
          name.includes('naruto') ||
          name.includes('one piece') ||
          name.includes('dragon ball') ||
          name.includes('attack on titan') ||
          name.includes('demon slayer') ||
          name.includes('my hero academia') ||
          name.includes('jujutsu kaisen') ||
          name.includes('spy x family') ||
          name.includes('chainsaw man') ||
          name.includes('tokyo ghoul') ||
          name.includes('death note') ||
          name.includes('fullmetal alchemist') ||
          name.includes('bleach') ||
          name.includes('fairy tail') ||
          name.includes('hunter x hunter') ||
          name.includes('one punch man') ||
          name.includes('mob psycho') ||
          name.includes('jojo') ||
          name.includes('studio ghibli') ||
          name.includes('ghibli') ||
          name.includes('spirited away') ||
          name.includes('totoro') ||
          name.includes('howl') ||
          name.includes('princess mononoke') ||
          name.includes('castle in the sky') ||
          name.includes('kiki') ||
          name.includes('ponyo') ||
          name.includes('arrietty') ||
          name.includes('the wind rises') ||
          name.includes('your name') ||
          name.includes('weathering with you') ||
          name.includes('suzume') ||
          description.includes('anime') ||
          description.includes('manga') ||
          description.includes('japanese animation') ||
          description.includes('hoạt hình nhật') ||
          category.includes('anime') ||
          category.includes('hoạt hình') ||
          category.includes('animation') ||
          category.includes('japanese')
        );
      });
      
    case 'cinema':
      return movies.filter(movie => {
        const name = movie.name?.toLowerCase() || '';
        const description = movie.content?.toLowerCase() || '';
        const quality = movie.quality?.toLowerCase() || '';
        
        return (
          name.includes('chiếu rạp') ||
          name.includes('cinema') ||
          name.includes('theater') ||
          description.includes('chiếu rạp') ||
          description.includes('cinema') ||
          quality.includes('4k') ||
          quality.includes('fhd') ||
          quality.includes('hd')
        );
      });
      
    case 'romance':
      return movies.filter(movie => {
        const name = movie.name?.toLowerCase() || '';
        const description = movie.content?.toLowerCase() || '';
        const category = movie.category?.map(c => c.name?.toLowerCase()).join(' ') || '';
        
        return (
          name.includes('tình cảm') ||
          name.includes('romance') ||
          name.includes('love') ||
          name.includes('yêu') ||
          name.includes('lãng mạn') ||
          name.includes('tình yêu') ||
          name.includes('cặp đôi') ||
          name.includes('hẹn hò') ||
          name.includes('dating') ||
          name.includes('relationship') ||
          name.includes('couple') ||
          name.includes('wedding') ||
          name.includes('marriage') ||
          name.includes('cưới') ||
          name.includes('kết hôn') ||
          description.includes('tình cảm') ||
          description.includes('romance') ||
          description.includes('love') ||
          description.includes('tình yêu') ||
          description.includes('lãng mạn') ||
          description.includes('cặp đôi') ||
          description.includes('hẹn hò') ||
          category.includes('tình cảm') ||
          category.includes('romance') ||
          category.includes('lãng mạn') ||
          category.includes('tình yêu') ||
          category.includes('drama') ||
          category.includes('melodrama')
        );
      });
      
    case 'detective':
      return movies.filter(movie => {
        const name = movie.name?.toLowerCase() || '';
        const description = movie.content?.toLowerCase() || '';
        const category = movie.category?.map(c => c.name?.toLowerCase()).join(' ') || '';
        
        return (
          name.includes('trinh thám') ||
          name.includes('detective') ||
          name.includes('mystery') ||
          name.includes('phá án') ||
          name.includes('thám tử') ||
          name.includes('điều tra') ||
          name.includes('tội phạm') ||
          name.includes('criminal') ||
          name.includes('police') ||
          name.includes('cảnh sát') ||
          name.includes('sherlock') ||
          name.includes('conan') ||
          name.includes('death note') ||
          name.includes('psycho') ||
          name.includes('thriller') ||
          name.includes('suspense') ||
          name.includes('hồi hộp') ||
          name.includes('bí ẩn') ||
          description.includes('trinh thám') ||
          description.includes('detective') ||
          description.includes('mystery') ||
          description.includes('phá án') ||
          description.includes('thám tử') ||
          description.includes('điều tra') ||
          description.includes('tội phạm') ||
          description.includes('criminal') ||
          description.includes('cảnh sát') ||
          description.includes('bí ẩn') ||
          category.includes('trinh thám') ||
          category.includes('mystery') ||
          category.includes('criminal') ||
          category.includes('thriller') ||
          category.includes('suspense') ||
          category.includes('action')
        );
      });
      
    case 'weekend':
      return movies.filter(movie => {
        const name = movie.name?.toLowerCase() || '';
        const description = movie.content?.toLowerCase() || '';
        const category = movie.category?.map(c => c.name?.toLowerCase()).join(' ') || '';
        
        return (
          name.includes('cuối tuần') ||
          name.includes('weekend') ||
          name.includes('thứ 7') ||
          name.includes('chủ nhật') ||
          description.includes('cuối tuần') ||
          description.includes('weekend') ||
          category.includes('gia đình') ||
          category.includes('family') ||
          category.includes('hài hước') ||
          category.includes('comedy')
        );
      });
      
    default:
      return movies;
  }
};

// Lọc phim theo chất lượng cao
export const filterHighQualityMovies = (movies) => {
  return movies.filter(movie => {
    const quality = movie.quality?.toLowerCase() || '';
    const rating = movie.tmdb?.vote_average || 0;
    
    return (
      quality.includes('4k') ||
      quality.includes('fhd') ||
      quality.includes('hd') ||
      rating >= 7.0
    );
  });
};

// Lọc phim mới nhất
export const filterNewMovies = (movies) => {
  const currentYear = new Date().getFullYear();
  return movies.filter(movie => {
    const year = parseInt(movie.year) || 0;
    return year >= currentYear - 2; // Phim trong 2 năm gần đây
  });
};

// Hàm lọc phim theo bộ lọc chi tiết
export const filterMoviesByDetailedCriteria = (movies, criteria) => {
  if (!movies || movies.length === 0) return [];
  
  console.log(`\n--- FILTERING MOVIES ---`);
  console.log('Filter criteria:', criteria);
  console.log('Total movies to filter:', movies.length);
  
  let filtered = [...movies];
  
  // Lọc theo quốc gia
  if (criteria.countries && criteria.countries.length > 0 && !criteria.countries.includes('Tất cả')) {
    console.log(`Filtering by countries: ${criteria.countries.join(', ')}`);
    const beforeCount = filtered.length;
    
    filtered = filtered.filter(movie => {
      const movieCountries = movie.country?.map(c => c.name?.toLowerCase()) || [];
      return criteria.countries.some(country => {
        const countryLower = country.toLowerCase();
        return movieCountries.some(movieCountry => {
          // Tìm kiếm linh hoạt hơn với nhiều biến thể
          return movieCountry.includes(countryLower) ||
                 countryLower.includes(movieCountry) ||
                 // Thêm một số từ khóa phổ biến
                 (countryLower === 'mỹ' && (movieCountry.includes('usa') || movieCountry.includes('america') || movieCountry.includes('united states'))) ||
                 (countryLower === 'anh' && (movieCountry.includes('uk') || movieCountry.includes('england') || movieCountry.includes('britain') || movieCountry.includes('united kingdom'))) ||
                 (countryLower === 'thái lan' && (movieCountry.includes('thailand') || movieCountry.includes('thai') || movieCountry.includes('thái'))) ||
                 (countryLower === 'trung quốc' && (movieCountry.includes('china') || movieCountry.includes('chinese') || movieCountry.includes('trung quốc'))) ||
                 (countryLower === 'nhật bản' && (movieCountry.includes('japan') || movieCountry.includes('japanese') || movieCountry.includes('nhật'))) ||
                 // Thêm các biến thể khác
                 (countryLower === 'hàn quốc' && (movieCountry.includes('korea') || movieCountry.includes('korean') || movieCountry.includes('hàn'))) ||
                 (countryLower === 'đài loan' && (movieCountry.includes('taiwan') || movieCountry.includes('taiwanese'))) ||
                 (countryLower === 'hồng kông' && (movieCountry.includes('hong kong') || movieCountry.includes('hongkong')));
        });
      });
    });
    
    console.log(`After country filter: ${filtered.length} movies (was ${beforeCount})`);
    if (filtered.length === 0) {
      console.log('No movies found for country filter. Sample movie countries:', movies.slice(0, 3).map(m => m.country?.map(c => c.name) || 'No country'));
    }
  }
  
  // Lọc theo loại phim
  if (criteria.movieType && criteria.movieType !== 'Tất cả') {
    console.log(`Filtering by movie type: ${criteria.movieType}`);
    const beforeCount = filtered.length;
    
    filtered = filtered.filter(movie => {
      if (criteria.movieType === 'Phim lẻ') {
        const hasSingleEpisode = !movie.episode_total || parseInt(movie.episode_total) === 1;
        const hasSingleCurrent = !movie.episode_current || parseInt(movie.episode_current) === 1;
        return hasSingleEpisode && hasSingleCurrent;
      } else if (criteria.movieType === 'Phim bộ') {
        const hasMultipleEpisodes = movie.episode_total && parseInt(movie.episode_total) > 1;
        const hasMultipleCurrent = movie.episode_current && parseInt(movie.episode_current) > 1;
        return hasMultipleEpisodes || hasMultipleCurrent;
      }
      return true;
    });
    
    console.log(`After movie type filter: ${filtered.length} movies (was ${beforeCount})`);
    if (filtered.length === 0) {
      console.log('No movies found for movie type filter. Sample movie episodes:', movies.slice(0, 3).map(m => `episodes: ${m.episode_current}/${m.episode_total}`));
    }
  }
  
  // Lọc theo thể loại
  if (criteria.genres && criteria.genres.length > 0 && !criteria.genres.includes('Tất cả')) {
    console.log(`Filtering by genres: ${criteria.genres.join(', ')}`);
    const beforeCount = filtered.length;
    
    filtered = filtered.filter(movie => {
      const movieGenres = movie.category?.map(c => c.name?.toLowerCase()) || [];
      return criteria.genres.some(genre => {
        const genreLower = genre.toLowerCase();
        return movieGenres.some(movieGenre => {
          // Tìm kiếm linh hoạt hơn với nhiều biến thể
          return movieGenre.includes(genreLower) ||
                 genreLower.includes(movieGenre) ||
                 // Thêm một số từ khóa phổ biến
                 (genreLower === 'hoạt hình' && (movieGenre.includes('animation') || movieGenre.includes('anime') || movieGenre.includes('cartoon') || movieGenre.includes('hoạt hình'))) ||
                 (genreLower === 'kinh dị' && (movieGenre.includes('horror') || movieGenre.includes('thriller') || movieGenre.includes('scary') || movieGenre.includes('kinh dị'))) ||
                 (genreLower === 'hành động' && (movieGenre.includes('action') || movieGenre.includes('hành động'))) ||
                 (genreLower === 'tình cảm' && (movieGenre.includes('romance') || movieGenre.includes('love') || movieGenre.includes('tình cảm'))) ||
                 (genreLower === 'hài hước' && (movieGenre.includes('comedy') || movieGenre.includes('funny') || movieGenre.includes('hài'))) ||
                 (genreLower === 'phiêu lưu' && (movieGenre.includes('adventure') || movieGenre.includes('phiêu lưu'))) ||
                 (genreLower === 'khoa học viễn tưởng' && (movieGenre.includes('sci-fi') || movieGenre.includes('science fiction') || movieGenre.includes('khoa học'))) ||
                 (genreLower === 'gia đình' && (movieGenre.includes('family') || movieGenre.includes('gia đình'))) ||
                 (genreLower === 'tài liệu' && (movieGenre.includes('documentary') || movieGenre.includes('tài liệu')));
        });
      });
    });
    
    console.log(`After genre filter: ${filtered.length} movies (was ${beforeCount})`);
    if (filtered.length === 0) {
      console.log('No movies found for genre filter. Sample movie genres:', movies.slice(0, 3).map(m => m.category?.map(c => c.name) || 'No genre'));
    }
  }
  
  // Lọc theo năm sản xuất
  if (criteria.years && criteria.years.length > 0 && !criteria.years.includes('Tất cả')) {
    console.log(`Filtering by years: ${criteria.years.join(', ')}`);
    const beforeCount = filtered.length;
    
    filtered = filtered.filter(movie => {
      const movieYear = parseInt(movie.year);
      return criteria.years.some(year => {
        const filterYear = parseInt(year);
        // Cho phép phim có năm gần với năm lọc (trong khoảng ±1 năm)
        return movieYear === filterYear || 
               (movieYear >= filterYear - 1 && movieYear <= filterYear + 1);
      });
    });
    
    console.log(`After year filter: ${filtered.length} movies (was ${beforeCount})`);
    if (filtered.length === 0) {
      console.log('No movies found for year filter. Sample movie years:', movies.slice(0, 3).map(m => m.year || 'No year'));
    }
  }
  
  // Sắp xếp
  if (criteria.sortBy === 'mới cập nhật') {
    filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    });
  }
  
  console.log(`Final filtered result: ${filtered.length} movies`);
  if (filtered.length > 0) {
    console.log('Sample filtered movies:', filtered.slice(0, 3).map(m => `${m.name} (${m.year})`));
  }
  
  return filtered;
};

// Hàm gọi API với filter parameters cho từng section
export const fetchMoviesForSection = async (filterCriteria) => {
  try {
    console.log('Fetching movies for section with criteria:', filterCriteria);
    
    // Xây dựng query parameters
    const params = new URLSearchParams();
    
    // Countries
    if (filterCriteria.countries && !filterCriteria.countries.includes('Tất cả')) {
      params.append('countries', filterCriteria.countries.join(','));
    }
    
    // Movie type
    if (filterCriteria.movieType && filterCriteria.movieType !== 'Tất cả') {
      if (filterCriteria.movieType === 'Phim lẻ') {
        params.append('movieType', 'single');
      } else if (filterCriteria.movieType === 'Phim bộ') {
        params.append('movieType', 'series');
      }
    }
    
    // Genres
    if (filterCriteria.genres && !filterCriteria.genres.includes('Tất cả')) {
      params.append('genres', filterCriteria.genres.join(','));
    }
    
    // Years
    if (filterCriteria.years && !filterCriteria.years.includes('Tất cả')) {
      params.append('years', filterCriteria.years.join(','));
    }
    
    // Sort
    if (filterCriteria.sortBy) {
      params.append('sortBy', 'newest');
    }
    
    // Limit
    params.append('limit', '12');
    
    const queryString = params.toString();
    console.log('API query string:', queryString);
    
    const response = await fetch(`http://localhost:3001/api/movies/filter?${queryString}`);
    const data = await response.json();
    
    console.log('API response:', data);
    
    if (data.success && data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.warn('Unexpected API response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching movies for section:', error);
    return [];
  }
};

// Hàm tạo các section mới với bộ lọc cụ thể (async)
export const createDetailedMovieSections = async () => {
  console.log('=== CREATING MOVIE SECTIONS WITH API FILTERING ===');
  
  // Sử dụng Map thay vì Set để track section và phim
  const usedMovieIds = new Set();
  const sections = [];
  
  // Định nghĩa các section với bộ lọc cụ thể
  const sectionConfigs = [
    {
      key: 'phim-dien-anh-moi-coong',
      title: 'Phim Điện Ảnh Mới Coóng',
      description: 'Những bộ phim điện ảnh mới nhất, chất lượng cao',
      filterCriteria: {
        countries: ['Tất cả'],
        movieType: 'Phim lẻ',
        genres: ['Tất cả'],
        years: ['2025', '2024'],
        sortBy: 'mới cập nhật'
      },
      searchParams: '?countries=all&movieType=movie&genres=all&years=2025,2024&sortBy=newest',
      component: 'MovieSection'
    },
    {
      key: 'phim-thai-new',
      title: 'Phim Thái New: Không Drama Đời Không Nể',
      description: 'Tuyển tập phim Thái Lan mới nhất',
      filterCriteria: {
        countries: ['Thái Lan'],
        movieType: 'Phim bộ',
        genres: ['Tất cả'],
        years: ['Tất cả'],
        sortBy: 'mới cập nhật'
      },
      searchParams: '?countries=thailand&movieType=series&genres=all&years=all&sortBy=newest',
      component: 'MovieSectionCarousel'
    },
    {
      key: 'kho-tang-anime-moi-nhat',
      title: 'Kho Tàng Anime Mới Nhất',
      description: 'Tuyển tập anime mới nhất, đa dạng thể loại',
      filterCriteria: {
        countries: ['Nhật Bản'],
        movieType: 'Tất cả',
        genres: ['Hoạt hình'],
        years: ['Tất cả'],
        sortBy: 'mới cập nhật'
      },
      searchParams: '?countries=japan&movieType=all&genres=animation&years=all&sortBy=newest',
      component: 'MovieSectionCarousel'
    },
    {
      key: 'phim-nay-xem-dem-thoi',
      title: 'Phim Này Xem Đêm Thôi',
      description: 'Những bộ phim kinh dị hấp dẫn',
      filterCriteria: {
        countries: ['Tất cả'],
        movieType: 'Phim lẻ',
        genres: ['Kinh dị'],
        years: ['Tất cả'],
        sortBy: 'mới cập nhật'
      },
      searchParams: '?countries=all&movieType=movie&genres=horror&years=all&sortBy=newest',
      component: 'MovieSection'
    },
    {
      key: 'phim-dien-anh-hang-tuyen',
      title: 'Phim Điện Ảnh Hàng Tuyển',
      description: 'Những bộ phim điện ảnh chất lượng cao từ các nước lớn',
      filterCriteria: {
        countries: ['Anh', 'Mỹ', 'Thái Lan', 'Trung Quốc'],
        movieType: 'Tất cả',
        genres: ['Tất cả'],
        years: ['2025', '2024', '2023', '2022', '2021'],
        sortBy: 'mới cập nhật'
      },
      searchParams: '?countries=uk,usa,thailand,china&movieType=all&genres=all&years=2025,2024,2023,2022,2021&sortBy=newest',
      component: 'MovieSection'
    }
  ];
  
  // Tính toán số phim tối đa mỗi section dựa trên tổng số phim
  // Cho phép một số phim xuất hiện trong nhiều section để đảm bảo mỗi section đều có phim
  const maxMoviesPerSection = Math.floor(movies.length / sectionConfigs.length);
  const targetMoviesPerSection = Math.min(12, Math.max(4, maxMoviesPerSection)); // Ít nhất 4 phim mỗi section
  
  console.log(`\n=== DISTRIBUTION STRATEGY ===`);
  console.log(`Total movies: ${movies.length}`);
  console.log(`Number of sections: ${sectionConfigs.length}`);
  console.log(`Max movies per section: ${maxMoviesPerSection}`);
  console.log(`Target movies per section: ${targetMoviesPerSection}`);
  
  // Phân phối phim cho từng section
  sectionConfigs.forEach((config, index) => {
    let filteredMovies = [];
    
    console.log(`\n--- Processing Section ${index + 1}: ${config.title} ---`);
    console.log('Filter criteria:', config.filterCriteria);
    
    // Bước 1: Lấy phim phù hợp với bộ lọc chính (tối đa 6 phim để dành cho section khác)
    const primaryMovies = filterMoviesByDetailedCriteria(movies, config.filterCriteria)
      .filter(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        return !usedMovieIds.has(movieId);
      });
    
    console.log(`Primary movies found: ${primaryMovies.length}`);
    if (primaryMovies.length > 0) {
      console.log('Sample primary movies:', primaryMovies.slice(0, 3).map(m => `${m.name} (${m.year})`));
    }
    
    // Lấy tối đa 6 phim từ bộ lọc chính để dành phim cho section khác
    const primarySelected = primaryMovies.slice(0, Math.min(6, targetMoviesPerSection));
    primarySelected.forEach(movie => {
      const movieId = movie._id || movie.id || movie.slug || movie.name;
      usedMovieIds.add(movieId);
    });
    filteredMovies = [...filteredMovies, ...primarySelected];
    
    // Bước 2: Nếu chưa đủ target, thử bộ lọc linh hoạt hơn
    if (filteredMovies.length < targetMoviesPerSection) {
      const fallbackCriteria = {
        ...config.filterCriteria,
        years: config.filterCriteria.years.includes('Tất cả') ? ['Tất cả'] : [...config.filterCriteria.years, 'Tất cả']
      };
      
      const fallbackMovies = filterMoviesByDetailedCriteria(movies, fallbackCriteria)
        .filter(movie => {
          const movieId = movie._id || movie.id || movie.slug || movie.name;
          return !usedMovieIds.has(movieId);
        })
        .slice(0, targetMoviesPerSection - filteredMovies.length);
      
      console.log(`Fallback movies found: ${fallbackMovies.length}`);
      if (fallbackMovies.length > 0) {
        console.log('Sample fallback movies:', fallbackMovies.slice(0, 3).map(m => `${m.name} (${m.year})`));
      }
      
      fallbackMovies.forEach(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        usedMovieIds.add(movieId);
      });
      filteredMovies = [...filteredMovies, ...fallbackMovies];
    }
    
    // Bước 3: Nếu vẫn chưa đủ target, lấy phim ngẫu nhiên từ còn lại
    if (filteredMovies.length < targetMoviesPerSection) {
      const remainingMovies = movies.filter(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        return !usedMovieIds.has(movieId);
      });
      
      const randomMovies = remainingMovies.slice(0, targetMoviesPerSection - filteredMovies.length);
      
      console.log(`Random movies found: ${randomMovies.length}`);
      if (randomMovies.length > 0) {
        console.log('Sample random movies:', randomMovies.slice(0, 3).map(m => `${m.name} (${m.year})`));
      }
      
      randomMovies.forEach(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        usedMovieIds.add(movieId);
      });
      filteredMovies = [...filteredMovies, ...randomMovies];
    }
    
    // Bước 4: Nếu vẫn chưa đủ target và đây là section quan trọng, cho phép trùng lặp
    if (filteredMovies.length < targetMoviesPerSection && index < 3) {
      const duplicateMovies = movies.slice(0, targetMoviesPerSection - filteredMovies.length);
      
      console.log(`Duplicate movies found: ${duplicateMovies.length}`);
      if (duplicateMovies.length > 0) {
        console.log('Sample duplicate movies:', duplicateMovies.slice(0, 3).map(m => `${m.name} (${m.year})`));
      }
      
      filteredMovies = [...filteredMovies, ...duplicateMovies];
    }
    
    // Giới hạn tối đa targetMoviesPerSection phim mỗi section
    filteredMovies = filteredMovies.slice(0, targetMoviesPerSection);
    
    // Luôn thêm section
    sections.push({
      ...config,
      movies: filteredMovies
    });
    
    // Debug logging
    console.log(`Section "${config.title}": ${filteredMovies.length} movies (primary: ${primarySelected.length})`);
    if (filteredMovies.length > 0) {
      console.log(`  - First movie: ${filteredMovies[0].name} (${filteredMovies[0].year})`);
    }
  });
  
  console.log(`Total sections created: ${sections.length}`);
  console.log(`Total unique movies used: ${usedMovieIds.size}`);
  return sections;
};

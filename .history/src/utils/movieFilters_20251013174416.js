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

// Cache để tối ưu performance khi xử lý dataset lớn
const movieCache = new Map();
const countryMapping = {
  'mỹ': ['usa', 'america', 'united states', 'us', 'âm mỹ', 'âu mỹ'],
  'anh': ['uk', 'england', 'britain', 'united kingdom', 'anh'],
  'thái lan': ['thailand', 'thai', 'thái lan'],
  'trung quốc': ['china', 'chinese', 'trung quốc', 'trung quốc'],
  'nhật bản': ['japan', 'japanese', 'nhật bản', 'nhat ban'],
  'hàn quốc': ['korea', 'korean', 'hàn quốc', 'han quoc'],
  'đài loan': ['taiwan', 'taiwanese'],
  'hồng kông': ['hong kong', 'hongkong', 'hồng kông', 'hong konng']
};

const genreMapping = {
  'hoạt hình': ['animation', 'anime', 'cartoon', 'hoạt hình', 'hoathinh'],
  'kinh dị': ['horror', 'thriller', 'scary', 'kinh dị', 'kinh di'],
  'hành động': ['action', 'hành động', 'hanh dong'],
  'tình cảm': ['romance', 'love', 'tình cảm', 'tinh cam'],
  'hài hước': ['comedy', 'funny', 'hài', 'hai huoc'],
  'phiêu lưu': ['adventure', 'phiêu lưu', 'phieu luu'],
  'khoa học viễn tưởng': ['sci-fi', 'science fiction', 'khoa học', 'vien tuong'],
  'gia đình': ['family', 'gia đình', 'gia dinh'],
  'tài liệu': ['documentary', 'tài liệu', 'tai lieu']
};

// Hàm lọc phim theo bộ lọc chi tiết (tối ưu cho dataset lớn)
export const filterMoviesByDetailedCriteria = (movies, criteria) => {
  if (!movies || movies.length === 0) return [];
  
  // Tạo cache key
  const cacheKey = `${criteria.countries?.join(',')}-${criteria.movieType}-${criteria.genres?.join(',')}-${criteria.years?.join(',')}-${criteria.sortBy}`;
  
  // Kiểm tra cache
  if (movieCache.has(cacheKey)) {
    console.log(`Using cached result for: ${cacheKey}`);
    return movieCache.get(cacheKey);
  }
  
  console.log(`\n--- FILTERING MOVIES (${movies.length} total) ---`);
  console.log('Filter criteria:', criteria);
  
  let filtered = movies;
  const startTime = performance.now();
  
  // Lọc theo quốc gia (tối ưu với Set)
  if (criteria.countries && criteria.countries.length > 0 && !criteria.countries.includes('Tất cả')) {
    console.log(`Filtering by countries: ${criteria.countries.join(', ')}`);
    const beforeCount = filtered.length;
    
    // Tạo Set các từ khóa quốc gia để tìm kiếm nhanh
    const countryKeywords = new Set();
    criteria.countries.forEach(country => {
      const countryLower = country.toLowerCase();
      countryKeywords.add(countryLower);
      
      // Thêm các biến thể từ mapping
      if (countryMapping[countryLower]) {
        countryMapping[countryLower].forEach(variant => countryKeywords.add(variant));
      }
    });
    
    filtered = filtered.filter(movie => {
      if (!movie.country || !Array.isArray(movie.country)) return false;
      
      return movie.country.some(countryObj => {
        const movieCountry = countryObj.name?.toLowerCase() || '';
        return Array.from(countryKeywords).some(keyword => 
          movieCountry.includes(keyword) || keyword.includes(movieCountry)
        );
      });
    });
    
    console.log(`After country filter: ${filtered.length} movies (was ${beforeCount})`);
    if (filtered.length === 0) {
      console.log('No movies found for country filter');
      movieCache.set(cacheKey, []);
      return [];
    }
  }
  
  // Lọc theo loại phim (tối ưu)
  if (criteria.movieType && criteria.movieType !== 'Tất cả') {
    console.log(`Filtering by movie type: ${criteria.movieType}`);
    const beforeCount = filtered.length;
    
    filtered = filtered.filter(movie => {
      const episodeTotal = parseInt(movie.episode_total) || 0;
      const episodeCurrent = parseInt(movie.episode_current) || 0;
      
      if (criteria.movieType === 'Phim lẻ') {
        return episodeTotal <= 1 && episodeCurrent <= 1;
      } else if (criteria.movieType === 'Phim bộ') {
        return episodeTotal > 1 || episodeCurrent > 1;
      }
      return true;
    });
    
    console.log(`After movie type filter: ${filtered.length} movies (was ${beforeCount})`);
    if (filtered.length === 0) {
      console.log('No movies found for movie type filter');
      movieCache.set(cacheKey, []);
      return [];
    }
  }
  
  // Lọc theo thể loại (tối ưu với Set)
  if (criteria.genres && criteria.genres.length > 0 && !criteria.genres.includes('Tất cả')) {
    console.log(`Filtering by genres: ${criteria.genres.join(', ')}`);
    const beforeCount = filtered.length;
    
    // Tạo Set các từ khóa thể loại để tìm kiếm nhanh
    const genreKeywords = new Set();
    criteria.genres.forEach(genre => {
      const genreLower = genre.toLowerCase();
      genreKeywords.add(genreLower);
      
      // Thêm các biến thể từ mapping
      if (genreMapping[genreLower]) {
        genreMapping[genreLower].forEach(variant => genreKeywords.add(variant));
      }
    });
    
    filtered = filtered.filter(movie => {
      if (!movie.category || !Array.isArray(movie.category)) return false;
      
      return movie.category.some(categoryObj => {
        const movieGenre = categoryObj.name?.toLowerCase() || '';
        return Array.from(genreKeywords).some(keyword => 
          movieGenre.includes(keyword) || keyword.includes(movieGenre)
        );
      });
    });
    
    console.log(`After genre filter: ${filtered.length} movies (was ${beforeCount})`);
    if (filtered.length === 0) {
      console.log('No movies found for genre filter');
      movieCache.set(cacheKey, []);
      return [];
    }
  }
  
  // Lọc theo năm sản xuất (tối ưu với Set)
  if (criteria.years && criteria.years.length > 0 && !criteria.years.includes('Tất cả')) {
    console.log(`Filtering by years: ${criteria.years.join(', ')}`);
    const beforeCount = filtered.length;
    
    // Tạo Set các năm để tìm kiếm nhanh
    const yearSet = new Set();
    criteria.years.forEach(year => {
      const filterYear = parseInt(year);
      yearSet.add(filterYear);
      // Thêm năm ±1
      yearSet.add(filterYear - 1);
      yearSet.add(filterYear + 1);
    });
    
    filtered = filtered.filter(movie => {
      const movieYear = parseInt(movie.year);
      return yearSet.has(movieYear);
    });
    
    console.log(`After year filter: ${filtered.length} movies (was ${beforeCount})`);
    if (filtered.length === 0) {
      console.log('No movies found for year filter');
      movieCache.set(cacheKey, []);
      return [];
    }
  }
  
  // Sắp xếp (chỉ khi cần thiết)
  if (criteria.sortBy === 'mới cập nhật') {
    filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    });
  }
  
  const endTime = performance.now();
  console.log(`Filtering completed in ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`Final result: ${filtered.length} movies`);
  
  // Cache kết quả (giới hạn cache size)
  if (movieCache.size > 50) {
    const firstKey = movieCache.keys().next().value;
    movieCache.delete(firstKey);
  }
  movieCache.set(cacheKey, filtered);
  
  return filtered;
};

// Hàm gọi API để lấy tất cả phim, sau đó lọc ở frontend
export const fetchAllMovies = async () => {
  try {
    console.log('Fetching all movies from API (series-grouped)...');
    
    // Sử dụng MongoDB series-grouped API để lấy phim (chỉ hiện phần mới nhất của series)
    const mongoEndpoints = [
      '/api/mongo-movies/series-grouped?page=1&limit=1000',
      '/api/mongo-movies/series-grouped?page=2&limit=1000',
      '/api/mongo-movies/series-grouped?page=3&limit=1000'
    ];
    
    let allMovies = [];
    
    // Thử MongoDB series-grouped endpoint đầu tiên
    try {
      console.log(`Trying MongoDB series-grouped endpoint: ${mongoEndpoints[0]}`);
      const response = await fetch(mongoEndpoints[0]);
      
      if (response.ok) {
        const data = await response.json();
        console.log('MongoDB API response:', data);
        
        // Xử lý dữ liệu từ MongoDB API
        if (data.success && data.data && data.data.items && Array.isArray(data.data.items)) {
          allMovies = data.data.items;
          console.log(`Found ${allMovies.length} movies from MongoDB API`);
          
          // Kiểm tra tổng số phim có sẵn
          if (data.data.pagination && data.data.pagination.totalItems) {
            console.log(`Total movies available: ${data.data.pagination.totalItems}`);
          }
        }
      }
    } catch (error) {
      console.log(`Error with MongoDB endpoint:`, error.message);
    }
    
    // Nếu chưa có đủ phim, thử fetch thêm từ các MongoDB endpoints khác
    if (allMovies.length < 1000) {
      console.log('Fetching additional movies from other MongoDB endpoints...');
      
      const additionalEndpoints = [
        '/api/mongo-movies/search?keyword=&page=2&limit=1000&sort=modified_time&sortType=desc',
        '/api/mongo-movies/search?keyword=&page=3&limit=1000&sort=modified_time&sortType=desc'
      ];
      
      for (const endpoint of additionalEndpoints) {
        try {
          console.log(`Trying additional endpoint: ${endpoint}`);
          const response = await fetch(endpoint);
          
          if (response.ok) {
            const data = await response.json();
            
            let additionalMovies = [];
            if (data.success && data.data && data.data.items && Array.isArray(data.data.items)) {
              additionalMovies = data.data.items;
            }
            
            // Merge movies và loại bỏ duplicates
            const existingIds = new Set(allMovies.map(m => m._id || m.id));
            const newMovies = additionalMovies.filter(m => !existingIds.has(m._id || m.id));
            
            allMovies = [...allMovies, ...newMovies];
            console.log(`Added ${newMovies.length} new movies from ${endpoint} (Total: ${allMovies.length})`);
            
            if (allMovies.length >= 3000) {
              console.log(`Reached sufficient movies: ${allMovies.length}`);
              break;
            }
          }
        } catch (error) {
          console.log(`Error with additional endpoint ${endpoint}:`, error.message);
          continue;
        }
      }
    }
    
    console.log(`Final movie data: ${allMovies.length} movies`);
    
    // Log sample movie structure for debugging
    if (allMovies.length > 0) {
      console.log('Sample movie structure:', {
        name: allMovies[0].name,
        year: allMovies[0].year,
        country: allMovies[0].country,
        category: allMovies[0].category,
        type: allMovies[0].type,
        episode_total: allMovies[0].episode_total,
        episode_current: allMovies[0].episode_current
      });
    }
    
    return allMovies;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

// Hàm tạo các section mới với bộ lọc cụ thể (async)
export const createDetailedMovieSections = async () => {
  console.log('=== CREATING MOVIE SECTIONS WITH API DATA ===');
  
  // Lấy tất cả phim từ API
  const allMovies = await fetchAllMovies();
  
  if (!allMovies || allMovies.length === 0) {
    console.warn('No movies available from API');
    return [];
  }
  
  console.log('Total movies from API:', allMovies.length);
  console.log('Sample movie structure:', allMovies[0]);
  
  // Debug: Hiển thị tất cả quốc gia và thể loại có trong dữ liệu
  const allCountries = new Set();
  const allGenres = new Set();
  const allYears = new Set();
  const movieTypes = new Set();
  
  allMovies.forEach(movie => {
    if (movie.country && Array.isArray(movie.country)) {
      movie.country.forEach(c => {
        if (c && c.name) {
          allCountries.add(c.name.toLowerCase());
        }
      });
    }
    if (movie.category && Array.isArray(movie.category)) {
      movie.category.forEach(c => {
        if (c && c.name) {
          allGenres.add(c.name.toLowerCase());
        }
      });
    }
    if (movie.year) {
      allYears.add(parseInt(movie.year));
    }
    if (movie.type) {
      movieTypes.add(movie.type);
    }
  });
  
  console.log('=== AVAILABLE DATA ANALYSIS ===');
  console.log('Available countries (first 20):', Array.from(allCountries).slice(0, 20));
  console.log('Available genres (first 20):', Array.from(allGenres).slice(0, 20));
  console.log('Available years (sorted):', Array.from(allYears).sort());
  console.log('Available movie types:', Array.from(movieTypes));
  
  // Debug specific filter criteria
  console.log('\n=== FILTER CRITERIA ANALYSIS ===');
  console.log('Looking for countries: Anh, Mỹ, Thái Lan, Trung Quốc');
  console.log('Found Anh:', allCountries.has('anh'));
  console.log('Found Mỹ:', allCountries.has('mỹ') || allCountries.has('usa') || allCountries.has('america'));
  console.log('Found Thái Lan:', allCountries.has('thái lan') || allCountries.has('thailand'));
  console.log('Found Trung Quốc:', allCountries.has('trung quốc') || allCountries.has('china'));
  
  console.log('\nLooking for genres: hoạt hình, kinh dị');
  console.log('Found hoạt hình:', allGenres.has('hoạt hình') || allGenres.has('animation'));
  console.log('Found kinh dị:', allGenres.has('kinh dị') || allGenres.has('horror'));
  
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
  
  const usedMovieIds = new Set();
  const sections = [];
  
  // Tạo sections bằng cách lọc phim từ API data
  for (const config of sectionConfigs) {
    console.log(`\n--- Creating Section: ${config.title} ---`);
    console.log('Filter criteria:', config.filterCriteria);
    
    // Lọc phim theo criteria
    let filteredMovies = filterMoviesByDetailedCriteria(allMovies, config.filterCriteria)
      .filter(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        if (usedMovieIds.has(movieId)) {
          return false; // Bỏ qua phim đã được sử dụng
        }
        return true; // Cho phép phim này được sử dụng
      });
    
    // Lấy 12 phim đầu tiên và mark as used
    filteredMovies = filteredMovies.slice(0, 12);
    filteredMovies.forEach(movie => {
      const movieId = movie._id || movie.id || movie.slug || movie.name;
      usedMovieIds.add(movieId);
    });
    
    console.log(`Movies found for "${config.title}": ${filteredMovies.length}`);
    
    // Nếu không đủ 12 phim, thử fallback với bộ lọc linh hoạt hơn
    if (filteredMovies.length < 12) {
      console.log(`Only ${filteredMovies.length} movies found for "${config.title}", trying fallback...`);
      
      // Fallback 1: Bỏ qua năm sản xuất
      const fallbackCriteria1 = {
        ...config.filterCriteria,
        years: ['Tất cả']
      };
      
      const fallbackMovies = filterMoviesByDetailedCriteria(allMovies, fallbackCriteria1)
        .filter(movie => {
          const movieId = movie._id || movie.id || movie.slug || movie.name;
          return !usedMovieIds.has(movieId);
        })
        .slice(0, 12 - filteredMovies.length);
      
      fallbackMovies.forEach(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        usedMovieIds.add(movieId);
      });
      
      filteredMovies = [...filteredMovies, ...fallbackMovies];
      console.log(`Fallback 1 added ${fallbackMovies.length} movies (Total: ${filteredMovies.length})`);
    }
    
    // Nếu vẫn chưa đủ 12 phim, thử fallback với bộ lọc rất linh hoạt
    if (filteredMovies.length < 12) {
      console.log(`Still only ${filteredMovies.length} movies, trying very flexible fallback...`);
      
      // Fallback 2: Chỉ giữ quốc gia (nếu có), bỏ qua tất cả filter khác
      const fallbackCriteria2 = {
        countries: config.filterCriteria.countries.includes('Tất cả') ? ['Tất cả'] : config.filterCriteria.countries,
        movieType: 'Tất cả',
        genres: ['Tất cả'],
        years: ['Tất cả'],
        sortBy: 'mới cập nhật'
      };
      
      const fallbackMovies2 = filterMoviesByDetailedCriteria(allMovies, fallbackCriteria2)
        .filter(movie => {
          const movieId = movie._id || movie.id || movie.slug || movie.name;
          return !usedMovieIds.has(movieId);
        })
        .slice(0, 12 - filteredMovies.length);
      
      fallbackMovies2.forEach(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        usedMovieIds.add(movieId);
      });
      
      filteredMovies = [...filteredMovies, ...fallbackMovies2];
      console.log(`Fallback 2 added ${fallbackMovies2.length} movies (Total: ${filteredMovies.length})`);
    }
    
    // Nếu vẫn chưa đủ 12 phim, lấy phim ngẫu nhiên
    if (filteredMovies.length < 12) {
      console.log(`Still only ${filteredMovies.length} movies, using random movies...`);
      
      const remainingMovies = allMovies.filter(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        return !usedMovieIds.has(movieId);
      });
      
      const randomMovies = remainingMovies.slice(0, 12 - filteredMovies.length);
      randomMovies.forEach(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        usedMovieIds.add(movieId);
      });
      
      filteredMovies = [...filteredMovies, ...randomMovies];
      console.log(`Random fallback added ${randomMovies.length} movies (Total: ${filteredMovies.length})`);
    }
    
    if (filteredMovies.length > 0) {
      console.log('Sample movies:', filteredMovies.slice(0, 3).map(m => `${m.name} (${m.year})`));
    }
    
    // Thêm section với phim đã lọc
    sections.push({
      ...config,
      movies: filteredMovies
    });
  }
  
  console.log(`Total sections created: ${sections.length}`);
  console.log(`Total unique movies used: ${usedMovieIds.size}`);
  return sections;
};

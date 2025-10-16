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
  
  let filtered = [...movies];
  
  // Lọc theo quốc gia
  if (criteria.countries && criteria.countries.length > 0 && !criteria.countries.includes('Tất cả')) {
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
  }
  
  // Lọc theo loại phim
  if (criteria.movieType && criteria.movieType !== 'Tất cả') {
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
  }
  
  // Lọc theo thể loại
  if (criteria.genres && criteria.genres.length > 0 && !criteria.genres.includes('Tất cả')) {
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
  }
  
  // Lọc theo năm sản xuất
  if (criteria.years && criteria.years.length > 0 && !criteria.years.includes('Tất cả')) {
    filtered = filtered.filter(movie => {
      const movieYear = parseInt(movie.year);
      return criteria.years.some(year => {
        const filterYear = parseInt(year);
        // Cho phép phim có năm gần với năm lọc (trong khoảng ±1 năm)
        return movieYear === filterYear || 
               (movieYear >= filterYear - 1 && movieYear <= filterYear + 1);
      });
    });
  }
  
  // Sắp xếp
  if (criteria.sortBy === 'mới cập nhật') {
    filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    });
  }
  
  return filtered;
};

// Hàm tạo các section mới với bộ lọc cụ thể
export const createDetailedMovieSections = (movies) => {
  if (!movies || movies.length === 0) return [];
  
  console.log('=== DEBUGGING MOVIE SECTIONS ===');
  console.log('Total movies available:', movies.length);
  console.log('Sample movie structure:', movies[0]);
  
  // Debug: Hiển thị tất cả quốc gia và thể loại có trong dữ liệu
  const allCountries = new Set();
  const allGenres = new Set();
  const allYears = new Set();
  
  movies.forEach(movie => {
    if (movie.country) {
      movie.country.forEach(c => allCountries.add(c.name));
    }
    if (movie.category) {
      movie.category.forEach(c => allGenres.add(c.name));
    }
    if (movie.year) {
      allYears.add(movie.year);
    }
  });
  
  console.log('Available countries:', Array.from(allCountries));
  console.log('Available genres:', Array.from(allGenres));
  console.log('Available years:', Array.from(allYears).sort());
  
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
  
  // Phân phối phim cho từng section
  sectionConfigs.forEach((config) => {
    let filteredMovies = [];
    
    // Bước 1: Lấy phim phù hợp với bộ lọc chính
    console.log(`\n--- Processing Section: ${config.title} ---`);
    console.log('Filter criteria:', config.filterCriteria);
    
    const primaryMovies = filterMoviesByDetailedCriteria(movies, config.filterCriteria)
      .filter(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        return !usedMovieIds.has(movieId);
      });
    
    console.log(`Primary movies found: ${primaryMovies.length}`);
    if (primaryMovies.length > 0) {
      console.log('Sample primary movies:', primaryMovies.slice(0, 3).map(m => `${m.name} (${m.year})`));
    }
    
    // Lấy tối đa 8 phim từ bộ lọc chính
    const primarySelected = primaryMovies.slice(0, 8);
    primarySelected.forEach(movie => {
      const movieId = movie._id || movie.id || movie.slug || movie.name;
      usedMovieIds.add(movieId);
    });
    filteredMovies = [...filteredMovies, ...primarySelected];
    
    // Bước 2: Nếu chưa đủ, thử bộ lọc linh hoạt hơn
    if (filteredMovies.length < 6) {
      const fallbackCriteria = {
        ...config.filterCriteria,
        years: config.filterCriteria.years.includes('Tất cả') ? ['Tất cả'] : [...config.filterCriteria.years, 'Tất cả']
      };
      
      const fallbackMovies = filterMoviesByDetailedCriteria(movies, fallbackCriteria)
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
    }
    
    // Bước 3: Nếu vẫn chưa đủ, lấy phim ngẫu nhiên từ còn lại
    if (filteredMovies.length < 6) {
      const remainingMovies = movies.filter(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        return !usedMovieIds.has(movieId);
      });
      
      // Lấy tối đa 4 phim ngẫu nhiên
      const randomMovies = remainingMovies.slice(0, Math.min(4, 12 - filteredMovies.length));
      randomMovies.forEach(movie => {
        const movieId = movie._id || movie.id || movie.slug || movie.name;
        usedMovieIds.add(movieId);
      });
      filteredMovies = [...filteredMovies, ...randomMovies];
    }
    
    // Giới hạn tối đa 12 phim mỗi section
    filteredMovies = filteredMovies.slice(0, 12);
    
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

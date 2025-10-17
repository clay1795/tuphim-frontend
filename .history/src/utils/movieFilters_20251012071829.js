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

// Hàm để loại bỏ phim trùng lặp giữa các section
export const createUniqueMovieSections = (movies) => {
  if (!movies || movies.length === 0) return [];
  
  const usedMovieIds = new Set();
  const sections = [];
  
  // Định nghĩa thứ tự ưu tiên của các section (theo thứ tự quan trọng)
  const sectionConfigs = [
    {
      key: 'phim-dien-anh-moi-coong',
      title: 'Phim Điện Ảnh Mới Coóng',
      description: 'Những bộ phim điện ảnh mới nhất, chất lượng cao',
      filterFn: () => filterHighQualityMovies(filterNewMovies(movies)),
      linkTo: '/phim-de-cu',
      component: 'MovieSection'
    },
    {
      key: 'phim-trung-quoc-moi',
      title: 'Phim Trung Quốc mới',
      description: 'Tuyển tập phim Trung Quốc mới cập nhật',
      filterFn: () => filterMoviesByTheme(movies, 'chinese'),
      component: 'MovieSectionCarousel'
    },
    {
      key: 'man-nhan-voi-phim-chieu-rap',
      title: 'Mãn Nhãn với Phim Chiếu Rạp',
      description: 'Những bộ phim chiếu rạp nổi bật hiện đang có',
      filterFn: () => filterMoviesByTheme(movies, 'cinema'),
      component: 'MovieSection'
    },
    {
      key: 'kho-tang-anime-moi-nhat',
      title: 'Kho Tàng Anime Mới Nhất',
      description: 'Tuyển tập anime mới nhất, đa dạng thể loại',
      filterFn: () => {
        const animeMovies = filterMoviesByTheme(movies, 'anime');
        const japaneseMovies = filterMoviesByTheme(movies, 'japanese');
        const animationMovies = movies.filter(movie => {
          const category = movie.category?.map(c => c.name?.toLowerCase()).join(' ') || '';
          return category.includes('hoạt hình') || category.includes('animation');
        });
        return animeMovies.length > 0 ? animeMovies : 
               japaneseMovies.length > 0 ? japaneseMovies : 
               animationMovies;
      },
      component: 'MovieSectionCarousel'
    },
    {
      key: 'yeu-kieu-my',
      title: 'Yêu Kiểu Mỹ',
      description: 'Tuyển tập phim tình cảm của Mỹ',
      filterFn: () => {
        const americanRomance = filterMoviesByTheme(filterMoviesByTheme(movies, 'american'), 'romance');
        const americanMovies = filterMoviesByTheme(movies, 'american');
        const romanceMovies = filterMoviesByTheme(movies, 'romance');
        return americanRomance.length > 0 ? americanRomance : 
               americanMovies.length > 0 ? americanMovies : 
               romanceMovies;
      },
      component: 'MovieSection'
    },
    {
      key: 'pha-an-kieu-han',
      title: 'Phá Án Kiểu Hàn',
      description: 'Phim trinh thám Hàn Quốc hấp dẫn',
      filterFn: () => {
        const koreanDetective = filterMoviesByTheme(filterMoviesByTheme(movies, 'korean'), 'detective');
        const koreanMovies = filterMoviesByTheme(movies, 'korean');
        const detectiveMovies = filterMoviesByTheme(movies, 'detective');
        return koreanDetective.length > 0 ? koreanDetective : 
               koreanMovies.length > 0 ? koreanMovies : 
               detectiveMovies;
      },
      component: 'MovieSection'
    },
    {
      key: 'dien-anh-chieu-thu-7',
      title: 'Điện Ảnh Chiều Thứ 7',
      description: 'Các phim đề xuất cho cuối tuần',
      filterFn: () => filterMoviesByTheme(movies, 'weekend'),
      component: 'MovieSection'
    }
  ];
  
  // Xử lý từng section theo thứ tự ưu tiên
  sectionConfigs.forEach(config => {
    const filteredMovies = config.filterFn().filter(movie => {
      const movieId = movie._id || movie.id || movie.slug || movie.name;
      if (usedMovieIds.has(movieId)) {
        return false; // Bỏ qua phim đã được sử dụng
      }
      usedMovieIds.add(movieId);
      return true;
    }).slice(0, 20); // Lấy tối đa 20 phim
    
    if (filteredMovies.length > 0) {
      sections.push({
        ...config,
        movies: filteredMovies
      });
    }
  });
  
  return sections;
};

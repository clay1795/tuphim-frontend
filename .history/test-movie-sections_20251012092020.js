// Test script để debug movie sections
const testMovieSections = async () => {
  try {
    console.log('=== TESTING MOVIE SECTIONS ===');
    
    // Test MongoDB API
    console.log('1. Testing MongoDB API...');
    const response = await fetch('/api/mongo-movies/search?keyword=&page=1&limit=100&sort=modified_time&sortType=desc');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('MongoDB API Response:', {
      success: data.success,
      message: data.message,
      totalItems: data.data?.pagination?.totalItems,
      itemsCount: data.data?.items?.length,
      sampleItem: data.data?.items?.[0] ? {
        name: data.data.items[0].name,
        year: data.data.items[0].year,
        country: data.data.items[0].country,
        category: data.data.items[0].category
      } : null
    });
    
    if (!data.success || !data.data?.items || data.data.items.length === 0) {
      throw new Error('No movies returned from MongoDB API');
    }
    
    console.log('✅ MongoDB API working - got', data.data.items.length, 'movies');
    
    // Test movie filtering
    console.log('2. Testing movie filtering...');
    const movies = data.data.items;
    
    // Test country filtering
    const koreanMovies = movies.filter(movie => 
      movie.country && Array.isArray(movie.country) && 
      movie.country.some(c => c.name && c.name.toLowerCase().includes('hàn'))
    );
    console.log('Korean movies found:', koreanMovies.length);
    
    // Test category filtering
    const romanceMovies = movies.filter(movie => 
      movie.category && Array.isArray(movie.category) && 
      movie.category.some(c => c.name && c.name.toLowerCase().includes('tình cảm'))
    );
    console.log('Romance movies found:', romanceMovies.length);
    
    // Test year filtering
    const recentMovies = movies.filter(movie => 
      movie.year && parseInt(movie.year) >= 2023
    );
    console.log('Recent movies (2023+):', recentMovies.length);
    
    console.log('✅ Movie filtering working');
    console.log('=== TEST COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
};

// Run test
testMovieSections();

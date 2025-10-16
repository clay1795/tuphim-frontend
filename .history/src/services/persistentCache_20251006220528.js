// Persistent Cache Service - Lưu trữ dữ liệu database vào localStorage và IndexedDB
const CACHE_VERSION = '1.0.0';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const MAX_LOCALSTORAGE_SIZE = 5 * 1024 * 1024; // 5MB
const INDEXEDDB_NAME = 'MovieDatabaseCache';
const INDEXEDDB_VERSION = 1;

class PersistentCache {
  constructor() {
    this.indexedDB = null;
    this.isIndexedDBSupported = this.checkIndexedDBSupport();
    this.initIndexedDB();
  }

  // Kiểm tra hỗ trợ IndexedDB
  checkIndexedDBSupport() {
    return 'indexedDB' in window;
  }

  // Khởi tạo IndexedDB
  async initIndexedDB() {
    if (!this.isIndexedDBSupported) {
      console.log('IndexedDB not supported, using localStorage only');
      return;
    }

    try {
      const request = indexedDB.open(INDEXEDDB_NAME, INDEXEDDB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Tạo object store cho movies
        if (!db.objectStoreNames.contains('movies')) {
          const movieStore = db.createObjectStore('movies', { keyPath: 'slug' });
          movieStore.createIndex('name', 'name', { unique: false });
          movieStore.createIndex('year', 'year', { unique: false });
          movieStore.createIndex('category', 'category', { unique: false });
          movieStore.createIndex('country', 'country', { unique: false });
        }
        
        // Tạo object store cho metadata
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
      
      request.onsuccess = (event) => {
        this.indexedDB = event.target.result;
        console.log('IndexedDB initialized successfully');
      };
      
      request.onerror = (event) => {
        console.error('IndexedDB initialization failed:', event.target.error);
        this.indexedDB = null;
      };
    } catch (error) {
      console.error('IndexedDB initialization error:', error);
      this.indexedDB = null;
    }
  }

  // Tính kích thước dữ liệu JSON
  getJSONSize(data) {
    return new Blob([JSON.stringify(data)]).size;
  }

  // Lưu vào localStorage
  saveToLocalStorage(key, data) {
    try {
      const serialized = JSON.stringify(data);
      const size = new Blob([serialized]).size;
      
      // Kiểm tra kích thước
      if (size > MAX_LOCALSTORAGE_SIZE) {
        console.warn(`Data too large for localStorage (${size} bytes), using IndexedDB instead`);
        return false;
      }
      
      localStorage.setItem(key, serialized);
      console.log(`Saved to localStorage: ${key} (${size} bytes)`);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, using IndexedDB instead');
        return false;
      }
      console.error('localStorage save error:', error);
      return false;
    }
  }

  // Đọc từ localStorage
  loadFromLocalStorage(key) {
    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) return null;
      
      const data = JSON.parse(serialized);
      console.log(`Loaded from localStorage: ${key}`);
      return data;
    } catch (error) {
      console.error('localStorage load error:', error);
      return null;
    }
  }

  // Lưu vào IndexedDB
  async saveToIndexedDB(key, data) {
    if (!this.indexedDB) {
      console.warn('IndexedDB not available');
      return false;
    }

    try {
      const transaction = this.indexedDB.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      
      const cacheData = {
        key: key,
        data: data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
        size: this.getJSONSize(data)
      };
      
      await new Promise((resolve, reject) => {
        const request = store.put(cacheData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      console.log(`Saved to IndexedDB: ${key} (${cacheData.size} bytes)`);
      return true;
    } catch (error) {
      console.error('IndexedDB save error:', error);
      return false;
    }
  }

  // Đọc từ IndexedDB
  async loadFromIndexedDB(key) {
    if (!this.indexedDB) {
      console.warn('IndexedDB not available');
      return null;
    }

    try {
      const transaction = this.indexedDB.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      
      const data = await new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (!data) return null;
      
      // Kiểm tra cache validity
      if (!this.isCacheValid(data)) {
        console.log(`Cache expired for key: ${key}`);
        await this.deleteFromIndexedDB(key);
        return null;
      }
      
      console.log(`Loaded from IndexedDB: ${key}`);
      return data.data;
    } catch (error) {
      console.error('IndexedDB load error:', error);
      return null;
    }
  }

  // Lưu movies vào IndexedDB (batch operation)
  async saveMoviesToIndexedDB(movies) {
    if (!this.indexedDB || !movies || movies.length === 0) {
      return false;
    }

    try {
      const transaction = this.indexedDB.transaction(['movies'], 'readwrite');
      const store = transaction.objectStore('movies');
      
      // Clear existing movies first
      await new Promise((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      });
      
      // Add movies in batches
      const batchSize = 100;
      for (let i = 0; i < movies.length; i += batchSize) {
        const batch = movies.slice(i, i + batchSize);
        
        await new Promise((resolve, reject) => {
          const promises = batch.map(movie => {
            return new Promise((resolveBatch, rejectBatch) => {
              const request = store.add(movie);
              request.onsuccess = () => resolveBatch();
              request.onerror = () => rejectBatch(request.error);
            });
          });
          
          Promise.all(promises)
            .then(() => resolve())
            .catch(reject);
        });
        
        console.log(`Saved batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(movies.length/batchSize)} to IndexedDB`);
      }
      
      console.log(`Successfully saved ${movies.length} movies to IndexedDB`);
      return true;
    } catch (error) {
      console.error('Error saving movies to IndexedDB:', error);
      return false;
    }
  }

  // Đọc movies từ IndexedDB
  async loadMoviesFromIndexedDB() {
    if (!this.indexedDB) {
      return null;
    }

    try {
      const transaction = this.indexedDB.transaction(['movies'], 'readonly');
      const store = transaction.objectStore('movies');
      
      const movies = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      console.log(`Loaded ${movies.length} movies from IndexedDB`);
      return movies;
    } catch (error) {
      console.error('Error loading movies from IndexedDB:', error);
      return null;
    }
  }

  // Kiểm tra cache validity
  isCacheValid(cacheData) {
    if (!cacheData || !cacheData.timestamp) return false;
    
    const age = Date.now() - cacheData.timestamp;
    return age < CACHE_EXPIRY;
  }

  // Xóa từ IndexedDB
  async deleteFromIndexedDB(key) {
    if (!this.indexedDB) return false;

    try {
      const transaction = this.indexedDB.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      
      await new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      console.log(`Deleted from IndexedDB: ${key}`);
      return true;
    } catch (error) {
      console.error('IndexedDB delete error:', error);
      return false;
    }
  }

  // Xóa cache cũ
  async clearExpiredCache() {
    if (!this.indexedDB) return;

    try {
      const transaction = this.indexedDB.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      
      const allData = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const expiredKeys = allData
        .filter(item => !this.isCacheValid(item))
        .map(item => item.key);
      
      for (const key of expiredKeys) {
        await this.deleteFromIndexedDB(key);
      }
      
      console.log(`Cleared ${expiredKeys.length} expired cache entries`);
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  // Lưu database với auto-fallback
  async saveDatabase(key, movies, metadata) {
    const data = {
      movies: movies,
      metadata: metadata,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };

    const size = this.getJSONSize(data);
    console.log(`Saving database: ${key} (${size} bytes)`);

    // Try localStorage first for small data
    if (size <= MAX_LOCALSTORAGE_SIZE) {
      if (this.saveToLocalStorage(key, data)) {
        return true;
      }
    }

    // Fallback to IndexedDB
    const saved = await this.saveToIndexedDB(key, data);
    if (saved && movies) {
      await this.saveMoviesToIndexedDB(movies);
    }
    
    return saved;
  }

  // Load database với auto-fallback
  async loadDatabase(key) {
    console.log(`Loading database: ${key}`);

    // Try localStorage first
    let data = this.loadFromLocalStorage(key);
    if (data && this.isCacheValid(data)) {
      console.log(`Loaded from localStorage: ${key}`);
      return data;
    }

    // Try IndexedDB
    data = await this.loadFromIndexedDB(key);
    if (data) {
      console.log(`Loaded from IndexedDB: ${key}`);
      return data;
    }

    // Try loading movies from IndexedDB separately
    const movies = await this.loadMoviesFromIndexedDB();
    if (movies && movies.length > 0) {
      console.log(`Loaded ${movies.length} movies from IndexedDB movies store`);
      return {
        movies: movies,
        metadata: {
          movies: movies.length,
          categories: [...new Set(movies.flatMap(m => (m.category || []).map(c => c.name || c)))].length,
          countries: [...new Set(movies.flatMap(m => (m.country || []).map(c => c.name || c)))].length,
          years: [...new Set(movies.map(m => m.year).filter(Boolean))].length
        },
        timestamp: Date.now(),
        version: CACHE_VERSION
      };
    }

    console.log(`No cache found for: ${key}`);
    return null;
  }

  // Lấy thông tin cache
  async getCacheInfo() {
    const info = {
      localStorage: {
        available: true,
        size: 0,
        items: 0
      },
      indexedDB: {
        available: this.isIndexedDBSupported && !!this.indexedDB,
        size: 0,
        items: 0
      }
    };

    // localStorage info
    try {
      let totalSize = 0;
      let itemCount = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
          itemCount++;
        }
      }
      info.localStorage.size = totalSize;
      info.localStorage.items = itemCount;
    } catch (error) {
      info.localStorage.available = false;
    }

    // IndexedDB info
    if (this.indexedDB) {
      try {
        const transaction = this.indexedDB.transaction(['metadata', 'movies'], 'readonly');
        const metadataStore = transaction.objectStore('metadata');
        const moviesStore = transaction.objectStore('movies');

        const [metadataCount, moviesCount] = await Promise.all([
          new Promise((resolve) => {
            const request = metadataStore.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(0);
          }),
          new Promise((resolve) => {
            const request = moviesStore.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(0);
          })
        ]);

        info.indexedDB.items = metadataCount + moviesCount;
      } catch (error) {
        console.error('Error getting IndexedDB info:', error);
      }
    }

    return info;
  }

  // Xóa toàn bộ cache
  async clearAllCache() {
    try {
      // Clear localStorage
      localStorage.clear();
      console.log('Cleared localStorage');

      // Clear IndexedDB
      if (this.indexedDB) {
        const transaction = this.indexedDB.transaction(['metadata', 'movies'], 'readwrite');
        const metadataStore = transaction.objectStore('metadata');
        const moviesStore = transaction.objectStore('movies');

        await Promise.all([
          new Promise((resolve) => {
            const request = metadataStore.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
          }),
          new Promise((resolve) => {
            const request = moviesStore.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
          })
        ]);

        console.log('Cleared IndexedDB');
      }

      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }
}

// Export singleton instance
export const persistentCache = new PersistentCache();
export default persistentCache;

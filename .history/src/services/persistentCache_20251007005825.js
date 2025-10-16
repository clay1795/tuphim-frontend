// Persistent Cache Service - Lưu trữ dữ liệu lâu dài với localStorage và IndexedDB
// Auto-fallback: localStorage cho dữ liệu nhỏ, IndexedDB cho dữ liệu lớn

const CACHE_VERSION = '1.0.0';
const CACHE_EXPIRY_DAYS = 7; // Cache hết hạn sau 7 ngày

// Check if IndexedDB is supported
const checkIndexedDBSupport = () => {
  return 'indexedDB' in window && 'IDBTransaction' in window && 'IDBKeyRange' in window;
};

// LocalStorage helpers
const saveToLocalStorage = (key, data, metadata = {}) => {
  try {
    const cacheData = {
      data,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
        version: CACHE_VERSION,
        size: JSON.stringify(data).length
      }
    };
    
    localStorage.setItem(key, JSON.stringify(cacheData));
    console.log(`Saved to localStorage: ${key} (${cacheData.metadata.size} bytes)`);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

const loadFromLocalStorage = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    
    // Check if cache is expired
    const isExpired = Date.now() - cacheData.metadata.timestamp > (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    if (isExpired) {
      localStorage.removeItem(key);
      console.log(`Cache expired for: ${key}`);
      return null;
    }
    
    console.log(`Loaded from localStorage: ${key} (${cacheData.metadata.size} bytes)`);
    return cacheData;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

// IndexedDB helpers
const saveToIndexedDB = async (key, data, metadata = {}) => {
  return new Promise((resolve, reject) => {
    if (!checkIndexedDBSupport()) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    
    const request = indexedDB.open('MovieCache', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains('cache')) {
        reject(new Error('Cache store not found'));
        return;
      }
      
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      const cacheData = {
        key,
        data,
        metadata: {
          ...metadata,
          timestamp: Date.now(),
          version: CACHE_VERSION,
          size: JSON.stringify(data).length
        }
      };
      
      const putRequest = store.put(cacheData);
      
      putRequest.onsuccess = () => {
        console.log(`Saved to IndexedDB: ${key} (${cacheData.metadata.size} bytes)`);
        resolve(true);
      };
      
      putRequest.onerror = () => reject(putRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };
  });
};

const loadFromIndexedDB = async (key) => {
  return new Promise((resolve, reject) => {
    if (!checkIndexedDBSupport()) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    
    const request = indexedDB.open('MovieCache', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains('cache')) {
        resolve(null);
        return;
      }
      
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        const result = getRequest.result;
        
        if (!result) {
          resolve(null);
          return;
        }
        
        // Check if cache is expired
        const isExpired = Date.now() - result.metadata.timestamp > (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        if (isExpired) {
          // Delete expired cache
          const deleteTransaction = db.transaction(['cache'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('cache');
          deleteStore.delete(key);
          console.log(`Cache expired for: ${key}`);
          resolve(null);
          return;
        }
        
        console.log(`Loaded from IndexedDB: ${key} (${result.metadata.size} bytes)`);
        resolve(result);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };
  });
};

// Main cache service
const persistentCache = {
  // Save database with auto-fallback
  saveDatabase: async (key, data, metadata = {}) => {
    const dataSize = JSON.stringify(data).length;
    const maxLocalStorageSize = 5 * 1024 * 1024; // 5MB
    
    console.log(`Attempting to save database: ${key} (${dataSize} bytes)`);
    
    // Try localStorage first for small data
    if (dataSize < maxLocalStorageSize) {
      const success = saveToLocalStorage(key, data, metadata);
      if (success) {
        return { success: true, storage: 'localStorage', size: dataSize };
      }
    }
    
    // Fallback to IndexedDB for large data or if localStorage fails
    if (checkIndexedDBSupport()) {
      try {
        await saveToIndexedDB(key, data, metadata);
        return { success: true, storage: 'indexedDB', size: dataSize };
      } catch (error) {
        console.error('IndexedDB save failed:', error);
      }
    }
    
    console.error('All storage methods failed');
    return { success: false, error: 'All storage methods failed' };
  },

  // Load database with auto-fallback
  loadDatabase: async (key) => {
    console.log(`Attempting to load database: ${key}`);
    
    // Try localStorage first
    const localStorageData = loadFromLocalStorage(key);
    if (localStorageData) {
      return localStorageData;
    }
    
    // Fallback to IndexedDB
    if (checkIndexedDBSupport()) {
      try {
        const indexedDBData = await loadFromIndexedDB(key);
        if (indexedDBData) {
          return indexedDBData;
        }
      } catch (error) {
        console.error('IndexedDB load failed:', error);
      }
    }
    
    console.log(`No cache found for: ${key}`);
    return null;
  },

  // Check if cache is valid
  isCacheValid: (cacheData) => {
    if (!cacheData || !cacheData.metadata) return false;
    
    const isExpired = Date.now() - cacheData.metadata.timestamp > (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const isCorrectVersion = cacheData.metadata.version === CACHE_VERSION;
    
    return !isExpired && isCorrectVersion;
  },

  // Clear expired cache
  clearExpiredCache: async () => {
    console.log('Clearing expired cache...');
    
    // Clear localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('movie_cache_')) {
        const cached = loadFromLocalStorage(key);
        if (!cached || !persistentCache.isCacheValid(cached)) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear IndexedDB expired entries
    if (checkIndexedDBSupport()) {
      try {
        const request = indexedDB.open('MovieCache', 1);
        
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('cache')) return;
          
          const transaction = db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const allData = getAllRequest.result;
            const keysToDelete = allData
              .filter(item => !persistentCache.isCacheValid(item))
              .map(item => item.key);
            
            keysToDelete.forEach(key => {
              store.delete(key);
            });
            
            console.log(`Cleared ${keysToDelete.length} expired entries from IndexedDB`);
          };
        };
      } catch (error) {
        console.error('Error clearing IndexedDB expired cache:', error);
      }
    }
    
    console.log(`Cleared ${keysToRemove.length} expired entries from localStorage`);
  },

  // Clear all cache
  clearAllCache: async () => {
    console.log('Clearing all cache...');
    
    // Clear localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('movie_cache_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear IndexedDB
    if (checkIndexedDBSupport()) {
      try {
        const request = indexedDB.open('MovieCache', 1);
        
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('cache')) return;
          
          const transaction = db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          store.clear();
          
          console.log('Cleared all IndexedDB cache');
        };
      } catch (error) {
        console.error('Error clearing IndexedDB cache:', error);
      }
    }
    
    console.log(`Cleared ${keysToRemove.length} entries from localStorage`);
  },

  // Get cache info
  getCacheInfo: async () => {
    const info = {
      localStorage: {
        count: 0,
        totalSize: 0
      },
      indexedDB: {
        count: 0,
        totalSize: 0,
        supported: checkIndexedDBSupport()
      }
    };
    
    // Count localStorage entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('movie_cache_')) {
        const cached = loadFromLocalStorage(key);
        if (cached) {
          info.localStorage.count++;
          info.localStorage.totalSize += cached.metadata.size || 0;
        }
      }
    }
    
    // Count IndexedDB entries
    if (checkIndexedDBSupport()) {
      try {
        const request = indexedDB.open('MovieCache', 1);
        
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('cache')) return;
          
          const transaction = db.transaction(['cache'], 'readonly');
          const store = transaction.objectStore('cache');
          const countRequest = store.count();
          
          countRequest.onsuccess = () => {
            info.indexedDB.count = countRequest.result;
          };
        };
      } catch (error) {
        console.error('Error getting IndexedDB cache info:', error);
      }
    }
    
    return info;
  }
};

export default persistentCache;

/**
 * Utility functions for localStorage persistence
 * This helps ensure data is not accidentally cleared between sessions
 */

// Check if storage is available in the browser
const isStorageAvailable = (type: string): boolean => {
  try {
    const storage = window[type as 'localStorage' | 'sessionStorage'];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Get data from localStorage with fallback values
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (!isStorageAvailable('localStorage')) return defaultValue;
    
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error retrieving ${key} from localStorage:`, e);
    return defaultValue;
  }
};

// Save data to localStorage safely
export const saveToStorage = <T>(key: string, value: T): boolean => {
  try {
    if (!isStorageAvailable('localStorage')) return false;
    
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
    return false;
  }
};

// Remove data from localStorage safely
export const removeFromStorage = (key: string): boolean => {
  try {
    if (!isStorageAvailable('localStorage')) return false;
    
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`Error removing ${key} from localStorage:`, e);
    return false;
  }
};

// Check if localStorage and data persists across page refreshes
export const checkStoragePersistence = (): boolean => {
  const persistenceFlag = 'storage_persistence_check';
  
  // If flag exists, storage is persisting correctly
  if (localStorage.getItem(persistenceFlag)) {
    return true;
  }
  
  // Set the flag for future checks
  try {
    localStorage.setItem(persistenceFlag, 'true');
    return false; // First time visit, storage persistence not yet verified
  } catch (e) {
    console.error('Error setting storage persistence flag:', e);
    return false;
  }
};

// Initialize persistent storage when app starts
export const initializePersistentStorage = (): void => {
  if (!isStorageAvailable('localStorage')) {
    console.error('localStorage is not available in this browser');
    return;
  }
  
  const isPersistent = checkStoragePersistence();
  
  // If this is a returning user with storage persistence
  if (isPersistent) {
    console.log('Storage persistence confirmed');
    
    // Update last visit timestamp
    saveToStorage('last_visit', new Date().toISOString());
  } else {
    console.log('First visit or storage was cleared');
    
    // Set initial visit timestamp
    saveToStorage('first_visit', new Date().toISOString());
    saveToStorage('last_visit', new Date().toISOString());
  }
};

// Export a complete storage object for easy access
export const storage = {
  get: getFromStorage,
  set: saveToStorage,
  remove: removeFromStorage,
  initialize: initializePersistentStorage,
  isPersistent: checkStoragePersistence
}; 
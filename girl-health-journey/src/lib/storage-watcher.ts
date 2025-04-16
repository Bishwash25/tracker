/**
 * This module watches for localStorage events and prevents accidental clearing
 */

import { storage } from './storage-utils';

// Key used to store backup data
const BACKUP_KEY = 'localStorage_backup';

// Important keys that should be backed up
const IMPORTANT_KEYS = [
  'user',
  'lastPeriodDate',
  'dueDate',
  'periodStartDate',
  'periodEndDate',
  'cycleLength',
  'periodLength',
  'pregnancyStartDate',
  'device_authenticated',
  'periodHistory',
  'kickSessions',
  'contractionSessions',
  'weightRecords',
  'pregnancyBMIRecords',
  'exerciseRecords',
  'pregnancyMoodTracking',
  'periodFlowTracking',
  'periodWeightTracking',
  'moodTrackingComprehensive',
  'termsAccepted'
];

/**
 * Creates a backup of all important localStorage data
 */
export const backupLocalStorage = (): void => {
  const backup: Record<string, string> = {};
  
  IMPORTANT_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      backup[key] = value;
    }
  });
  
  // Store the backup in localStorage
  storage.set(BACKUP_KEY, backup);
  
  // Also store in sessionStorage for extra safety
  try {
    sessionStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
  } catch (e) {
    console.error('Failed to backup to sessionStorage:', e);
  }
  
  console.log('Created backup of important localStorage data');
};

/**
 * Restores localStorage data from backup
 */
export const restoreFromBackup = (): void => {
  // Try to get backup from sessionStorage first (less likely to be cleared)
  let backup: Record<string, string> | null = null;
  
  try {
    const sessionBackup = sessionStorage.getItem(BACKUP_KEY);
    if (sessionBackup) {
      backup = JSON.parse(sessionBackup);
    }
  } catch (e) {
    console.error('Failed to restore from sessionStorage backup:', e);
  }
  
  // If no sessionStorage backup, try localStorage
  if (!backup) {
    backup = storage.get(BACKUP_KEY, null);
  }
  
  if (backup) {
    // Restore data
    Object.entries(backup).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    console.log('Restored localStorage data from backup');
  } else {
    console.warn('No backup found to restore localStorage data');
  }
};

/**
 * Initialize the storage watcher
 */
export const initStorageWatcher = (): (() => void) => {
  // Create initial backup
  backupLocalStorage();
  
  // Set up interval to create backups regularly
  const backupInterval = setInterval(backupLocalStorage, 30000); // Every 30 seconds
  
  // Listen for storage events
  window.addEventListener('storage', (event) => {
    if (event.storageArea === localStorage) {
      // If someone cleared localStorage
      if (event.key === null) {
        console.warn('localStorage was cleared! Attempting to restore data...');
        restoreFromBackup();
      }
      
      // If one of our important keys was removed
      if (event.key && IMPORTANT_KEYS.includes(event.key) && event.newValue === null) {
        // Get the value from backup
        const backup = storage.get(BACKUP_KEY, {});
        if (backup && backup[event.key]) {
          console.warn(`Important key "${event.key}" was removed! Restoring...`);
          localStorage.setItem(event.key, backup[event.key]);
        }
      }
    }
  });
  
  // Clean up function
  return () => {
    clearInterval(backupInterval);
    window.removeEventListener('storage', () => {});
  };
};

// Function to check if data has been lost
export const checkForDataLoss = (): boolean => {
  // Check if we had data previously
  const backup = storage.get(BACKUP_KEY, null);
  
  if (!backup) {
    return false; // No previous data to check against
  }
  
  // Check if important keys are missing
  for (const key of IMPORTANT_KEYS) {
    if (backup[key] && localStorage.getItem(key) === null) {
      console.warn(`Data loss detected: "${key}" is missing!`);
      return true;
    }
  }
  
  return false;
}; 
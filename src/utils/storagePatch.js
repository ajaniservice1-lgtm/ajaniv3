
const NON_NAMESPACED_KEYS = new Set([
  'user',
  'auth_token',
  'user_email',
  'userProfile',
  'ajani_dummy_login',
  'auth-storage',
  'redirectAfterLogin',
  'pendingVerificationEmail',
  'pendingSaveItem',
  'theme',
  'language',
  'session',
  'firstVisit',
  'consent',
  'token',
  'access_token',
  'refresh_token',
  'logout_manual'
]);

// User-specific keys that should be namespaced
const USER_DATA_KEYS = new Set([
  'favorites',
  'savedListings',
  'userSavedListings',
  'userBookings',
  'savedItems',
  'recentSearches',
  'notifications',
  'settings',
  'cart',
  'wishlist',
  'history',
  'preferences',
  'bookings',
  'allBookings',
  'vendorPersonalBookings',
  'notificationSettings',
  'privacySettings',
  'securitySettings'
]);

// Track current user namespace
let currentUserNamespace = null;
let migrationCompleted = false;

/**
 * Get current user identifier for namespace
 * Returns null if no user is logged in
 */
const getCurrentUserNamespace = () => {
  // First check for authenticated user
  try {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      if (profile.email) {
        return `user:${profile.email}:`;
      }
    }
  } catch {
    // Silent fail, fall back to email
  }

  // Fall back to email in localStorage
  const userEmail = localStorage.getItem('user_email');
  if (userEmail) {
    return `user:${userEmail}:`;
  }

  // No user logged in
  return null;
};

/**
 * Check if a key should be namespaced
 */
const shouldNamespaceKey = (key) => {
  // Never namespace whitelisted system keys
  if (NON_NAMESPACED_KEYS.has(key)) {
    return false;
  }

  // Always namespace user data keys
  if (USER_DATA_KEYS.has(key)) {
    return true;
  }

  // For other keys, namespace if they look like user data
  const isUserDataPattern = 
    key.startsWith('user') ||
    key.includes('Saved') ||
    key.includes('Book') ||
    key.includes('Fav') ||
    key.includes('Pref') ||
    key.includes('Setting') ||
    key.includes('History') ||
    key.includes('Recent') ||
    key.includes('Cart') ||
    key.includes('Wish');
  
  return isUserDataPattern;
};

/**
 * Get namespaced key for current user
 * Returns original key if no user or shouldn't be namespaced
 */
const getNamespacedKey = (key) => {
  if (!currentUserNamespace || !shouldNamespaceKey(key)) {
    return key;
  }
  return `${currentUserNamespace}${key}`;
};

/**
 * Get original key from namespaced key
 */
const getOriginalKey = (namespacedKey) => {
  if (!currentUserNamespace || !namespacedKey.startsWith(currentUserNamespace)) {
    return namespacedKey;
  }
  return namespacedKey.substring(currentUserNamespace.length);
};

/**
 * Migrate old un-namespaced data to current user namespace
 * Runs only once per user session
 */
const migrateOldData = () => {
  if (migrationCompleted || !currentUserNamespace) {
    return;
  }

  try {
    // Collect all non-namespaced user data keys
    const oldKeysToMigrate = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (shouldNamespaceKey(key) && !key.includes('user:')) {
        oldKeysToMigrate.push(key);
      }
    }

    // Migrate each key
    oldKeysToMigrate.forEach(oldKey => {
      const newKey = getNamespacedKey(oldKey);
      try {
        const value = localStorage.getItem(oldKey);
        if (value !== null) {
          // Only migrate if new key doesn't exist
          if (localStorage.getItem(newKey) === null) {
            localStorage.setItem(newKey, value);
          }
        }
      } catch {
        // Silent fail for migration errors
      }
    });

    migrationCompleted = true;
  } catch {
    // Silent fail for migration errors
  }
};

/**
 * Clean up old namespaced data for users who are no longer logged in
 */
const cleanupOldNamespaces = () => {
  try {
    const currentUser = getCurrentUserNamespace();
    const allKeys = [];
    
    // Collect all keys
    for (let i = 0; i < localStorage.length; i++) {
      allKeys.push(localStorage.key(i));
    }

    // Find and clean up old user namespaces
    const userNamespaceRegex = /^user:[^:]+:/;
    const userNamespaces = new Set();
    
    allKeys.forEach(key => {
      const match = key.match(userNamespaceRegex);
      if (match) {
        userNamespaces.add(match[0]);
      }
    });

    // Remove data from old namespaces (keep current user's)
    userNamespaces.forEach(namespace => {
      if (!currentUser || namespace !== currentUser) {
        const oldKeys = allKeys.filter(key => key.startsWith(namespace));
        oldKeys.forEach(key => {
          localStorage.removeItem(key);
        });
      }
    });
  } catch {
    // Silent fail for cleanup errors
  }
};

/**
 * Initialize the storage system
 * Should be called once when app starts
 */
export const initUserStorage = () => {
  // Update current namespace
  currentUserNamespace = getCurrentUserNamespace();
  
  // Run cleanup first
  cleanupOldNamespaces();
  
  // Migrate old data if user is logged in
  if (currentUserNamespace) {
    migrateOldData();
  }
  
  // Listen for auth changes
  const handleAuthChange = () => {
    const newNamespace = getCurrentUserNamespace();
    
    // If namespace changed (user logged in/out)
    if (newNamespace !== currentUserNamespace) {
      currentUserNamespace = newNamespace;
      migrationCompleted = false;
      
      // Migrate data for new user
      if (currentUserNamespace) {
        migrateOldData();
      }
    }
  };
  
  // Listen for storage events (cross-tab) and custom auth events
  window.addEventListener('storage', handleAuthChange);
  window.addEventListener('authChange', handleAuthChange);
  window.addEventListener('loginSuccess', handleAuthChange);
  window.addEventListener('logout', handleAuthChange);
};

/**
 * Patch localStorage methods to be namespace-aware
 */
export const patchLocalStorage = () => {
  // Store original methods
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;
  const originalKey = localStorage.key;

  // Override setItem
  localStorage.setItem = function(key, value) {
    const namespacedKey = getNamespacedKey(key);
    return originalSetItem.call(this, namespacedKey, value);
  };

  // Override getItem
  localStorage.getItem = function(key) {
    const namespacedKey = getNamespacedKey(key);
    return originalGetItem.call(this, namespacedKey);
  };

  // Override removeItem
  localStorage.removeItem = function(key) {
    const namespacedKey = getNamespacedKey(key);
    return originalRemoveItem.call(this, namespacedKey);
  };

  // Override clear (only clears current user's data)
  localStorage.clear = function() {
    if (!currentUserNamespace) {
      return originalClear.call(this);
    }
    
    // Only clear namespaced keys for current user
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      allKeys.push(localStorage.key(i));
    }
    
    allKeys.forEach(key => {
      if (key.startsWith(currentUserNamespace)) {
        originalRemoveItem.call(this, key);
      }
    });
  };

  // Override key (to work with namespaced indices)
  localStorage.key = function(index) {
    if (!currentUserNamespace) {
      return originalKey.call(this, index);
    }
    
    // Get all keys for current user namespace
    const userKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = originalKey.call(this, i);
      if (key.startsWith(currentUserNamespace)) {
        userKeys.push(getOriginalKey(key));
      }
    }
    
    return userKeys[index] || null;
  };

  // Add helper method to get all user keys
  localStorage.getUserKeys = function() {
    if (!currentUserNamespace) {
      return [];
    }
    
    const userKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = originalKey.call(this, i);
      if (key.startsWith(currentUserNamespace)) {
        userKeys.push(getOriginalKey(key));
      }
    }
    return userKeys;
  };
};

/**
 * Get all user data for export/backup
 */
export const exportUserData = () => {
  if (!currentUserNamespace) {
    return {};
  }
  
  const userData = {};
  const userKeys = localStorage.getUserKeys();
  
  userKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        userData[key] = JSON.parse(value);
      }
    } catch {
      userData[key] = value;
    }
  });
  
  return userData;
};

/**
 * Import user data
 */
export const importUserData = (data) => {
  if (!currentUserNamespace || typeof data !== 'object') {
    return false;
  }
  
  try {
    Object.entries(data).forEach(([key, value]) => {
      if (shouldNamespaceKey(key)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Get current namespace for debugging (development only)
 */
export const getCurrentNamespace = () => {
  if (process.env.NODE_ENV === 'development') {
    return currentUserNamespace;
  }
  return null;
};

/**
 * Check if storage is properly namespaced
 */
export const isStorageNamespaced = () => {
  return currentUserNamespace !== null;
};
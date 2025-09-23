export const environment = {
  production: true,
  
  // API Configuration
  api: {
    baseUrl: 'https://nolrental.runasp.net/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Authentication Configuration
  auth: {
    tokenKey: 'admin_token',
    refreshTokenKey: 'admin_refresh_token',
    languageKey: 'admin_language',
    tokenExpiryBuffer: 300 // 5 minutes before actual expiry
  },
  
  // Feature Flags
  features: {
    realTimeUpdates: true,
    caching: true,
    analytics: true,
    bulkOperations: true,
    mockData: false
  },
  
  // Logging Configuration
  logging: {
    enableConsoleLogging: false,
    enableApiLogging: false,
    logLevel: 'error' // 'debug' | 'info' | 'warn' | 'error'
  },
  
  // Cache Configuration
  cache: {
    defaultTtl: 300000, // 5 minutes
    maxSize: 100,
    enableLocalStorage: true
  }
};

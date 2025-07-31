export const environment = {
  production: false,
  
  // API Configuration
  api: {
    baseUrl: 'https://localhost:44384/api',
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
    mockData: false // Set to true for development with mock data
  },
  
  // Logging Configuration
  logging: {
    enableConsoleLogging: true,
    enableApiLogging: true,
    logLevel: 'debug' // 'debug' | 'info' | 'warn' | 'error'
  },
  
  // Cache Configuration
  cache: {
    defaultTtl: 300000, // 5 minutes
    maxSize: 100,
    enableLocalStorage: true
  }
};

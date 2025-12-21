module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Environment variables for tests
  setupFilesAfterEnv: ['<rootDir>/tests/utils/testSetup.js'],
  
  // Set environment variables for tests
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    LOG_LEVEL: 'warn'
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  
  // Test file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'app.js',
    'routes/**/*.js',
    'controllers/**/*.js',
    'middlewareLib/**/*.js',
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    }
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  
  // Restore mocks between tests
  restoreMocks: true
}; 
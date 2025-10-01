// Local development environment configuration
export const config = {
  environment: 'local',
  baseURL: 'http://localhost:3000',
  
  azure: {
    storageAccount: 'mock-storage',
    containerName: 'uploads',
    mlWorkspace: 'mock-workspace',
    registryEndpoint: 'https://mock-registry.api.local'
  },
  
  auth: {
    method: 'mock',
    endpoint: 'http://localhost:3001/auth',
    clientId: 'mock-client-id'
  },
  
  timeouts: {
    upload: 30000,      // 30 seconds
    training: 60000,    // 60 seconds  
    deployment: 30000   // 30 seconds
  },
  
  // Use mocks for local development
  useMocks: true,
  
  // Test data paths
  testData: {
    sampleImages: './tests/data/sample-images',
    mockResponses: './tests/fixtures/mock-responses'
  }
};

export default config;
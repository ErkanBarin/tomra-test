// T1 test environment configuration
export const config = {
  environment: 't1',
  baseURL: 'https://tomra-mlops-t1.azurewebsites.net',
  
  azure: {
    storageAccount: process.env.AZURE_STORAGE_ACCOUNT || 'tomratest',
    containerName: process.env.AZURE_CONTAINER || 'uploads',
    mlWorkspace: process.env.AZURE_ML_WORKSPACE || 'tomra-mlops-t1',
    registryEndpoint: process.env.AZURE_REGISTRY_ENDPOINT || 'https://tomra-mlops-t1.ml.azure.com'
  },
  
  auth: {
    method: process.env.AUTH_METHOD || 'oauth',
    endpoint: process.env.AUTH_ENDPOINT || 'https://login.microsoftonline.com/tomra-tenant',
    clientId: process.env.AUTH_CLIENT_ID || ''
  },
  
  timeouts: {
    upload: 60000,      // 60 seconds
    training: 300000,   // 5 minutes
    deployment: 120000  // 2 minutes
  },
  
  // Use real Azure for T1 but with controlled test data
  useMocks: process.env.USE_MOCKS === 'true',
  
  // Test data paths
  testData: {
    sampleImages: './tests/data/sample-images',
    mockResponses: './tests/fixtures/mock-responses'
  }
};

export default config;
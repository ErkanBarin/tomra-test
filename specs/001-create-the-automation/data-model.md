# Data Model & Entity Definitions

## Core Entities

### TestImageDataset
**Purpose**: Standardized food images used across test scenarios  
**Storage**: `tests/data/sample-images/` directory  
**Schema**:
```javascript
{
  filename: string,           // e.g., "tomato-001.jpg"
  size: number,              // bytes, must be < 1MB
  mimeType: string,          // "image/jpeg", "image/png"
  dimensions: {              // pixel dimensions
    width: number,
    height: number
  },
  classification: string,     // "tomato", "apple", "mixed"
  purpose: string            // "upload-test", "classification-test"
}
```
**Validation Rules**:
- File size must be < 1MB for CI performance
- Only JPEG/PNG formats supported
- Minimum dimensions: 224x224 pixels
- Filename must match pattern: `{food}-{variant}.{ext}`

**State Transitions**: Static files, no state changes

### MockTrainingMetrics
**Purpose**: Simulated Azure ML metrics with F1 score ≥ 0.92 for training validation  
**Storage**: `tests/fixtures/mock-responses/training-metrics.json`  
**Schema**:
```javascript
{
  job_id: string,            // UUID format
  status: string,            // "queued" | "running" | "succeeded" | "failed"
  metrics: {
    f1_score: number,        // Must be ≥ 0.92 for test pass
    accuracy: number,        // 0.0 to 1.0
    precision: number,       // 0.0 to 1.0
    recall: number,          // 0.0 to 1.0
    loss: number            // Training loss value
  },
  duration: number,          // seconds
  timestamp: string          // ISO 8601 format
}
```
**Validation Rules**:
- F1 score must be ≥ 0.92 for acceptance criteria
- Status transitions: queued → running → succeeded/failed
- Metrics only present when status is "succeeded"

**State Transitions**:
```
queued → running → succeeded (with metrics)
queued → running → failed (with error)
```

### TestModelArtifacts
**Purpose**: Sample model files and metadata for deployment testing  
**Storage**: `tests/fixtures/model-artifacts/`  
**Schema**:
```javascript
{
  model_id: string,          // UUID format
  name: string,              // "food-classifier-v1.2"
  version: string,           // Semantic versioning
  framework: string,         // "pytorch", "tensorflow"
  artifacts: {
    model_file: string,      // Path to .pkl/.pt/.pb file
    metadata: string,        // Path to metadata.json
    requirements: string     // Path to requirements.txt
  },
  deployment_status: string, // "registered" | "deployed" | "archived"
  created_at: string,        // ISO 8601 timestamp
  tags: object              // Key-value pairs for categorization
}
```
**Validation Rules**:
- Model file must exist and be < 10MB for test performance
- Version must follow semantic versioning (MAJOR.MINOR.PATCH)
- Required artifacts: model file, metadata, requirements

**State Transitions**:
```
registered → deployed → archived
registered → archived (skip deployment)
```

### EnvironmentConfigurations
**Purpose**: Test environment settings for different deployment targets  
**Storage**: `config/env.{environment}.mjs`  
**Schema**:
```javascript
{
  environment: string,       // "local", "t1", "staging", "prod"
  baseURL: string,          // Platform base URL
  azure: {
    storageAccount: string,  // Azure storage account name
    containerName: string,   // Blob container for uploads
    mlWorkspace: string,     // Azure ML workspace name
    registryEndpoint: string // Model registry API endpoint
  },
  auth: {
    method: string,          // "mock" | "oauth" | "key"
    endpoint: string,        // Auth service URL
    clientId: string        // OAuth client ID (if applicable)
  },
  timeouts: {
    upload: number,          // Upload timeout in ms
    training: number,        // Training job timeout in ms
    deployment: number       // Deployment timeout in ms
  }
}
```
**Validation Rules**:
- All URLs must be valid and reachable
- Timeouts must be reasonable for CI budget (≤10 min total)
- Azure resource names must follow naming conventions

### TestResults
**Purpose**: Execution reports, browser traces, and failure artifacts  
**Storage**: `test-results/` and `playwright-report/` directories  
**Schema**:
```javascript
{
  run_id: string,            // UUID for test run
  timestamp: string,         // ISO 8601 start time
  environment: string,       // Test environment used
  browser: string,           // "chromium", "firefox", "webkit"
  results: {
    total: number,           // Total tests executed
    passed: number,          // Successful tests
    failed: number,          // Failed tests
    skipped: number          // Skipped tests
  },
  duration: number,          // Total execution time in ms
  artifacts: {
    html_report: string,     // Path to HTML report
    traces: string[],        // Paths to trace files
    screenshots: string[],   // Paths to failure screenshots
    videos: string[]         // Paths to test videos
  }
}
```
**Validation Rules**:
- Total duration must be ≤ 10 minutes for CI compliance
- All artifact paths must be valid and accessible
- Failed tests must have associated traces/screenshots

### AuthenticationTokens
**Purpose**: Test-specific auth stubs and session management  
**Storage**: `tests/fixtures/auth-stubs.json`  
**Schema**:
```javascript
{
  user_type: string,         // "qa_engineer", "admin", "readonly"
  credentials: {
    username: string,        // Test user identifier
    password: string,        // Hashed test password
    token: string,           // JWT or session token
    expires_at: string       // Token expiration time
  },
  permissions: string[],     // Array of allowed actions
  azure_access: {
    storage_sas: string,     // SAS token for blob access
    ml_endpoint: string,     // Azure ML service endpoint
    registry_key: string     // Model registry access key
  }
}
```
**Validation Rules**:
- Tokens must not be real production credentials
- Expiration times must be appropriate for test duration
- Permissions must align with test scenarios

## Relationships

### Entity Relationships
```
TestImageDataset → MockTrainingMetrics (via training job)
MockTrainingMetrics → TestModelArtifacts (via successful training)
TestModelArtifacts → EnvironmentConfigurations (deployment target)
EnvironmentConfigurations → AuthenticationTokens (auth method)
All entities → TestResults (execution tracking)
```

### Data Flow Patterns
1. **Upload Flow**: TestImageDataset → Azure Blob → Verification
2. **Training Flow**: TestImageDataset → MockTrainingMetrics → Status Polling
3. **Registry Flow**: TestModelArtifacts → Registry API → Deployment Status
4. **Auth Flow**: AuthenticationTokens → Session → Authorized Actions

## Validation & Constraints

### Cross-Entity Validation
- Training jobs can only reference existing image datasets
- Model artifacts must have corresponding successful training metrics
- Deployment targets must exist in environment configuration
- Auth tokens must have appropriate permissions for test actions

### Performance Constraints
- Total test data size < 50MB for CI performance
- Mock response times < 100ms for realistic simulation
- Artifact cleanup within 24 hours of test completion

### Security Constraints
- No production credentials in any test entity
- All auth tokens must be clearly marked as test data
- Sensitive data must be excluded from version control

---
*Generated on October 1, 2025 for Feature 001-create-the-automation*
# Azure ML Job Status Contract

## Overview
Contract for monitoring Azure ML training job status and retrieving metrics through the Azure ML REST API. Used for truth pairing validation after training job submission.

## Endpoint Details
**Method**: GET  
**URL Pattern**: `https://{region}.api.azureml.ms/v1.0/subscriptions/{subscription}/resourceGroups/{resource_group}/providers/Microsoft.MachineLearningServices/workspaces/{workspace}/jobs/{job_id}`  
**Authentication**: Azure AD bearer token or service principal

## Request Schema
```javascript
// Headers
{
  "Authorization": "Bearer {azure_ad_token}",
  "Content-Type": "application/json",
  "x-ms-client-request-id": "{uuid}",
  "User-Agent": "Tomra-MLOPS-Test-Suite/1.0"
}

// Query Parameters
{
  "api-version": "2022-10-01"
}
```

## Response Schema

### Job Running Response (200 OK)
```javascript
{
  "id": "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.MachineLearningServices/workspaces/{ws}/jobs/{job_id}",
  "name": "{job_id}",
  "type": "Microsoft.MachineLearningServices/workspaces/jobs",
  "properties": {
    "status": "Running",
    "createdDateTime": "2025-10-01T10:30:00.000Z",
    "startDateTime": "2025-10-01T10:31:15.000Z",
    "jobType": "Command",
    "displayName": "food-classification-training",
    "experiment": {
      "name": "food-classification"
    },
    "compute": {
      "target": "cpu-cluster",
      "instanceType": "Standard_DS3_v2"
    },
    "environment": {
      "name": "pytorch-env",
      "version": "1.0"
    }
  }
}
```

### Job Completed Response (200 OK)
```javascript
{
  "id": "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.MachineLearningServices/workspaces/{ws}/jobs/{job_id}",
  "name": "{job_id}",
  "type": "Microsoft.MachineLearningServices/workspaces/jobs", 
  "properties": {
    "status": "Completed",
    "createdDateTime": "2025-10-01T10:30:00.000Z",
    "startDateTime": "2025-10-01T10:31:15.000Z",
    "endDateTime": "2025-10-01T10:45:30.000Z",
    "jobType": "Command",
    "displayName": "food-classification-training",
    "experiment": {
      "name": "food-classification"  
    },
    "outputs": {
      "model": {
        "path": "azureml://datastores/workspaceblobstore/paths/outputs/model.pkl"
      }
    },
    "services": {
      "Studio": {
        "endpoint": "https://ml.azure.com/runs/{job_id}",
        "type": "Studio"
      }
    }
  }
}
```

### Job Metrics Response (200 OK)
```javascript
// Separate endpoint: GET .../jobs/{job_id}/metrics
{
  "metrics": {
    "f1_score": 0.94,
    "accuracy": 0.91,
    "precision": 0.93,
    "recall": 0.95,
    "training_loss": 0.15,
    "validation_loss": 0.18
  },
  "step": 100,
  "timestamp": "2025-10-01T10:45:00.000Z"
}
```

### Job Failed Response (200 OK)
```javascript
{
  "id": "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.MachineLearningServices/workspaces/{ws}/jobs/{job_id}",
  "name": "{job_id}",
  "properties": {
    "status": "Failed",
    "createdDateTime": "2025-10-01T10:30:00.000Z",
    "startDateTime": "2025-10-01T10:31:15.000Z",
    "endDateTime": "2025-10-01T10:35:00.000Z",
    "error": {
      "code": "UserError",
      "message": "Training script failed with exit code 1",
      "details": [
        {
          "code": "ScriptExecutionError",
          "message": "FileNotFoundError: training_data.csv not found"
        }
      ]
    }
  }
}
```

### Job Not Found Response (404 Not Found)
```javascript
{
  "error": {
    "code": "JobNotFound",
    "message": "Job with id '{job_id}' was not found.",
    "details": []
  }
}
```

### Authentication Error (401 Unauthorized)
```javascript
{
  "error": {
    "code": "Unauthorized", 
    "message": "Authentication failed. The token is invalid or expired.",
    "details": []
  }
}
```

## Test Scenarios

### Scenario 1: Job Status Polling
```javascript
// Given: Training job submitted via UI
// When: GET request for job status
// Then: Returns current status and progress
expect(response.status).toBe(200);
expect(response.body.properties.status).toMatch(/^(Queued|Running|Completed|Failed)$/);
expect(response.body.properties.jobType).toBe('Command');
```

### Scenario 2: Completed Job with Metrics
```javascript
// Given: Job completed successfully
// When: GET request for job status and metrics
// Then: Status is Completed and metrics meet criteria
expect(response.body.properties.status).toBe('Completed');
expect(response.body.properties.endDateTime).toBeDefined();

// Fetch metrics separately
const metricsResponse = await azureML.getJobMetrics(jobId);
expect(metricsResponse.metrics.f1_score).toBeGreaterThanOrEqual(0.92);
```

### Scenario 3: Job Failure Handling
```javascript
// Given: Job that fails during execution
// When: GET request for job status
// Then: Status is Failed with error details
expect(response.body.properties.status).toBe('Failed');
expect(response.body.properties.error).toBeDefined();
expect(response.body.properties.error.code).toBeTruthy();
```

## Contract Tests

### Test Implementation
```javascript
// tests/contracts/azureml-job-status.contract.test.mjs
import { test, expect } from '@playwright/test';
import { AzureMLUtils } from '../../utils/azure.mjs';

test.describe('Azure ML Job Status Contract', () => {
  let azureML;

  test.beforeEach(() => {
    azureML = new AzureMLUtils({
      subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
      resourceGroup: process.env.AZURE_RESOURCE_GROUP,
      workspace: process.env.AZURE_ML_WORKSPACE
    });
  });

  test('should get job status for running job', async () => {
    // This test will initially fail - no implementation yet
    const jobId = 'test-job-12345';
    const response = await azureML.getJobStatus(jobId);
    
    expect(response.status).toBe(200);
    expect(response.body.properties.status).toMatch(/^(Queued|Running|Completed|Failed)$/);
    expect(response.body.name).toBe(jobId);
  });

  test('should get metrics for completed job', async () => {
    const jobId = 'completed-job-67890';
    const statusResponse = await azureML.getJobStatus(jobId);
    
    if (statusResponse.body.properties.status === 'Completed') {
      const metricsResponse = await azureML.getJobMetrics(jobId);
      expect(metricsResponse.metrics).toBeDefined();
      expect(metricsResponse.metrics.f1_score).toBeGreaterThan(0);
    }
  });

  test('should handle job not found', async () => {
    const nonExistentJobId = 'does-not-exist-999';
    const response = await azureML.getJobStatus(nonExistentJobId);
    
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('JobNotFound');
  });

  test('should handle authentication failure', async () => {
    const azureMLInvalid = new AzureMLUtils({ 
      subscriptionId: 'invalid',
      resourceGroup: 'invalid',
      workspace: 'invalid'
    });
    
    const response = await azureMLInvalid.getJobStatus('test-job');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('Unauthorized');
  });
});
```

## Mock Strategy for CI

### Mock Response Templates
```javascript
// tests/fixtures/mock-responses/azureml-job-responses.json
{
  "running": {
    "properties": {
      "status": "Running",
      "createdDateTime": "2025-10-01T10:30:00.000Z",
      "startDateTime": "2025-10-01T10:31:15.000Z",
      "jobType": "Command"
    }
  },
  "completed": {
    "properties": {
      "status": "Completed", 
      "endDateTime": "2025-10-01T10:45:30.000Z"
    }
  },
  "metrics": {
    "f1_score": 0.94,
    "accuracy": 0.91,
    "precision": 0.93,
    "recall": 0.95
  }
}
```

## Performance Requirements
- Response time: < 1 second for status checks
- Polling interval: 5-10 seconds for running jobs
- Timeout: 30 seconds maximum for individual requests
- Rate limiting: Respect Azure ML API throttling (100 requests/minute)

## Security Requirements
- Use Azure AD authentication with appropriate scopes
- Store credentials securely (Azure Key Vault or GitHub Secrets)
- Implement token refresh for long-running operations
- Never log authentication tokens or sensitive workspace details

---
*Contract Version: 1.0 | Generated: October 1, 2025*
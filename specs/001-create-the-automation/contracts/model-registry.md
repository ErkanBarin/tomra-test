# Model Registry API Contract

## Overview
Contract for interacting with Azure ML Model Registry to verify model registration and deployment status. Used for truth pairing validation after model deployment through the UI.

## Endpoint Details
**Method**: GET  
**URL Pattern**: `https://{region}.api.azureml.ms/v1.0/subscriptions/{subscription}/resourceGroups/{resource_group}/providers/Microsoft.MachineLearningServices/workspaces/{workspace}/models/{model_name}/versions/{version}`  
**Authentication**: Azure AD bearer token

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

### Model Found Response (200 OK)
```javascript
{
  "id": "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.MachineLearningServices/workspaces/{ws}/models/{model_name}/versions/{version}",
  "name": "{version}",
  "type": "Microsoft.MachineLearningServices/workspaces/models/versions",
  "properties": {
    "modelName": "food-classification-model",
    "version": "1.0.0",
    "description": "Food classification model trained on Tomra dataset",
    "tags": {
      "framework": "pytorch",
      "task": "classification",
      "domain": "food"
    },
    "properties": {
      "accuracy": "0.91",
      "f1_score": "0.94",
      "training_job_id": "job-12345-67890"
    },
    "modelUri": "azureml://locations/eastus/workspaces/{ws}/models/{model_name}/versions/{version}",
    "createdTime": "2025-10-01T10:45:30.000Z",
    "modifiedTime": "2025-10-01T10:45:30.000Z",
    "stage": "Production"
  }
}
```

### Model List Response (200 OK)
```javascript
// GET .../models (without specific version)
{
  "value": [
    {
      "id": "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.MachineLearningServices/workspaces/{ws}/models/{model_name}/versions/1.0.0",
      "name": "1.0.0",
      "properties": {
        "modelName": "food-classification-model",
        "version": "1.0.0",
        "stage": "Production",
        "createdTime": "2025-10-01T10:45:30.000Z"
      }
    },
    {
      "id": "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.MachineLearningServices/workspaces/{ws}/models/{model_name}/versions/0.9.0", 
      "name": "0.9.0",
      "properties": {
        "modelName": "food-classification-model",
        "version": "0.9.0",
        "stage": "Archived",
        "createdTime": "2025-09-15T14:20:00.000Z"
      }
    }
  ],
  "nextLink": null
}
```

### Model Not Found Response (404 Not Found)
```javascript
{
  "error": {
    "code": "ModelNotFound",
    "message": "Model '{model_name}' version '{version}' was not found in workspace '{workspace}'.",
    "details": []
  }
}
```

### Unauthorized Access Response (403 Forbidden)
```javascript
{
  "error": {
    "code": "Forbidden",
    "message": "User does not have access to model registry in workspace '{workspace}'.",
    "details": [
      {
        "code": "InsufficientPermissions",
        "message": "Required role: Machine Learning Workspace Contributor"
      }
    ]
  }
}
```

## Model Deployment Status

### Deployment Endpoint Details
**Method**: GET  
**URL Pattern**: `https://{region}.api.azureml.ms/v1.0/subscriptions/{subscription}/resourceGroups/{resource_group}/providers/Microsoft.MachineLearningServices/workspaces/{workspace}/onlineEndpoints/{endpoint_name}/deployments/{deployment_name}`

### Deployment Response (200 OK)
```javascript
{
  "id": "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.MachineLearningServices/workspaces/{ws}/onlineEndpoints/{endpoint}/deployments/{deployment}",
  "name": "{deployment_name}",
  "properties": {
    "endpointName": "food-classifier-endpoint",
    "model": "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.MachineLearningServices/workspaces/{ws}/models/food-classification-model/versions/1.0.0",
    "instanceType": "Standard_DS3_v2",
    "instanceCount": 1,
    "environmentId": "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.MachineLearningServices/workspaces/{ws}/environments/pytorch-env/versions/1.0",
    "provisioningState": "Succeeded",
    "deploymentStatus": "Healthy",
    "trafficPercentage": 100,
    "createdTime": "2025-10-01T11:00:00.000Z",
    "scoringUri": "https://{endpoint}.{region}.inference.ml.azure.com/score"
  }
}
```

## Test Scenarios

### Scenario 1: Model Registration Verification
```javascript
// Given: Model registered via UI after training
// When: GET request for specific model version
// Then: Model exists with correct metadata
expect(response.status).toBe(200);
expect(response.body.properties.modelName).toBe('food-classification-model');
expect(response.body.properties.stage).toBe('Production');
expect(parseFloat(response.body.properties.properties.f1_score)).toBeGreaterThanOrEqual(0.92);
```

### Scenario 2: Model Deployment Status Check
```javascript
// Given: Model deployed to endpoint via UI
// When: GET request for deployment status
// Then: Deployment is healthy and serving traffic
expect(response.status).toBe(200);
expect(response.body.properties.provisioningState).toBe('Succeeded');
expect(response.body.properties.deploymentStatus).toBe('Healthy');
expect(response.body.properties.trafficPercentage).toBeGreaterThan(0);
```

### Scenario 3: Model Version Listing
```javascript
// Given: Multiple model versions exist
// When: GET request for model versions
// Then: Returns list with latest version first
expect(response.status).toBe(200);
expect(response.body.value).toBeInstanceOf(Array);
expect(response.body.value.length).toBeGreaterThan(0);

// Check versions are sorted by creation time (latest first)
const versions = response.body.value;
for (let i = 1; i < versions.length; i++) {
  const currentTime = new Date(versions[i-1].properties.createdTime);
  const nextTime = new Date(versions[i].properties.createdTime);
  expect(currentTime.getTime()).toBeGreaterThanOrEqual(nextTime.getTime());
}
```

## Contract Tests

### Test Implementation
```javascript
// tests/contracts/model-registry.contract.test.mjs
import { test, expect } from '@playwright/test';
import { ModelRegistryUtils } from '../../utils/azure.mjs';

test.describe('Model Registry API Contract', () => {
  let modelRegistry;

  test.beforeEach(() => {
    modelRegistry = new ModelRegistryUtils({
      subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
      resourceGroup: process.env.AZURE_RESOURCE_GROUP,
      workspace: process.env.AZURE_ML_WORKSPACE
    });
  });

  test('should get model version details', async () => {
    // This test will initially fail - no implementation yet
    const modelName = 'food-classification-model';
    const version = '1.0.0';
    const response = await modelRegistry.getModelVersion(modelName, version);
    
    expect(response.status).toBe(200);
    expect(response.body.properties.modelName).toBe(modelName);
    expect(response.body.properties.version).toBe(version);
    expect(response.body.properties.stage).toMatch(/^(Development|Staging|Production|Archived)$/);
  });

  test('should list all model versions', async () => {
    const modelName = 'food-classification-model';
    const response = await modelRegistry.listModelVersions(modelName);
    
    expect(response.status).toBe(200);
    expect(response.body.value).toBeInstanceOf(Array);
    if (response.body.value.length > 0) {
      expect(response.body.value[0].properties.modelName).toBe(modelName);
    }
  });

  test('should get deployment status', async () => {
    const endpointName = 'food-classifier-endpoint';
    const deploymentName = 'production-deployment';
    const response = await modelRegistry.getDeploymentStatus(endpointName, deploymentName);
    
    expect(response.status).toBe(200);
    expect(response.body.properties.provisioningState).toMatch(/^(Creating|Succeeded|Failed|Deleting)$/);
    expect(response.body.properties.deploymentStatus).toMatch(/^(Healthy|Unhealthy|Unknown)$/);
  });

  test('should handle model not found', async () => {
    const nonExistentModel = 'does-not-exist-model';
    const version = '1.0.0';
    const response = await modelRegistry.getModelVersion(nonExistentModel, version);
    
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('ModelNotFound');
  });

  test('should handle unauthorized access', async () => {
    const invalidRegistry = new ModelRegistryUtils({
      subscriptionId: 'invalid',
      resourceGroup: 'invalid', 
      workspace: 'invalid'
    });
    
    const response = await invalidRegistry.getModelVersion('test-model', '1.0.0');
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('Forbidden');
  });
});
```

## Mock Strategy for CI

### Mock Response Templates
```javascript
// tests/fixtures/mock-responses/model-registry-responses.json
{
  "model_found": {
    "properties": {
      "modelName": "food-classification-model",
      "version": "1.0.0",
      "stage": "Production",
      "properties": {
        "f1_score": "0.94",
        "accuracy": "0.91"
      },
      "createdTime": "2025-10-01T10:45:30.000Z"
    }
  },
  "deployment_healthy": {
    "properties": {
      "provisioningState": "Succeeded",
      "deploymentStatus": "Healthy",
      "trafficPercentage": 100,
      "scoringUri": "https://test-endpoint.eastus.inference.ml.azure.com/score"
    }
  }
}
```

## Performance Requirements
- Response time: < 2 seconds for model lookup
- Pagination: Support for large model lists (>100 versions)
- Caching: Cache model metadata for 5 minutes to reduce API calls
- Rate limiting: Respect Azure ML API limits (100 requests/minute)

## Security Requirements
- Use Azure AD authentication with MLWorkspace Contributor role minimum
- Validate model access permissions before deployment operations
- Implement secure token storage and refresh mechanisms
- Never expose model artifacts or scoring keys in logs

---
*Contract Version: 1.0 | Generated: October 1, 2025*
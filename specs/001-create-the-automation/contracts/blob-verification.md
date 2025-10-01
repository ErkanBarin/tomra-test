# Azure Blob Storage Verification Contract

## Overview
Contract for verifying image uploads to Azure Blob Storage using HEAD requests to confirm blob existence and metadata without downloading content.

## Endpoint Details
**Method**: HEAD  
**URL Pattern**: `https://{storage_account}.blob.core.windows.net/{container}/{blob_name}`  
**Authentication**: SAS token or Azure AD bearer token  

## Request Schema
```javascript
// Headers
{
  "Authorization": "Bearer {token}" | "SharedAccessSignature {sas_token}",
  "x-ms-version": "2021-08-06",
  "x-ms-client-request-id": "{uuid}",  // Optional: for request tracking
  "User-Agent": "Tomra-MLOPS-Test-Suite/1.0"
}

// Query Parameters (if using SAS)
{
  "sv": "2021-08-06",        // Service version
  "ss": "b",                 // Services (blob)
  "srt": "o",                // Resource types (object)
  "sp": "r",                 // Permissions (read)
  "se": "2025-12-31T23:59:59Z", // Expiry
  "st": "2025-01-01T00:00:00Z", // Start time
  "spr": "https",            // Protocol
  "sig": "{signature}"       // Signature
}
```

## Response Schema

### Success Response (200 OK)
```javascript
// Headers
{
  "x-ms-blob-type": "BlockBlob",
  "x-ms-lease-status": "unlocked",
  "x-ms-lease-state": "available",
  "Content-Length": "1048576",        // File size in bytes
  "Content-Type": "image/jpeg",
  "Last-Modified": "Wed, 01 Oct 2025 10:30:00 GMT",
  "ETag": "\"0x8D9A1B2C3D4E5F6\"",
  "x-ms-creation-time": "Wed, 01 Oct 2025 10:29:45 GMT",
  "x-ms-blob-content-md5": "rL0Y20zC+Fzt72VPzMSk2A==",
  "x-ms-server-encrypted": "true"
}

// Body: Empty (HEAD request)
```

### Not Found Response (404 Not Found)
```javascript
// Headers
{
  "x-ms-error-code": "BlobNotFound",
  "Content-Type": "application/xml"
}

// Body
{
  "error": {
    "code": "BlobNotFound",
    "message": "The specified blob does not exist."
  }
}
```

### Authentication Error (403 Forbidden)
```javascript
// Headers
{
  "x-ms-error-code": "AuthenticationFailed",
  "Content-Type": "application/xml"
}

// Body
{
  "error": {
    "code": "AuthenticationFailed", 
    "message": "Server failed to authenticate the request."
  }
}
```

## Test Scenarios

### Scenario 1: Successful Blob Verification
```javascript
// Given: Image uploaded via UI
// When: HEAD request sent to blob URL
// Then: Response status 200 with correct headers
expect(response.status).toBe(200);
expect(response.headers['content-type']).toMatch(/^image\/(jpeg|png)$/);
expect(parseInt(response.headers['content-length'])).toBeGreaterThan(0);
```

### Scenario 2: Blob Not Found
```javascript
// Given: Non-existent blob name
// When: HEAD request sent
// Then: Response status 404 with error
expect(response.status).toBe(404);
expect(response.headers['x-ms-error-code']).toBe('BlobNotFound');
```

### Scenario 3: Authentication Failure
```javascript
// Given: Invalid or expired SAS token
// When: HEAD request sent
// Then: Response status 403 with auth error
expect(response.status).toBe(403);
expect(response.headers['x-ms-error-code']).toBe('AuthenticationFailed');
```

## Contract Tests

### Test Implementation
```javascript
// tests/contracts/blob-verification.contract.test.mjs
import { test, expect } from '@playwright/test';
import { AzureUtils } from '../../utils/azure.mjs';

test.describe('Azure Blob Storage Verification Contract', () => {
  let azureUtils;

  test.beforeEach(() => {
    azureUtils = new AzureUtils(process.env.AZURE_STORAGE_ACCOUNT);
  });

  test('should verify blob exists with HEAD request', async () => {
    // This test will initially fail - no implementation yet
    const blobName = 'test-image.jpg';
    const response = await azureUtils.verifyBlobExists(blobName);
    
    expect(response.status).toBe(200);
    expect(response.headers['x-ms-blob-type']).toBe('BlockBlob');
    expect(response.headers['content-type']).toMatch(/^image\//);
  });

  test('should handle blob not found', async () => {
    const nonExistentBlob = 'does-not-exist.jpg';
    const response = await azureUtils.verifyBlobExists(nonExistentBlob);
    
    expect(response.status).toBe(404);
    expect(response.headers['x-ms-error-code']).toBe('BlobNotFound');
  });

  test('should handle authentication failure', async () => {
    const azureUtilsInvalid = new AzureUtils('invalid-account');
    const response = await azureUtilsInvalid.verifyBlobExists('test.jpg');
    
    expect(response.status).toBe(403);
    expect(response.headers['x-ms-error-code']).toBe('AuthenticationFailed');
  });
});
```

## Performance Requirements
- Response time: < 500ms for blob verification
- Timeout: 5 seconds maximum before failure
- Retry logic: 3 attempts with exponential backoff
- Rate limiting: Respect Azure Blob Storage throttling

## Security Requirements
- Use HTTPS only for all requests
- SAS tokens must have minimal permissions (read-only)
- Tokens must have reasonable expiration times (≤24 hours for tests)
- Never log full SAS tokens or bearer tokens

---
*Contract Version: 1.0 | Generated: October 1, 2025*
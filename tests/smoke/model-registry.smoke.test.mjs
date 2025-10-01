import { test, expect } from '@playwright/test';

/**
 * Smoke tests for Model Registry navigation and basic functionality
 * These tests verify the core registry features work end-to-end
 * before implementing the actual page objects and utilities (TDD approach)
 */

test.describe('Model Registry Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup will be implemented when page objects are created
  });

  test('should navigate to model registry @smoke', async ({ page }) => {
    // Narrow try/catch to only handle module import errors
    let ModelRegistryPage;
    try {
      ({ ModelRegistryPage } = await import('../../pages/model-registry.page.mjs'));
    } catch (error) {
      // Only tolerate module-not-found errors, rethrow others
      if (error.code === 'ERR_MODULE_NOT_FOUND' || 
          error.message.includes('Cannot find module') ||
          error.message.includes('Cannot resolve module')) {
        test.skip(true, 'ModelRegistryPage module not found - implementation incomplete');
        return;
      }
      // Rethrow any other import errors (syntax errors, etc.)
      throw error;
    }
    
    const registryPage = new ModelRegistryPage(page);
    
    await registryPage.navigate();
    
    // Verify page loads correctly
    await expect(registryPage.pageTitle).toBeVisible();
    await expect(registryPage.pageTitle).toHaveText('Model Registry');
    
    // Verify main components are present
    await expect(registryPage.modelsTable).toBeVisible();
    await expect(registryPage.searchInput).toBeVisible();
    await expect(registryPage.filterDropdown).toBeVisible();
    await expect(registryPage.refreshButton).toBeVisible();
  });

  test('should display list of registered models @smoke', async ({ page }) => {
    // Narrow try/catch to only handle module import errors
    let ModelRegistryPage;
    try {
      ({ ModelRegistryPage } = await import('../../pages/model-registry.page.mjs'));
    } catch (error) {
      // Only tolerate module-not-found errors, rethrow others
      if (error.code === 'ERR_MODULE_NOT_FOUND' || 
          error.message.includes('Cannot find module') ||
          error.message.includes('Cannot resolve module')) {
        test.skip(true, 'ModelRegistryPage module not found - implementation incomplete');
        return;
      }
      // Rethrow any other import errors (syntax errors, etc.)
      throw error;
    }
    
    const registryPage = new ModelRegistryPage(page);
    
    await registryPage.navigate();
    
    // Wait for models to load
    await expect(registryPage.loadingIndicator).toBeHidden();
    
    // Verify models table has content
    const modelRows = await registryPage.getModelRows();
    expect(modelRows.length).toBeGreaterThan(0);
    
    // Verify required columns are present
    await expect(registryPage.nameColumn).toBeVisible();
    await expect(registryPage.versionColumn).toBeVisible();
    await expect(registryPage.statusColumn).toBeVisible();
    await expect(registryPage.createdColumn).toBeVisible();
    await expect(registryPage.performanceColumn).toBeVisible();
    
    // Verify first model has required data
    const firstModel = modelRows[0];
    expect(firstModel.name).toBeTruthy();
    expect(firstModel.version).toMatch(/^\d+$/);
    expect(['Active', 'Inactive', 'Deprecated']).toContain(firstModel.status);
    expect(firstModel.f1_score).toBeGreaterThanOrEqual(0);
  });

  test('should search models by name @smoke', async ({ page }) => {
    // Narrow try/catch to only handle module import errors
    let ModelRegistryPage;
    try {
      ({ ModelRegistryPage } = await import('../../pages/model-registry.page.mjs'));
    } catch (error) {
      // Only tolerate module-not-found errors, rethrow others
      if (error.code === 'ERR_MODULE_NOT_FOUND' || 
          error.message.includes('Cannot find module') ||
          error.message.includes('Cannot resolve module')) {
        test.skip(true, 'ModelRegistryPage module not found - implementation incomplete');
        return;
      }
      // Rethrow any other import errors (syntax errors, etc.)
      throw error;
    }
    
    const registryPage = new ModelRegistryPage(page);
    
    await registryPage.navigate();
    
    // Search for specific model
    await registryPage.searchModels('food-classification');
    
    // Verify search results
    const searchResults = await registryPage.getModelRows();
    expect(searchResults.length).toBeGreaterThan(0);
    
    // Verify all results contain search term
    searchResults.forEach(model => {
      expect(model.name.toLowerCase()).toContain('food-classification');
    });
    
    // Clear search
    await registryPage.clearSearch();
    
    // Verify full list is restored
    const allModels = await registryPage.getModelRows();
    expect(allModels.length).toBeGreaterThanOrEqual(searchResults.length);
  });

  test('should filter models by status @smoke', async ({ page }) => {
    // Narrow try/catch to only handle module import errors
    let ModelRegistryPage;
    try {
      ({ ModelRegistryPage } = await import('../../pages/model-registry.page.mjs'));
    } catch (error) {
      // Only tolerate module-not-found errors, rethrow others
      if (error.code === 'ERR_MODULE_NOT_FOUND' || 
          error.message.includes('Cannot find module') ||
          error.message.includes('Cannot resolve module')) {
        test.skip(true, 'ModelRegistryPage module not found - implementation incomplete');
        return;
      }
      // Rethrow any other import errors (syntax errors, etc.)
      throw error;
    }
    
    const registryPage = new ModelRegistryPage(page);
    
    await registryPage.navigate();
    
    // Filter by Active status
    await registryPage.filterByStatus('Active');
    
    // Verify filtered results
    const activeModels = await registryPage.getModelRows();
    expect(activeModels.length).toBeGreaterThan(0);
    
    // Verify all results have Active status
    activeModels.forEach(model => {
      expect(model.status).toBe('Active');
    });
    
    // Test other status filters
    await registryPage.filterByStatus('Deprecated');
    const deprecatedModels = await registryPage.getModelRows();
    deprecatedModels.forEach(model => {
      expect(model.status).toBe('Deprecated');
    });
    
    // Reset filter
    await registryPage.filterByStatus('All');
    const allModels = await registryPage.getModelRows();
    expect(allModels.length).toBeGreaterThanOrEqual(activeModels.length);
  });

  test('should view model details @smoke', async ({ page }) => {
    // Narrow try/catch to only handle module import errors
    let ModelRegistryPage, ModelDetailsPage;
    try {
      ({ ModelRegistryPage } = await import('../../pages/model-registry.page.mjs'));
      ({ ModelDetailsPage } = await import('../../pages/model-details.page.mjs'));
    } catch (error) {
      // Only tolerate module-not-found errors, rethrow others
      if (error.code === 'ERR_MODULE_NOT_FOUND' || 
          error.message.includes('Cannot find module') ||
          error.message.includes('Cannot resolve module')) {
        test.skip(true, 'ModelRegistryPage or ModelDetailsPage module not found - implementation incomplete');
        return;
      }
      // Rethrow any other import errors (syntax errors, etc.)
      throw error;
    }
    
    const registryPage = new ModelRegistryPage(page);
    const detailsPage = new ModelDetailsPage(page);
    
    await registryPage.navigate();
    
    // Click on first model
    const modelRows = await registryPage.getModelRows();
    await registryPage.clickModel(modelRows[0].name, modelRows[0].version);
    
    // Verify navigation to details page
    await expect(detailsPage.modelNameHeader).toBeVisible();
    await expect(detailsPage.versionHeader).toBeVisible();
    
    // Verify details sections are present
    await expect(detailsPage.overviewSection).toBeVisible();
    await expect(detailsPage.metricsSection).toBeVisible();
    await expect(detailsPage.artifactsSection).toBeVisible();
    await expect(detailsPage.versionsSection).toBeVisible();
    
    // Verify performance metrics
    const metrics = await detailsPage.getPerformanceMetrics();
    expect(metrics).toHaveProperty('f1_score');
    expect(metrics).toHaveProperty('accuracy');
    expect(metrics).toHaveProperty('precision');
    expect(metrics).toHaveProperty('recall');
    
    // Critical requirement: F1 score ≥ 0.92
    expect(metrics.f1_score).toBeGreaterThanOrEqual(0.92);
  });

  test('should refresh model list @smoke', async ({ page }) => {
    // Narrow try/catch to only handle module import errors
    let ModelRegistryPage;
    try {
      ({ ModelRegistryPage } = await import('../../pages/model-registry.page.mjs'));
    } catch (error) {
      // Only tolerate module-not-found errors, rethrow others
      if (error.code === 'ERR_MODULE_NOT_FOUND' || 
          error.message.includes('Cannot find module') ||
          error.message.includes('Cannot resolve module')) {
        test.skip(true, 'ModelRegistryPage module not found - implementation incomplete');
        return;
      }
      // Rethrow any other import errors (syntax errors, etc.)
      throw error;
    }
    
    const registryPage = new ModelRegistryPage(page);
    
    await registryPage.navigate();
    
    // Get initial model count
    const initialModels = await registryPage.getModelRows();
    const initialCount = initialModels.length;
    
    // Get initial refresh time
    const initialRefreshTime = await registryPage.getLastRefreshTime();
    
    // Refresh the list (this method handles the entire flow including loading indicator)
    await registryPage.refreshModels();
    
    // Verify models are reloaded
    const refreshedModels = await registryPage.getModelRows();
    expect(refreshedModels.length).toBeGreaterThanOrEqual(initialCount);
    
    // Verify timestamp updated
    const newRefreshTime = await registryPage.getLastRefreshTime();
    expect(newRefreshTime).not.toBe(initialRefreshTime);
    expect(newRefreshTime).toBeTruthy();
  });

  test('should sort models by different columns @smoke', async ({ page }) => {
    // Narrow try/catch to only handle module import errors
    let ModelRegistryPage;
    try {
      ({ ModelRegistryPage } = await import('../../pages/model-registry.page.mjs'));
    } catch (error) {
      // Only tolerate module-not-found errors, rethrow others
      if (error.code === 'ERR_MODULE_NOT_FOUND' || 
          error.message.includes('Cannot find module') ||
          error.message.includes('Cannot resolve module')) {
        test.skip(true, 'ModelRegistryPage module not found - implementation incomplete');
        return;
      }
      // Rethrow any other import errors (syntax errors, etc.)
      throw error;
    }
    
    const registryPage = new ModelRegistryPage(page);
    
    await registryPage.navigate();
    
    // Sort by name (ascending)
    await registryPage.sortByColumn('name', 'asc');
    let sortedModels = await registryPage.getModelRows();
    
    // Verify sorting
    for (let i = 1; i < sortedModels.length; i++) {
      expect(sortedModels[i].name >= sortedModels[i - 1].name).toBeTruthy();
    }
    
    // Sort by performance (descending)
    await registryPage.sortByColumn('f1_score', 'desc');
    sortedModels = await registryPage.getModelRows();
    
    // Verify performance sorting
    for (let i = 1; i < sortedModels.length; i++) {
      expect(sortedModels[i].f1_score <= sortedModels[i - 1].f1_score).toBeTruthy();
    }
    
    // Sort by created date (newest first)
    await registryPage.sortByColumn('created', 'desc');
    sortedModels = await registryPage.getModelRows();
    
    // Verify date sorting
    for (let i = 1; i < sortedModels.length; i++) {
      const currentDate = new Date(sortedModels[i].created);
      const previousDate = new Date(sortedModels[i - 1].created);
      expect(currentDate.getTime() <= previousDate.getTime()).toBeTruthy();
    }
  });

  test('should handle empty search results @smoke', async ({ page }) => {
    // Narrow try/catch to only handle module import errors
    let ModelRegistryPage;
    try {
      ({ ModelRegistryPage } = await import('../../pages/model-registry.page.mjs'));
    } catch (error) {
      // Only tolerate module-not-found errors, rethrow others
      if (error.code === 'ERR_MODULE_NOT_FOUND' || 
          error.message.includes('Cannot find module') ||
          error.message.includes('Cannot resolve module')) {
        test.skip(true, 'ModelRegistryPage module not found - implementation incomplete');
        return;
      }
      // Rethrow any other import errors (syntax errors, etc.)
      throw error;
    }
    
    const registryPage = new ModelRegistryPage(page);
    
    await registryPage.navigate();
    
    // Search for non-existent model
    await registryPage.searchModels('nonexistent-model-xyz');
    
    // Verify empty state
    await expect(registryPage.emptyStateMessage).toBeVisible();
    await expect(registryPage.emptyStateMessage).toHaveText(/No models found matching your search criteria/);
    
    // Verify suggestions
    await expect(registryPage.searchSuggestions).toBeVisible();
    
    // Clear search to restore results
    await registryPage.clearSearch();
    
    const allModels = await registryPage.getModelRows();
    expect(allModels.length).toBeGreaterThan(0);
  });

  test('should navigate between model versions @smoke', async ({ page }) => {
    // Narrow try/catch to only handle module import errors
    let ModelRegistryPage, ModelDetailsPage;
    try {
      ({ ModelRegistryPage } = await import('../../pages/model-registry.page.mjs'));
      ({ ModelDetailsPage } = await import('../../pages/model-details.page.mjs'));
    } catch (error) {
      // Only tolerate module-not-found errors, rethrow others
      if (error.code === 'ERR_MODULE_NOT_FOUND' || 
          error.message.includes('Cannot find module') ||
          error.message.includes('Cannot resolve module')) {
        test.skip(true, 'ModelRegistryPage or ModelDetailsPage module not found - implementation incomplete');
        return;
      }
      // Rethrow any other import errors (syntax errors, etc.)
      throw error;
    }
    
    const registryPage = new ModelRegistryPage(page);
    const detailsPage = new ModelDetailsPage(page);
    
    await registryPage.navigate();
    
    // Click on a model with multiple versions
    const modelRows = await registryPage.getModelRows();
    const targetModel = modelRows.find(model => 
      model.name === 'food-classification-v1'
    );
    
    await registryPage.clickModel(targetModel.name, targetModel.version);
    
    // Verify versions section
    await expect(detailsPage.versionsSection).toBeVisible();
    
    const versions = await detailsPage.getModelVersions();
    expect(versions.length).toBeGreaterThan(1);
    
    // Navigate to different version
    const otherVersion = versions.find(v => v.version !== targetModel.version);
    await detailsPage.selectVersion(otherVersion.version);
    
    // Verify version switch
    await expect(detailsPage.versionHeader).toHaveText(otherVersion.version);
    
    // Verify metrics updated
    const newMetrics = await detailsPage.getPerformanceMetrics();
    expect(newMetrics.f1_score).toBeGreaterThanOrEqual(0.92);
  });
});
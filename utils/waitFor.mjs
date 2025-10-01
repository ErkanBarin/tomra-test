/**
 * Utility functions for waiting and polling
 * Provides robust polling with timeout and interval controls
 */

/**
 * Generic wait function with predicate and timeout
 * @param {Function} fn - Function to execute and get value from
 * @param {Function} predicate - Function to test the value
 * @param {number} timeoutMs - Maximum time to wait in milliseconds
 * @param {number} intervalMs - Interval between checks in milliseconds
 * @returns {Promise} Resolves with the value when predicate passes
 */
export async function waitFor(fn, predicate, timeoutMs = 60000, intervalMs = 1000) {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const poll = async () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > timeoutMs) {
        reject(new Error(`waitFor timeout after ${timeoutMs}ms`));
        return;
      }
      
      try {
        const value = await fn();
        
        if (predicate(value)) {
          resolve(value);
        } else {
          setTimeout(poll, intervalMs);
        }
      } catch (error) {
        // Continue polling on errors unless timeout reached
        setTimeout(poll, intervalMs);
      }
    };
    
    poll();
  });
}

/**
 * Wait for element to be visible
 * @param {Object} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Resolves when element is visible
 */
export async function waitForVisible(page, selector, timeout = 30000) {
  return waitFor(
    async () => page.locator(selector),
    async (locator) => await locator.isVisible(),
    timeout
  );
}

/**
 * Wait for element to contain text
 * @param {Object} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} text - Expected text
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Resolves when element contains text
 */
export async function waitForText(page, selector, text, timeout = 30000) {
  return waitFor(
    async () => page.locator(selector).textContent(),
    (content) => content && content.includes(text),
    timeout
  );
}

/**
 * Wait for network request to complete
 * @param {Object} page - Playwright page object
 * @param {string|RegExp} urlPattern - URL pattern to match
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Resolves with response
 */
export async function waitForRequest(page, urlPattern, timeout = 30000) {
  return page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Wait with exponential backoff
 * @param {Function} fn - Function to execute
 * @param {Object} options - Options for backoff
 * @returns {Promise} Resolves when function succeeds
 */
export async function waitWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;
  
  let delay = initialDelay;
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }
  
  throw lastError;
}
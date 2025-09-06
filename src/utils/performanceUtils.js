/**
 * Performance Utilities
 * Memory management and performance optimization helpers
 */

/**
 * Object URL Manager
 * Manages object URLs to prevent memory leaks
 */
export class ObjectURLManager {
  constructor() {
    this.urls = new Map();
  }

  /**
   * Create and track an object URL
   * @param {Blob} blob - Blob to create URL for
   * @param {string} key - Unique key for tracking
   * @returns {string} - Object URL
   */
  createURL(blob, key) {
    // Revoke existing URL if key already exists
    if (this.urls.has(key)) {
      this.revokeURL(key);
    }

    const url = URL.createObjectURL(blob);
    this.urls.set(key, url);
    return url;
  }

  /**
   * Get existing object URL
   * @param {string} key - Key to look up
   * @returns {string|null} - Object URL or null
   */
  getURL(key) {
    return this.urls.get(key) || null;
  }

  /**
   * Revoke and remove an object URL
   * @param {string} key - Key to revoke
   */
  revokeURL(key) {
    const url = this.urls.get(key);
    if (url) {
      URL.revokeObjectURL(url);
      this.urls.delete(key);
    }
  }

  /**
   * Revoke all object URLs
   */
  revokeAll() {
    this.urls.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.urls.clear();
  }

  /**
   * Get current URL count
   * @returns {number} - Number of active URLs
   */
  getCount() {
    return this.urls.size;
  }
}

/**
 * Memory Monitor
 * Monitors memory usage and provides warnings
 */
export class MemoryMonitor {
  constructor() {
    this.warnings = {
      high: 100 * 1024 * 1024, // 100MB
      critical: 200 * 1024 * 1024 // 200MB
    };
  }

  /**
   * Check if memory usage is high
   * @returns {Object} - Memory status
   */
  checkMemoryStatus() {
    if (!performance.memory) {
      return { available: false, status: 'unknown' };
    }

    const used = performance.memory.usedJSHeapSize;
    const total = performance.memory.totalJSHeapSize;
    const limit = performance.memory.jsHeapSizeLimit;

    let status = 'normal';
    if (used > this.warnings.critical) {
      status = 'critical';
    } else if (used > this.warnings.high) {
      status = 'high';
    }

    return {
      available: true,
      status,
      used,
      total,
      limit,
      percentage: (used / limit) * 100
    };
  }

  /**
   * Get memory usage in human readable format
   * @returns {string} - Formatted memory usage
   */
  getMemoryUsage() {
    const status = this.checkMemoryStatus();
    if (!status.available) {
      return 'Memory info not available';
    }

    const used = this.formatBytes(status.used);
    const limit = this.formatBytes(status.limit);
    const percentage = status.percentage.toFixed(1);

    return `${used} / ${limit} (${percentage}%)`;
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Bytes to format
   * @returns {string} - Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} - Array of chunks
 */
export function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Process array in chunks with delay
 * @param {Array} array - Array to process
 * @param {Function} processor - Processing function
 * @param {number} chunkSize - Size of each chunk
 * @param {number} delay - Delay between chunks in ms
 * @returns {Promise} - Promise that resolves when all chunks are processed
 */
export async function processInChunks(array, processor, chunkSize = 10, delay = 0) {
  const chunks = chunkArray(array, chunkSize);
  const results = [];

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return results;
}

/**
 * Create a promise that resolves after specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if browser supports required features
 * @returns {Object} - Feature support status
 */
export function checkBrowserSupport() {
  return {
    fileAPI: typeof File !== 'undefined',
    webWorkers: typeof Worker !== 'undefined',
    objectURL: typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function',
    intersectionObserver: typeof IntersectionObserver !== 'undefined',
    performance: typeof performance !== 'undefined' && typeof performance.memory !== 'undefined'
  };
}

/**
 * Get performance metrics
 * @returns {Object} - Performance metrics
 */
export function getPerformanceMetrics() {
  const support = checkBrowserSupport();
  
  const metrics = {
    timestamp: Date.now(),
    support,
    memory: null,
    timing: null
  };

  // Memory metrics
  if (support.performance && performance.memory) {
    metrics.memory = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    };
  }

  // Navigation timing
  if (support.performance && performance.timing) {
    const timing = performance.timing;
    metrics.timing = {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || null
    };
  }

  return metrics;
}

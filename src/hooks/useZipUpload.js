import { useState, useCallback } from 'react';
import { ZipHandler } from '../utils/zipHandler';

/**
 * Custom hook for handling ZIP file uploads
 * @returns {Object} - Upload state and handlers
 */
export function useZipUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
   * Handle file upload and processing
   * @param {File} file - ZIP file to process
   */
  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    // Reset state
    setError(null);
    setResult(null);
    setProgress(0);
    setIsUploading(true);
    setIsProcessing(false);

    try {
      // Validate file
      if (!file.name.toLowerCase().endsWith('.zip')) {
        throw new Error('Please select a ZIP file');
      }

      // Check file size (500MB limit)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 500MB');
      }

      setIsUploading(false);
      setIsProcessing(true);
      setProgress(10);

      // Create ZIP handler and process file
      const zipHandler = new ZipHandler();
      const zipResult = await zipHandler.loadZipFile(file);
      
      setProgress(50);

      // Read chat file content
      const chatContent = await zipResult.chatFile.blob.text();
      setProgress(80);

      // Set result
      setResult({
        chatContent,
        files: zipResult.files,
        metadata: zipResult.metadata,
        zipHandler
      });

      setProgress(100);
      setIsProcessing(false);

    } catch (err) {
      setError(err.message);
      setIsUploading(false);
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setError(null);
    setResult(null);
    setProgress(0);
    setIsUploading(false);
    setIsProcessing(false);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isUploading,
    isProcessing,
    progress,
    error,
    result,
    
    // Actions
    handleUpload,
    reset,
    clearError
  };
}

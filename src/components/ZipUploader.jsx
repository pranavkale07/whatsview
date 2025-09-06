import React, { useCallback, useRef } from 'react';
import { useZipUpload } from '../hooks/useZipUpload';

/**
 * ZIP File Upload Component
 * Handles file upload with drag & drop functionality
 */
const ZipUploader = ({ onUploadSuccess, onUploadError }) => {
  const fileInputRef = useRef(null);
  const {
    isUploading,
    isProcessing,
    progress,
    error,
    handleUpload,
    reset,
    clearError
  } = useZipUpload();

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  // Handle file processing
  const handleFile = useCallback(async (file) => {
    try {
      await handleUpload(file);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      if (onUploadError) {
        onUploadError(err);
      }
    }
  }, [handleUpload, onUploadSuccess, onUploadError]);

  // Handle drag and drop
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  // Handle click to browse
  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    clearError();
    reset();
  }, [clearError, reset]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${error 
            ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
            : isUploading || isProcessing
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Content */}
        <div className="space-y-4">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 text-gray-400">
            {isUploading || isProcessing ? (
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            ) : error ? (
              <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {error ? 'Upload Failed' : isUploading || isProcessing ? 'Processing...' : 'Upload WhatsApp Chat'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {error 
                ? 'There was an error processing your file'
                : isUploading || isProcessing
                ? 'Please wait while we process your chat'
                : 'Drag & drop your ZIP file here or click to browse'
              }
            </p>
          </div>

          {/* Progress Bar */}
          {(isUploading || isProcessing) && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Instructions */}
          {!error && !isUploading && !isProcessing && (
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>• Export your WhatsApp chat with "Attach media" option</p>
              <p>• Maximum file size: 500MB</p>
              <p>• Supported format: ZIP files only</p>
            </div>
          )}

          {/* Action Buttons */}
          {error && (
            <div className="space-x-2">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZipUploader;

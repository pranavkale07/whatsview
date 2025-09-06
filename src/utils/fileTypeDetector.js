/**
 * File Type Detection Utilities
 * Determines file types and provides appropriate handling for different file categories
 */

/**
 * Get file type category based on filename
 * @param {string} filename - Name of the file
 * @returns {string} - File type category
 */
export function getFileType(filename) {
  if (!filename) return 'unknown';
  
  const extension = filename.toLowerCase().split('.').pop();
  
  const typeMap = {
    // Images
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico', 'tiff', 'tif'],
    // Videos
    video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp', 'm4v'],
    // Audio
    audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma', 'opus'],
    // Documents
    document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'],
    // Archives
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
    // Code
    code: ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'sass', 'less', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'],
    // Unknown
    unknown: []
  };

  for (const [type, extensions] of Object.entries(typeMap)) {
    if (extensions.includes(extension)) {
      return type;
    }
  }

  return 'unknown';
}

/**
 * Check if file is an image
 * @param {string} filename - Name of the file
 * @returns {boolean} - True if image
 */
export function isImage(filename) {
  return getFileType(filename) === 'image';
}

/**
 * Check if file is a video
 * @param {string} filename - Name of the file
 * @returns {boolean} - True if video
 */
export function isVideo(filename) {
  return getFileType(filename) === 'video';
}

/**
 * Check if file is audio
 * @param {string} filename - Name of the file
 * @returns {boolean} - True if audio
 */
export function isAudio(filename) {
  return getFileType(filename) === 'audio';
}

/**
 * Check if file is a document
 * @param {string} filename - Name of the file
 * @returns {boolean} - True if document
 */
export function isDocument(filename) {
  return getFileType(filename) === 'document';
}

/**
 * Get MIME type for a file
 * @param {string} filename - Name of the file
 * @returns {string} - MIME type
 */
export function getMimeType(filename) {
  const extension = filename.toLowerCase().split('.').pop();
  
  const mimeTypes = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',
    
    // Videos
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    '3gp': 'video/3gpp',
    'm4v': 'video/x-m4v',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'aac': 'audio/aac',
    'm4a': 'audio/mp4',
    'flac': 'audio/flac',
    'wma': 'audio/x-ms-wma',
    'opus': 'audio/opus',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'odt': 'application/vnd.oasis.opendocument.text',
    'ods': 'application/vnd.oasis.opendocument.spreadsheet',
    'odp': 'application/vnd.oasis.opendocument.presentation',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    'bz2': 'application/x-bzip2'
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human readable size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon based on type
 * @param {string} filename - Name of the file
 * @returns {string} - Icon emoji or symbol
 */
export function getFileIcon(filename) {
  const type = getFileType(filename);
  
  const icons = {
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    document: '📄',
    archive: '📦',
    code: '💻',
    unknown: '📎'
  };
  
  return icons[type] || icons.unknown;
}

/**
 * Check if file can be previewed in browser
 * @param {string} filename - Name of the file
 * @returns {boolean} - True if can be previewed
 */
export function canPreview(filename) {
  const type = getFileType(filename);
  return ['image', 'video', 'audio'].includes(type);
}

/**
 * Get appropriate component type for rendering
 * @param {string} filename - Name of the file
 * @returns {string} - Component type
 */
export function getComponentType(filename) {
  const type = getFileType(filename);
  
  if (type === 'image') return 'ImageAttachment';
  if (type === 'video') return 'VideoAttachment';
  if (type === 'audio') return 'AudioAttachment';
  if (type === 'document') return 'DocumentAttachment';
  
  return 'GenericAttachment';
}

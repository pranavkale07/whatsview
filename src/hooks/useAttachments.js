import { useState, useCallback, useMemo } from 'react';
import { getFileType, canPreview, getComponentType, formatFileSize } from '../utils/fileTypeDetector';
import { ObjectURLManager } from '../utils/performanceUtils';

/**
 * Custom hook for managing attachments
 * @param {Map} files - Map of extracted files
 * @returns {Object} - Attachment utilities and state
 */
export function useAttachments(files) {
  const [urlManager] = useState(() => new ObjectURLManager());
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Process attachments
  const attachments = useMemo(() => {
    if (!files || files.size === 0) return [];

    const attachmentList = [];
    
    files.forEach((blob, filename) => {
      const type = getFileType(filename);
      const canBePreviewed = canPreview(filename);
      const componentType = getComponentType(filename);
      const size = formatFileSize(blob.size);
      
      // Create object URL for the file
      const url = urlManager.createURL(blob, filename);

      attachmentList.push({
        filename,
        type,
        componentType,
        canPreview: canBePreviewed,
        size,
        url,
        blob
      });
    });

    return attachmentList;
  }, [files, urlManager]);

  // Group attachments by type
  const groupedAttachments = useMemo(() => {
    const groups = {
      image: [],
      video: [],
      audio: [],
      document: [],
      other: []
    };

    attachments.forEach(attachment => {
      const group = groups[attachment.type] || groups.other;
      group.push(attachment);
    });

    return groups;
  }, [attachments]);

  /**
   * Get attachment by filename
   * @param {string} filename - Name of the file
   * @returns {Object|null} - Attachment info or null
   */
  const getAttachment = useCallback((filename) => {
    return attachments.find(att => att.filename === filename) || null;
  }, [attachments]);

  /**
   * Preview an attachment
   * @param {string} filename - Name of the file to preview
   */
  const previewAttachment = useCallback((filename) => {
    const attachment = getAttachment(filename);
    if (attachment && attachment.canPreview) {
      setPreviewUrl(attachment.url);
      setIsPreviewOpen(true);
    }
  }, [getAttachment]);

  /**
   * Close preview
   */
  const closePreview = useCallback(() => {
    setPreviewUrl(null);
    setIsPreviewOpen(false);
  }, []);

  /**
   * Download an attachment
   * @param {string} filename - Name of the file to download
   */
  const downloadAttachment = useCallback((filename) => {
    const attachment = getAttachment(filename);
    if (attachment) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [getAttachment]);

  /**
   * Get attachments by type
   * @param {string} type - File type to filter by
   * @returns {Array} - Filtered attachments
   */
  const getAttachmentsByType = useCallback((type) => {
    return attachments.filter(att => att.type === type);
  }, [attachments]);

  /**
   * Search attachments by filename
   * @param {string} query - Search query
   * @returns {Array} - Filtered attachments
   */
  const searchAttachments = useCallback((query) => {
    if (!query.trim()) return attachments;
    
    const lowercaseQuery = query.toLowerCase();
    return attachments.filter(attachment => 
      attachment.filename.toLowerCase().includes(lowercaseQuery)
    );
  }, [attachments]);

  /**
   * Get total size of all attachments
   * @returns {string} - Formatted total size
   */
  const getTotalSize = useCallback(() => {
    const totalBytes = attachments.reduce((sum, att) => sum + att.blob.size, 0);
    return formatFileSize(totalBytes);
  }, [attachments]);

  /**
   * Get attachment statistics
   * @returns {Object} - Statistics object
   */
  const getStatistics = useCallback(() => {
    const stats = {
      total: attachments.length,
      byType: {},
      totalSize: getTotalSize()
    };

    attachments.forEach(attachment => {
      const type = attachment.type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }, [attachments, getTotalSize]);

  /**
   * Clean up resources
   */
  const cleanup = useCallback(() => {
    urlManager.revokeAll();
    setPreviewUrl(null);
    setIsPreviewOpen(false);
  }, [urlManager]);

  return {
    // State
    attachments,
    groupedAttachments,
    previewUrl,
    isPreviewOpen,
    
    // Actions
    getAttachment,
    previewAttachment,
    closePreview,
    downloadAttachment,
    getAttachmentsByType,
    searchAttachments,
    getTotalSize,
    getStatistics,
    cleanup
  };
}

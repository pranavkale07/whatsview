import JSZip from 'jszip';

/**
 * Handles ZIP file upload and extraction
 */
export class ZipHandler {
  constructor() {
    this.zip = null;
    this.files = new Map();
  }

  /**
   * Load and extract ZIP file
   * @param {File} file - ZIP file to process
   * @returns {Promise<Object>} - Extracted files and metadata
   */
  async loadZipFile(file) {
    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.zip')) {
        throw new Error('Please upload a ZIP file');
      }

      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 500MB');
      }

      // Load ZIP file
      this.zip = await JSZip.loadAsync(file);
      
      // Extract all files
      await this.extractFiles();
      
      // Find chat file
      const chatFile = this.findChatFile();
      if (!chatFile) {
        throw new Error('No chat file found. Please ensure your ZIP contains a WhatsApp chat export.');
      }

      return {
        chatFile,
        files: this.files,
        metadata: {
          totalFiles: this.files.size,
          zipSize: file.size,
          chatFileName: chatFile.name
        }
      };
    } catch (error) {
      throw new Error(`Failed to process ZIP file: ${error.message}`);
    }
  }

  /**
   * Extract all files from ZIP to memory
   * @private
   */
  async extractFiles() {
    this.files.clear();
    
    // Process files in batches to avoid blocking the UI
    const fileEntries = Object.entries(this.zip.files);
    const batchSize = 10;
    
    for (let i = 0; i < fileEntries.length; i += batchSize) {
      const batch = fileEntries.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async ([filename, zipFile]) => {
          if (!zipFile.dir) {
            try {
              const blob = await zipFile.async('blob');
              this.files.set(filename, blob);
            } catch (error) {
              console.warn(`Failed to extract file: ${filename}`, error);
            }
          }
        })
      );
      
      // Yield to browser for smooth UI
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  /**
   * Find the main chat file in the extracted files
   * @private
   * @returns {Object|null} - Chat file info or null
   */
  findChatFile() {
    const chatFiles = Array.from(this.files.keys()).filter(filename => {
      const lowerName = filename.toLowerCase();
      return lowerName.endsWith('.txt') && 
             (lowerName.includes('chat') || lowerName.includes('whatsapp'));
    });

    if (chatFiles.length === 0) {
      return null;
    }

    // Return the first chat file found
    const chatFileName = chatFiles[0];
    return {
      name: chatFileName,
      blob: this.files.get(chatFileName)
    };
  }

  /**
   * Get file by filename
   * @param {string} filename - Name of the file to retrieve
   * @returns {Blob|null} - File blob or null if not found
   */
  getFile(filename) {
    return this.files.get(filename) || null;
  }

  /**
   * Get all files
   * @returns {Map} - Map of all extracted files
   */
  getAllFiles() {
    return this.files;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.files.clear();
    this.zip = null;
  }
}
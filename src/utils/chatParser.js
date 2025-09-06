/**
 * WhatsApp Chat Parser
 * Parses WhatsApp chat export files and extracts messages with attachments
 */

/**
 * Parse WhatsApp chat content
 * @param {string} chatContent - Raw chat file content
 * @param {Map} files - Map of extracted files from ZIP
 * @returns {Array} - Array of parsed messages
 */
export function parseChat(chatContent, files = new Map()) {
  try {
    // Remove UTF-8 BOM if present
    if (chatContent.charCodeAt(0) === 0xFEFF) {
      chatContent = chatContent.slice(1);
    }

    const lines = chatContent.split('\n').map(line => line.trim());
    const chatMessages = [];
    
    // Simple and effective regex patterns
    // Matches: MM/DD/YY, HH:MM AM/PM - Sender: Message
    const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}\s*[APMapm]{2})\s*-\s*([^:]+):\s*(.+)$/;
    
    // Regex pattern for system messages (joined, left, created group, etc.)
    // Matches: MM/DD/YY, HH:MM AM/PM - System Message (no colon)
    const systemMessageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}\s*[APmapm]{2})\s*-\s*(.+)$/;
    
    let lastMessage = null;

    lines.forEach((line, index) => {
      // Don't skip any lines - empty lines are important for message formatting


      // Check if line starts with date pattern - use a very flexible pattern
      const dateTimeMatch = line.match(/^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}\s*[APMapm]{2})\s*-\s*(.+)$/i);
      
      if (dateTimeMatch) {
        // Save previous message if exists
        if (lastMessage) {
          chatMessages.push(lastMessage);
        }

        const date = dateTimeMatch[1];
        const time = dateTimeMatch[2];
        const content = dateTimeMatch[3].trim();

        // Check if it's a regular message (has colon) or system message (no colon)
        const colonIndex = content.indexOf(':');
        
        if (colonIndex > 0) {
          // Regular message: Sender: Message
          const sender = content.substring(0, colonIndex).trim();
          const messageText = content.substring(colonIndex + 1).trim();
          
          
          // Check for attachments
          const attachment = extractAttachment(messageText, files);
          
          // Remove attachment reference from message text
          let finalMessageText = messageText;
          if (attachment) {
            finalMessageText = messageText.replace(attachment.originalText, '').trim();
          }

          lastMessage = {
            id: `${Date.now()}-${index}`,
            date: date,
            time: time,
            sender: sender,
            message: finalMessageText,
            attachment: attachment,
            timestamp: new Date(`${date} ${time}`).getTime(),
            type: 'message'
          };
        } else {
          // System message: No colon, treat as system message
          const systemType = getSystemMessageType(content);

          lastMessage = {
            id: `${Date.now()}-${index}`,
            date: date,
            time: time,
            sender: 'System',
            message: content,
            attachment: null,
            timestamp: new Date(`${date} ${time}`).getTime(),
            type: 'system',
            systemType: systemType
          };
        }
      } else if (lastMessage) {
        // Multi-line message - append to last message (including empty lines)
        lastMessage.message += '\n' + line;
      }
    });

    // Add the last message
    if (lastMessage) {
      chatMessages.push(lastMessage);
    }


    return chatMessages;
  } catch (error) {
    console.error('Error parsing chat:', error);
    throw new Error(`Failed to parse chat: ${error.message}`);
  }
}

/**
 * Extract attachment information from message text
 * @param {string} messageText - Message text to analyze
 * @param {Map} files - Map of available files
 * @returns {Object|null} - Attachment info or null
 */
function extractAttachment(messageText, files) {
  if (!messageText) return null;

  // Pattern 1: <attached: filename.ext>
  const attachedPattern = /<attached:\s*([^>]+)>/i;
  const attachedMatch = messageText.match(attachedPattern);
  
  if (attachedMatch) {
    const filename = attachedMatch[1].trim();
    const file = files.get(filename);
    
    if (file) {
      return {
        filename,
        type: getFileType(filename),
        originalText: attachedMatch[0],
        blob: file
      };
    }
  }

  // Pattern 2: (file attached) or (image attached)
  const fileAttachedPattern = /(.+?)\s*\((file|image)\s+attached\)/i;
  const fileAttachedMatch = messageText.match(fileAttachedPattern);
  
  if (fileAttachedMatch) {
    const filename = fileAttachedMatch[1].trim();
    const file = files.get(filename);
    
    if (file) {
      return {
        filename,
        type: getFileType(filename),
        originalText: fileAttachedMatch[0],
        blob: file
      };
    }
  }

  // Pattern 3: Direct filename references (IMG-xxx.jpg, Document-xxx.pdf)
  const directFilePattern = /(IMG-\d+\.(jpg|jpeg|png|gif|webp|mp4)|Document-\d+\.(pdf|docx?|xlsx?|pptx?|txt|mp3|wav|ogg))/i;
  const directFileMatch = messageText.match(directFilePattern);
  
  if (directFileMatch) {
    const filename = directFileMatch[1];
    const file = files.get(filename);
    
    if (file) {
      return {
        filename,
        type: getFileType(filename),
        originalText: filename,
        blob: file
      };
    }
  }

  return null;
}

/**
 * Determine system message type
 * @param {string} message - System message text
 * @returns {string} - System message type
 */
function getSystemMessageType(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('joined using this group\'s invite link') || 
      lowerMessage.includes('joined') || 
      lowerMessage.includes('added')) {
    return 'joined';
  } else if (lowerMessage.includes('removed') || 
             lowerMessage.includes('left')) {
    return 'left';
  } else if (lowerMessage.includes('created group') || 
             lowerMessage.includes('group created')) {
    return 'created';
  } else if (lowerMessage.includes('changed the group name') || 
             lowerMessage.includes('group name changed')) {
    return 'name_changed';
  } else if (lowerMessage.includes('changed group description') || 
             lowerMessage.includes('group description changed')) {
    return 'description_changed';
  } else if (lowerMessage.includes('changed this group\'s icon') || 
             lowerMessage.includes('group icon changed')) {
    return 'icon_changed';
  } else if (lowerMessage.includes('messages and calls are end-to-end encrypted')) {
    return 'encryption';
  } else if (lowerMessage.includes('ended') || 
             lowerMessage.includes('deleted')) {
    return 'ended';
  } else {
    return 'other';
  }
}

/**
 * Determine file type based on filename
 * @param {string} filename - Name of the file
 * @returns {string} - File type category
 */
function getFileType(filename) {
  const extension = filename.toLowerCase().split('.').pop();
  
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
  const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (videoTypes.includes(extension)) return 'video';
  if (audioTypes.includes(extension)) return 'audio';
  if (documentTypes.includes(extension)) return 'document';
  
  return 'unknown';
}

/**
 * Format message text for display (bold, links, etc.)
 * @param {string} text - Raw message text
 * @returns {string} - Formatted HTML string
 */
export function formatMessageText(text) {
  if (!text) return '';

  return text
    // Bold text: *text* -> <strong>text</strong>
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    // Italic text: _text_ -> <em>text</em>
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Strikethrough: ~text~ -> <del>text</del>
    .replace(/~(.*?)~/g, '<del>$1</del>')
    // Monospace: ```text``` -> <code>text</code>
    .replace(/```(.*?)```/g, '<code>$1</code>')
    // Links: https://example.com -> <a>https://example.com</a>
    .replace(
      /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g,
      (match) => {
        // Ensure protocol is added for www. links
        const url = match.startsWith('http') ? match : `https://${match}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-300 hover:text-blue-200 hover:underline underline-offset-2 cursor-pointer">${match}</a>`;
      }
    )
    // Line breaks - preserve all newlines including multiple consecutive ones
    .replace(/\n/g, '<br>');
}
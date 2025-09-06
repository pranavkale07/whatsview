import { useState, useCallback, useMemo } from 'react';
import { parseChat, formatMessageText, groupMessagesByDate, getDateRange } from '../utils/chatParser';
import { ObjectURLManager } from '../utils/performanceUtils';

/**
 * Custom hook for managing chat data
 * @param {string} chatContent - Raw chat content
 * @param {Map} files - Map of extracted files
 * @returns {Object} - Chat data and utilities
 */
export function useChatData(chatContent, files) {
  const [messages, setMessages] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [urlManager] = useState(() => new ObjectURLManager());

  // Parse messages when chat content changes
  useMemo(() => {
    if (!chatContent) {
      setMessages([]);
      return;
    }

    const parseMessages = async () => {
      setIsParsing(true);
      setParseError(null);

      try {
        const parsedMessages = parseChat(chatContent, files);
        
        // Create object URLs for attachments
        const messagesWithUrls = parsedMessages.map(message => {
          if (message.attachment && message.attachment.blob) {
            const url = urlManager.createURL(
              message.attachment.blob,
              message.attachment.filename
            );
            return {
              ...message,
              attachment: {
                ...message.attachment,
                url
              }
            };
          }
          return message;
        });

        setMessages(messagesWithUrls);
      } catch (error) {
        setParseError(error.message);
        setMessages([]);
      } finally {
        setIsParsing(false);
      }
    };

    parseMessages();
  }, [chatContent, files, urlManager]);

  // Computed values
  const groupedMessages = useMemo(() => 
    groupMessagesByDate(messages), 
    [messages]
  );

  const dateRange = useMemo(() => 
    getDateRange(messages), 
    [messages]
  );

  const statistics = useMemo(() => ({
    totalMessages: messages.length,
    totalAttachments: messages.filter(msg => msg.attachment).length,
    uniqueSenders: [...new Set(messages.map(msg => msg.sender))].length,
    dateRange
  }), [messages, dateRange]);

  /**
   * Format message text for display
   * @param {string} text - Raw message text
   * @returns {string} - Formatted HTML
   */
  const formatMessage = useCallback((text) => {
    return formatMessageText(text);
  }, []);

  /**
   * Get messages for a specific date
   * @param {string} date - Date string (MM/DD/YY format)
   * @returns {Array} - Messages for that date
   */
  const getMessagesForDate = useCallback((date) => {
    return groupedMessages[date] || [];
  }, [groupedMessages]);

  /**
   * Search messages by text
   * @param {string} query - Search query
   * @returns {Array} - Filtered messages
   */
  const searchMessages = useCallback((query) => {
    if (!query.trim()) return messages;
    
    const lowercaseQuery = query.toLowerCase();
    return messages.filter(message => 
      message.message.toLowerCase().includes(lowercaseQuery) ||
      message.sender.toLowerCase().includes(lowercaseQuery)
    );
  }, [messages]);

  /**
   * Filter messages by sender
   * @param {string} sender - Sender name
   * @returns {Array} - Filtered messages
   */
  const filterBySender = useCallback((sender) => {
    if (!sender) return messages;
    return messages.filter(message => message.sender === sender);
  }, [messages]);

  /**
   * Get unique senders
   * @returns {Array} - Array of unique sender names
   */
  const getUniqueSenders = useCallback(() => {
    return [...new Set(messages.map(msg => msg.sender))];
  }, [messages]);

  /**
   * Clean up resources
   */
  const cleanup = useCallback(() => {
    urlManager.revokeAll();
    setMessages([]);
    setParseError(null);
  }, [urlManager]);

  return {
    // State
    messages,
    isParsing,
    parseError,
    
    // Computed values
    groupedMessages,
    dateRange,
    statistics,
    
    // Actions
    formatMessage,
    getMessagesForDate,
    searchMessages,
    filterBySender,
    getUniqueSenders,
    cleanup
  };
}

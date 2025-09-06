import React from 'react';
import AttachmentViewer from './AttachmentViewer';

/**
 * Individual Message Bubble Component
 * Displays a single chat message with WhatsApp-like styling
 */
const MessageBubble = ({ message, isOwnMessage = false }) => {
  const { sender, message: content, time, attachment } = message;

  // Format message text
  const formatMessage = (text) => {
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
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>'
      )
      // Line breaks
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[60%] p-3 rounded-lg shadow-md
          ${isOwnMessage
            ? 'bg-[#056162] text-white' // WhatsApp green for sender
            : 'bg-[#262d31] text-gray-200' // WhatsApp gray for receiver
          }
        `}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {/* Sender Name */}
        <p className="text-sm font-semibold mb-1">{sender}</p>

        {/* Message Content */}
        <div className="space-y-2">
          {/* Text Content */}
          {content && (
            <p
              className="text-base"
              dangerouslySetInnerHTML={{ __html: formatMessage(content) }}
            />
          )}

          {/* Attachment */}
          {attachment && (
            <AttachmentViewer
              attachment={attachment}
              isOwnMessage={isOwnMessage}
            />
          )}
        </div>

        {/* Timestamp */}
        <p className={`text-xs mt-2 text-right ${
          isOwnMessage ? 'text-green-100' : 'text-gray-400'
        }`}>
          {time}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;

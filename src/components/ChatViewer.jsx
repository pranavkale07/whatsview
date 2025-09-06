import React from 'react';
import MessageBubble from './MessageBubble';

/**
 * Chat Viewer Component
 * Displays the main chat interface with messages
 */
const ChatViewer = ({ messages, isParsing, parseError }) => {
  // Show loading state
  if (isParsing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Parsing chat messages...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (parseError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Parsing Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {parseError}
          </p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-gray-400 text-6xl">💬</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            No Messages Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No messages were found in the chat file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message, index) => {
        const isOwnMessage = message.sender === 'You';
        const showDateSeparator = index === 0 || 
          messages[index - 1].date !== message.date;

        return (
          <div key={message.id || index} className="flex flex-col items-center">
            {/* Date Separator */}
            {showDateSeparator && (
              <div className="text-gray-400 text-sm my-2 px-4 py-1 bg-[#2a2a2a] rounded-lg">
                {message.date}
              </div>
            )}

            {/* Message Bubble */}
            <MessageBubble
              message={message}
              isOwnMessage={isOwnMessage}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ChatViewer;

import React, { useState, useEffect, useMemo } from 'react';
import { ZipHandler } from './utils/zipHandler';
import { parseChat, formatMessageText } from './utils/chatParser';
import AttachmentViewer from './components/AttachmentViewer';
import { useObjectUrls } from './hooks/useObjectUrls';
import { createColorMap } from './utils/colors';

/**
 * Main App Component
 * WhatsApp Chat Viewer - Local-only version
 */
function App() {
  const [chatContent, setChatContent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [zipHandler, setZipHandler] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const { createObjectUrl, cleanup: cleanupUrls } = useObjectUrls();

  // Create color map for users
  const participants = useMemo(() => {
    if (!messages.length) return [];
    const uniqueSenders = [...new Set(messages.map(m => m.sender).filter(s => s && s !== 'System'))];
    return uniqueSenders;
  }, [messages]);

  const colorMap = useMemo(() => createColorMap(participants), [participants]);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please upload a ZIP file');
      return;
    }

    setIsUploading(true);
    setIsProcessing(false);
    setError(null);

    try {
      // Create ZIP handler and process file
      const handler = new ZipHandler();
      const result = await handler.loadZipFile(file);
      
      setIsUploading(false);
      setIsProcessing(true);

      // Read chat file content
      const chatText = await result.chatFile.blob.text();
      
      // Parse messages
      const parsedMessages = parseChat(chatText, result.files);
      
      setChatContent(chatText);
      setMessages(parsedMessages);
      setZipHandler(handler);
      setIsProcessing(false);

    } catch (err) {
      setError(err.message);
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  // Get system message icon
  const getSystemMessageIcon = (systemType) => {
    switch (systemType) {
      case 'joined':
        return '➕';
      case 'left':
        return '➖';
      case 'created':
        return '👥';
      case 'name_changed':
        return '✏️';
      case 'description_changed':
        return '📝';
      case 'icon_changed':
        return '🖼️';
      case 'encryption':
        return '🔒';
      case 'ended':
        return '🗑️';
      default:
        return 'ℹ️';
    }
  };

  // Reset state
  const handleReset = () => {
    setChatContent(null);
    setMessages([]);
    setError(null);
    setIsUploading(false);
    setIsProcessing(false);
    setSelectedAttachment(null);
    cleanupUrls(); // Clean up object URLs
    if (zipHandler) {
      zipHandler.cleanup();
      setZipHandler(null);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-whatsapp-dark text-white">
      {/* Main Container */}
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <header className="p-4 bg-whatsapp-header text-gray-300 font-semibold text-lg border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1>WhatsApp Chat Viewer</h1>
            {chatContent && (
              <div className="text-sm text-gray-400">
                {messages.length} messages loaded
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Show upload interface if no chat loaded */}
          {!chatContent ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-4xl">
                {/* Error Display */}
                {error && (
                  <div className="mb-6 bg-red-900/20 border border-red-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-red-400">⚠️</div>
                      <div>
                        <h3 className="text-sm font-medium text-red-200">Upload Error</h3>
                        <p className="mt-1 text-sm text-red-300">{error}</p>
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Component */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200">
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 text-gray-400">
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                      ) : (
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isUploading ? 'Processing...' : 'Upload WhatsApp Chat'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {isUploading 
                          ? 'Please wait while we process your chat'
                          : 'Drag & drop your ZIP file here or click to browse'
                        }
                      </p>
                    </div>

                    {/* File Input */}
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isUploading ? 'Processing...' : 'Choose ZIP File'}
                    </label>

                    {/* Instructions */}
                    {!isUploading && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <p>• Export your WhatsApp chat with "Attach media" option</p>
                        <p>• Maximum file size: 500MB</p>
                        <p>• Supported format: ZIP files only</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 text-center text-gray-400 text-sm max-w-2xl mx-auto">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    How to use this tool:
                  </h3>
                  <ol className="text-left space-y-2">
                    <li>1. Open WhatsApp and go to the chat you want to export</li>
                    <li>2. Tap the three dots menu → More → Export chat</li>
                    <li>3. Choose "Attach media" to include photos and files</li>
                    <li>4. Save the ZIP file to your device</li>
                    <li>5. Upload the ZIP file here to view your chat</li>
                  </ol>
                  <p className="mt-4 text-xs">
                    🔒 Your data stays completely private - everything is processed locally in your browser
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Show chat interface */
                   <div className="w-full h-full overflow-y-auto bg-whatsapp-dark" style={{
                     backgroundImage: `url("/bg-dark-BnMQztzI.png")`,
                     backgroundRepeat: 'repeat',
                     backgroundSize: 'auto'
                   }}>
              {isProcessing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400">Processing chat messages...</p>
                  </div>
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-1 px-4 py-4">
                         {messages.map((message, index) => {
                           const isOwnMessage = message.sender === 'You';
                           const isSystemMessage = message.type === 'system';
                           const showDateSeparator = index === 0 || 
                             messages[index - 1].date !== message.date;
                           
                           // Check if this message is from the same sender as the previous one
                           const prevMessage = messages[index - 1];
                           const sameSenderAsPrevious = prevMessage && 
                             prevMessage.sender === message.sender && 
                             !isSystemMessage && 
                             prevMessage.type !== 'system';
                           
                           // Get user color
                           const userColor = colorMap[message.sender] || '#6B7280';


                    return (
                      <div key={message.id || index} className="flex flex-col items-center">
                        {/* Date Separator */}
                        {showDateSeparator && (
                          <div className="flex justify-center my-4">
                            <div className="text-gray-400 text-xs px-3 py-1 bg-whatsapp-header rounded-full">
                              {message.date}
                            </div>
                          </div>
                        )}

                               {/* System Message */}
                               {isSystemMessage ? (
                                 <div className="flex justify-center my-1">
                                   <div className="text-yellow-200 text-xs px-2 py-1 bg-yellow-900 bg-opacity-30 rounded-full inline-block">
                                     {message.message}
                                   </div>
                                 </div>
                               ) : (
                                 /* Regular Message Bubble */
                                 <div className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'} ${sameSenderAsPrevious ? 'mt-0.5' : 'mb-1'}`}>
                                 <div
                                   className={`max-w-[70%] px-3 py-2 rounded-lg ${
                                     isOwnMessage
                                       ? 'bg-whatsapp-green text-white rounded-br-sm' // WhatsApp green with tail
                                       : 'bg-whatsapp-gray text-gray-200 rounded-bl-sm' // WhatsApp gray with tail
                                   } ${sameSenderAsPrevious ? 'rounded-tl-sm rounded-tr-sm' : ''}`}
                                   style={{ 
                                     whiteSpace: 'pre-wrap',
                                     wordWrap: 'break-word',
                                     overflowWrap: 'break-word'
                                   }}
                                 >
                                   {/* Sender Name - only show for group chats and when not same sender as previous */}
                                   {!isOwnMessage && !sameSenderAsPrevious && (
                                     <p 
                                       className="text-xs font-semibold mb-1" 
                                       style={{ color: userColor }}
                                     >
                                       {message.sender}
                                     </p>
                                   )}

                                   {/* Message Content */}
                                   {message.message.includes('<Media omitted>') ? (
                                     /* Media omitted placeholder */
                                     <div className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg border border-gray-600">
                                       <div className="flex-1">
                                         <p className="text-sm font-medium text-gray-300">Media omitted</p>
                                         <p className="text-xs text-gray-400">This media was not included in the export</p>
                                       </div>
                                     </div>
                                   ) : (
                                     /* Regular message content */
                                     <p 
                                       className="text-sm leading-relaxed"
                                       dangerouslySetInnerHTML={{
                                         __html: formatMessageText(message.message)
                                       }}
                                     />
                                   )}

                            {/* Attachment */}
                            {message.attachment && (
                              <div className="mt-2">
                                {message.attachment.type === 'image' ? (
                                  /* Inline Image Display */
                                  <div 
                                    className="cursor-pointer rounded-lg overflow-hidden max-w-xs"
                                    onClick={() => setSelectedAttachment(message.attachment)}
                                  >
                                    <img
                                      src={createObjectUrl(message.attachment.blob)}
                                      alt={message.attachment.filename}
                                      className="w-full h-auto rounded-lg hover:opacity-90 transition-opacity"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                      }}
                                    />
                                    <div 
                                      className="hidden p-2 bg-black bg-opacity-20 rounded cursor-pointer hover:bg-opacity-30 transition-colors"
                                      onClick={() => setSelectedAttachment(message.attachment)}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <span className="text-lg">🖼️</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{message.attachment.filename}</p>
                                          <p className="text-xs text-gray-400">Click to view</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  /* Other attachment types - clickable reference */
                                  <div 
                                    className="p-2 bg-black bg-opacity-20 rounded cursor-pointer hover:bg-opacity-30 transition-colors"
                                    onClick={() => setSelectedAttachment(message.attachment)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span className="text-lg">
                                        {message.attachment.type === 'video' ? '🎥' :
                                         message.attachment.type === 'audio' ? '🎵' :
                                         message.attachment.type === 'document' ? '📄' : '📎'}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{message.attachment.filename}</p>
                                        <p className="text-xs text-gray-400 capitalize">{message.attachment.type}</p>
                                      </div>
                                      <span className="text-xs text-gray-500">Click to view</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                                   {/* Timestamp */}
                                   <div className={`flex justify-end mt-1 ${
                                     isOwnMessage ? 'text-green-100' : 'text-gray-400'
                                   }`}>
                                     <span className="text-xs opacity-70">{message.date}, {message.time}</span>
                                   </div>
                          </div>
                        </div>
                        )}
                      </div>
            );
          })}
        </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="text-gray-400 text-6xl">💬</div>
                    <h3 className="text-2xl font-semibold text-white">
                      No Messages Found
                    </h3>
                    <p className="text-gray-400">
                      No messages were found in the chat file.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="p-4 bg-whatsapp-header text-gray-400 text-sm border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              {chatContent && (
                <span>
                  {messages.length} messages • 
                  {new Set(messages.map(m => m.sender)).size} participants
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span>Privacy-first • Local-only</span>
              {chatContent && (
                <button
                  onClick={handleReset}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Upload New Chat
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Attachment Viewer Modal */}
      {selectedAttachment && (
        <AttachmentViewer
          attachment={selectedAttachment}
          onClose={() => setSelectedAttachment(null)}
        />
      )}
    </div>
  );
}

export default App;
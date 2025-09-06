import React, { useState, useEffect, useMemo } from 'react';
import { ZipHandler } from './utils/zipHandler';
import { parseChat, formatMessageText } from './utils/chatParser';
import AttachmentViewer from './components/AttachmentViewer';
import Poll from './components/Poll';
import { useObjectUrls } from './hooks/useObjectUrls';
import { createColorMap } from './utils/colors';
import { parsePollMessage } from './utils/pollParser';
import backgroundImage from './assets/bg-dark-BnMQztzI.png';

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
  const [isDragOver, setIsDragOver] = useState(false);
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

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
        handleFileUpload({ target: { files: [file] } });
      } else {
        setError('Please select a valid ZIP file.');
      }
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
            <div className="flex-1 flex items-center justify-center p-6 bg-whatsapp-dark" style={{
              backgroundImage: `url("${backgroundImage}")`,
              backgroundRepeat: 'repeat',
              backgroundSize: 'auto'
            }}>
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

                {/* WhatsApp-themed Upload Component */}
                <div 
                  className={`bg-whatsapp-gray rounded-2xl p-8 shadow-2xl border-2 border-dashed max-w-2xl mx-auto transition-all duration-200 ${
                    isDragOver 
                      ? 'border-whatsapp-green bg-green-900 bg-opacity-20' 
                      : 'border-gray-700'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center">

                    {/* Upload Icon */}
                    <div className="mx-auto w-16 h-16 bg-whatsapp-green rounded-full flex items-center justify-center mb-6 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {isUploading ? 'Processing Your Chat...' : 'Upload WhatsApp Chat'}
                    </h3>
                    <p className="text-whatsapp-meta text-lg mb-8">
                      {isUploading 
                        ? 'Please wait while we process your messages'
                        : isDragOver
                        ? 'Drop your ZIP file here'
                        : 'Drag & drop your ZIP file here or click to browse'
                      }
                    </p>

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
                      className={`inline-flex items-center px-8 py-4 bg-whatsapp-green text-white rounded-xl font-semibold cursor-pointer hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Choose ZIP File
                        </>
                      )}
                    </label>

                    {/* Privacy Notice */}
                    <div className="mt-8 p-4 bg-whatsapp-dark bg-opacity-50 rounded-xl border border-gray-600">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-whatsapp-green mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-whatsapp-meta text-sm font-medium mb-1">100% Private & Secure</p>
                          <p className="text-whatsapp-meta text-xs">
                            Your data never leaves your device. No server uploads, no data collection.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp-themed Instructions */}
                <div className="mt-8 text-center max-w-2xl mx-auto">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    How to export your WhatsApp chat:
                  </h3>
                  <div className="bg-whatsapp-gray rounded-2xl p-6 border border-gray-700">
                    <div className="space-y-4 text-left">
                      <div className="flex items-start space-x-4">
                        <span className="w-8 h-8 bg-whatsapp-green rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                        <div>
                          <p className="text-white font-medium">Open WhatsApp</p>
                          <p className="text-whatsapp-meta text-sm">Go to the chat you want to export</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <span className="w-8 h-8 bg-whatsapp-green rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                        <div>
                          <p className="text-white font-medium">Export the chat</p>
                          <p className="text-whatsapp-meta text-sm">Tap three dots → More → Export chat</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <span className="w-8 h-8 bg-whatsapp-green rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                        <div>
                          <p className="text-white font-medium">Include media</p>
                          <p className="text-whatsapp-meta text-sm">Choose "Attach media" to include photos and files</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <span className="w-8 h-8 bg-whatsapp-green rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                        <div>
                          <p className="text-white font-medium">Save and upload</p>
                          <p className="text-whatsapp-meta text-sm">Save the ZIP file and upload it here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-whatsapp-dark bg-opacity-50 rounded-xl border border-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5 text-whatsapp-green" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <p className="text-whatsapp-meta text-sm font-medium">
                        Your data stays completely private - everything is processed locally in your browser
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Show chat interface */
                   <div className="w-full h-full overflow-y-auto bg-whatsapp-dark" style={{
                     backgroundImage: `url("${backgroundImage}")`,
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
                             prevMessage.date === message.date &&
                             !isSystemMessage && 
                             prevMessage.type !== 'system' &&
                             prevMessage.sender !== 'System';
                           
                           // Get user color
                           const userColor = colorMap[message.sender] || '#6B7280';
                           
                           // Check if this is a poll message
                           const pollData = parsePollMessage(message.message);
                           
                           // Debug logging for grouping
                           if (index < 10) {
                             console.log(`Message ${index}:`, {
                               sender: message.sender,
                               prevSender: prevMessage?.sender,
                               sameSenderAsPrevious,
                               isOwnMessage,
                               isSystemMessage,
                               message: message.message.substring(0, 20) + '...',
                               cssClass: sameSenderAsPrevious ? 'mt-0' : 'mt-3'
                             });
                           }


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
                                 <div className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'} ${sameSenderAsPrevious ? 'mt-0' : 'mt-3'}`}>
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

                                   {/* Message Content - only show if no attachment or if attachment is not image/video */}
                                   {message.message.includes('<Media omitted>') ? (
                                     /* Media omitted placeholder */
                                     <div className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg border border-gray-600">
                                       <div className="flex-1">
                                         <p className="text-sm font-medium text-gray-300">Media omitted</p>
                                         <p className="text-xs text-gray-400">This media was not included in the export</p>
                                       </div>
                                     </div>
                                   ) : pollData ? (
                                     /* Poll content */
                                     <Poll pollData={pollData} />
                                   ) : !message.attachment || (message.attachment && message.attachment.type !== 'image' && message.attachment.type !== 'video') ? (
                                     /* Regular message content with inline timestamp */
                                     <div className="flex items-end justify-end">
                                       <div className="flex-1">
                                         <p 
                                           className="text-sm leading-relaxed"
                                           dangerouslySetInnerHTML={{
                                             __html: formatMessageText(message.message)
                                           }}
                                         />
                                       </div>
                                       <span className={`text-xs ml-2 opacity-70 ${
                                         isOwnMessage ? 'text-green-100' : 'text-gray-400'
                                       }`}>
                                         {message.time}
                                       </span>
                                     </div>
                                   ) : null}

                            {/* Attachment - show first for images and videos */}
                            {message.attachment && (
                              <div className="mt-2">
                                {message.attachment.type === 'image' ? (
                                  /* Inline Image Display */
                                  <div 
                                    className="cursor-pointer rounded-lg overflow-hidden max-w-xs relative"
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
                                    
                                    {/* Timestamp overlay for images - only if no text message */}
                                    {!message.message.trim() && (
                                      <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs opacity-80 ${
                                        isOwnMessage ? 'bg-black bg-opacity-50 text-green-100' : 'bg-black bg-opacity-50 text-gray-300'
                                      }`}>
                                        {message.time}
                                      </div>
                                    )}
                                    
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
                                ) : message.attachment.type === 'video' ? (
                                  /* Inline Video Thumbnail Display */
                                  <div 
                                    className="cursor-pointer rounded-lg overflow-hidden max-w-xs relative group"
                                    onClick={() => setSelectedAttachment(message.attachment)}
                                  >
                                    <video
                                      src={createObjectUrl(message.attachment.blob)}
                                      className="w-full h-auto rounded-lg"
                                      preload="metadata"
                                      onLoadedMetadata={(e) => {
                                        // Set the video to show the first frame as thumbnail
                                        e.target.currentTime = 1;
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                      }}
                                    />
                                    
                                    {/* Play Icon Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all">
                                      <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z"/>
                                        </svg>
                                      </div>
                                    </div>
                                    
                                    {/* Timestamp overlay for videos - only if no text message */}
                                    {!message.message.trim() && (
                                      <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs opacity-80 ${
                                        isOwnMessage ? 'bg-black bg-opacity-50 text-green-100' : 'bg-black bg-opacity-50 text-gray-300'
                                      }`}>
                                        {message.time}
                                      </div>
                                    )}
                                    
                                    {/* Fallback for video load error */}
                                    <div 
                                      className="hidden p-2 bg-black bg-opacity-20 rounded cursor-pointer hover:bg-opacity-30 transition-colors"
                                      onClick={() => setSelectedAttachment(message.attachment)}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <span className="text-lg">🎥</span>
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

                            {/* Text content after image/video - only for messages with image/video attachments */}
                            {message.attachment && (message.attachment.type === 'image' || message.attachment.type === 'video') && message.message.trim() && (
                              <div className="mt-2 max-w-xs">
                                <div className="flex items-end justify-end">
                                  <div className="flex-1">
                                    <p 
                                      className="text-sm leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: formatMessageText(message.message)
                                      }}
                                    />
                                  </div>
                                  <span className={`text-xs ml-2 opacity-70 ${
                                    isOwnMessage ? 'text-green-100' : 'text-gray-400'
                                  }`}>
                                    {message.time}
                                  </span>
                                </div>
                              </div>
                            )}
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
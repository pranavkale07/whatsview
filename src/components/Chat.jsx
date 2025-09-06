import { useEffect, useState } from "react";
import axios from "axios";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/chat") // Fetch chat data
      .then((response) => {
        setMessages(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching chat:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-4">📩 WhatsApp Chat</h1>
      <div className="bg-white shadow-lg rounded-lg p-4 overflow-y-auto max-h-[80vh]">
        {loading ? (
          <p className="text-gray-500 text-center">Loading chat...</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 flex ${
                msg.sender === "You" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  msg.sender === "You"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm font-semibold">{msg.sender}</p>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs text-gray-600 text-right">{msg.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Chat;

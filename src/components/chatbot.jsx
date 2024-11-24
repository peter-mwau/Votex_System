import { useState, useEffect, useRef } from "react";
import {
  Send,
  LogOut,
  X,
  User,
  Reply,
  XCircle,
  MessageSquare,
} from "lucide-react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [isChatbotVisible, setIsChatbotVisible] = useState(true);
  const ws = useRef(null);

  useEffect(() => {
    if (isLoggedIn) {
      ws.current = new WebSocket("ws://localhost:8080");

      ws.current.onopen = () => {
        ws.current.send(
          JSON.stringify({ type: "userJoined", username: currentUser })
        );
      };

      ws.current.onmessage = (event) => {
        const newMessages = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      };

      return () => {
        ws.current.close();
      };
    }
  }, [isLoggedIn]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message = {
      sender: currentUser,
      text: newMessage,
      type: "message",
      image: `https://picsum.photos/seed/${Math.random()}/50`,
      replyTo: replyTo ? replyTo.id : null,
    };

    ws.current.send(JSON.stringify(message));
    setNewMessage("");
    setReplyTo(null);
  };

  const handleLogin = () => {
    if (currentUser.trim() !== "") {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    if (ws.current) {
      ws.current.send(
        JSON.stringify({ type: "userLeft", username: currentUser })
      );
      ws.current.send(
        JSON.stringify({
          type: "notification",
          text: `${currentUser} has left the chat.`,
        })
      );
      ws.current.close();
    }
    setIsLoggedIn(false);
    setCurrentUser("");
    setMessages([]);
  };

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const onClose = () => {
    setIsChatbotVisible(false);
  };

  if (!isChatbotVisible) return null;

  return (
    <div className="fixed top-[80px] right-0 h-[80vh] w-[90%] md:w-[50%] lg:w-[23%] bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg shadow-2xl border border-gray-200">
      {!isLoggedIn ? (
        <div className="flex flex-col h-full p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center mb-8">
            <MessageSquare className="w-8 h-8 text-cyan-950 mr-2" />
            <h1 className="text-2xl font-bold text-cyan-950">Votex Chat</h1>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  value={currentUser}
                  onChange={(e) => setCurrentUser(e.target.value)}
                />
              </div>
            </div>
            <button
              className="w-full bg-cyan-950 text-white px-4 py-2 rounded-lg hover:bg-cyan-900 transition-colors flex items-center justify-center space-x-2"
              onClick={handleLogin}
            >
              <span>Join Chat</span>
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <header className="bg-cyan-950 p-4 text-white flex items-center justify-between rounded-t-lg relative">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Votex Chat</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>Leave</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          <main className="flex-grow p-4 overflow-auto w-full h-[68vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-4 ${
                    message.sender === currentUser ? "justify-end" : ""
                  }`}
                >
                  {message.type === "message" && (
                    <>
                      {message.sender !== currentUser && (
                        <img
                          src={message.image}
                          alt="avatar"
                          className="w-8 h-8 rounded-full ring-2 ring-gray-200"
                        />
                      )}
                      <div className="max-w-[75%]">
                        <div
                          className={`relative p-3 rounded-2xl ${
                            message.sender === currentUser
                              ? "bg-cyan-950 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <div className="text-sm font-medium mb-1">
                            {message.sender}
                          </div>
                          {message.replyTo && (
                            <div
                              className={`text-xs mb-2 rounded-lg p-2 ${
                                message.sender === currentUser
                                  ? "bg-cyan-900 text-gray-300"
                                  : "bg-gray-300 text-gray-700"
                              }`}
                            >
                              <div className="font-medium mb-1">
                                Replying to:
                              </div>
                              {
                                messages.find((m) => m.id === message.replyTo)
                                  ?.text
                              }
                            </div>
                          )}
                          <div className="text-sm">{message.text}</div>
                        </div>
                        <div className="flex items-center mt-1 space-x-2">
                          <button
                            onClick={() => handleReply(message)}
                            className={`text-xs flex items-center space-x-1 ${
                              message.sender === currentUser
                                ? "text-gray-600"
                                : "text-gray-500"
                            } hover:text-cyan-950 transition-colors`}
                          >
                            <Reply className="w-3 h-3" />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                      {message.sender === currentUser && (
                        <img
                          src={message.image}
                          alt="avatar"
                          className="w-8 h-8 rounded-full ring-2 ring-gray-200"
                        />
                      )}
                    </>
                  )}
                  {message.type === "notification" && (
                    <div className="text-center w-full">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {message.text}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>

          <footer className="bg-white p-4 border-t border-gray-200 rounded-b-lg">
            {replyTo && (
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg mb-2">
                <div className="text-sm text-gray-600 flex items-center space-x-2">
                  <Reply className="w-4 h-4 text-cyan-950" />
                  <span className="truncate">{replyTo.text}</span>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setReplyTo(null)}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                className="flex-grow p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-950 focus:border-transparent transition-all text-sm"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="bg-cyan-950 text-white p-2 rounded-lg hover:bg-cyan-900 transition-all transform hover:scale-105 flex items-center justify-center"
                onClick={handleSendMessage}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default Chatbot;

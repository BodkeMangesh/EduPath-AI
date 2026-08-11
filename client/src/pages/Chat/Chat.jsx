import { useState } from "react";
import toast from "react-hot-toast";
import { sendMessage } from "../../services/chatService";

import "./Chat.css";

function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm EduPath AI. Ask me anything about your Learning Path.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const question = input.trim();

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage({
        message: question,
        careerId: localStorage.getItem("careerId") || "full-stack",
      });

      console.log("AI Response:", response);

      let reply = response?.reply;

      // If AI response is an object
      if (typeof reply === "object" && reply !== null) {
        reply =
          reply.rawResponse ||
          reply.error ||
          "Sorry, I could not generate a response.";
      }

      // Safety check
      if (!reply) {
        reply = "Sorry, I could not generate a response.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);

      toast.error("Unable to contact EduPath AI.");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I could not process your question right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="ai-icon">🤖</div>

        <div>
          <h1>EduPath AI</h1>
          <p>Your Personalized Learning Assistant</p>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-row ${
                message.role === "user" ? "user-row" : "assistant-row"
              }`}
            >
              <div
                className={`message-bubble ${
                  message.role === "user" ? "user-message" : "assistant-message"
                }`}
              >
                <strong>
                  {message.role === "user" ? "You" : "🤖 EduPath AI"}
                </strong>

                <p>{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant-row">
              <div className="message-bubble assistant-message">
                <strong>🤖 EduPath AI</strong>
                <p className="typing">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Ask EduPath AI anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            disabled={loading}
            rows="1"
          />

          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
          >
            {loading ? "Sending..." : "Send ➤"}
          </button>
        </div>

        <p className="chat-hint">Press Enter to send your message</p>
      </div>
    </div>
  );
}

export default Chat;

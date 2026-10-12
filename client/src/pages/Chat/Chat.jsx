import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { sendMessage } from "../../services/chatService";

import "./Chat.css";

function extractReply(response) {
  let reply =
    response?.data?.result?.reply ??
    response?.data?.reply ??
    response?.reply ??
    response?.data?.result ??
    response?.data;

  for (let i = 0; i < 3; i++) {
    if (typeof reply !== "string") break;

    const trimmed = reply.trim();

    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);

        if (typeof parsed === "string") {
          reply = parsed;
          continue;
        }

        if (parsed && typeof parsed === "object") {
          reply =
            parsed.response ??
            parsed.reply ??
            parsed.answer ??
            parsed.message ??
            parsed.rawResponse ??
            parsed.content ??
            parsed.error ??
            reply;
          continue;
        }
      } catch {}
    }

    break;
  }

  if (typeof reply === "object" && reply !== null) {
    reply =
      reply.response ??
      reply.reply ??
      reply.answer ??
      reply.message ??
      reply.rawResponse ??
      reply.content ??
      reply.error ??
      "";
  }

  if (typeof reply !== "string" || !reply.trim()) {
    return "Sorry, I could not generate a response. Please try again.";
  }

  return reply.trim();
}

function renderInline(text, keyPrefix = "inline") {
  const parts =
    text.match(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g) || [];

  if (!parts.length) return text;

  const elements = [];
  let remaining = text;
  let index = 0;

  while (remaining.length) {
    const match = remaining.match(
      /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/,
    );

    if (!match || match.index === undefined) {
      elements.push(remaining);
      break;
    }

    if (match.index > 0) {
      elements.push(remaining.slice(0, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${index++}`;

    if (token.startsWith("**") || token.startsWith("__")) {
      elements.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      elements.push(
        <code key={key} className="chat-inline-code">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      elements.push(<em key={key}>{token.slice(1, -1)}</em>);
    }

    remaining = remaining.slice(match.index + token.length);
  }

  return elements;
}

function renderFormattedMessage(content) {
  if (typeof content !== "string") {
    return <p>{String(content ?? "")}</p>;
  }

  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let listItems = [];
  let listType = null;
  let codeLines = [];
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;

    blocks.push(
      <p key={`p-${blocks.length}`}>
        {paragraph.map((line, index) => (
          <span key={index}>
            {index > 0 && " "}
            {renderInline(line, `p-${blocks.length}-${index}`)}
          </span>
        ))}
      </p>,
    );

    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;

    const Tag = listType === "ordered" ? "ol" : "ul";

    blocks.push(
      <Tag key={`list-${blocks.length}`}>
        {listItems.map((item, index) => (
          <li key={index}>
            {renderInline(item, `list-${blocks.length}-${index}`)}
          </li>
        ))}
      </Tag>,
    );

    listItems = [];
    listType = null;
  };

  const flushCode = () => {
    blocks.push(
      <pre key={`code-${blocks.length}`} className="chat-code-block">
        <code>{codeLines.join("\n")}</code>
      </pre>,
    );
    codeLines = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();

      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }

      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();

      const level = Math.min(heading[1].length, 4);
      const Tag = `h${level}`;

      blocks.push(
        <Tag key={`heading-${blocks.length}`} className="chat-answer-heading">
          {renderInline(heading[2])}
        </Tag>,
      );
      return;
    }

    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);

    if (unordered || ordered) {
      flushParagraph();

      const nextType = ordered ? "ordered" : "unordered";

      if (listType && listType !== nextType) {
        flushList();
      }

      listType = nextType;
      listItems.push((unordered || ordered)[1]);
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  if (inCodeBlock) flushCode();

  return <div className="chat-formatted-content">{blocks}</div>;
}

function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm EduPath AI. Ask me anything about your Learning Path.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const question = input.trim();
    const previousMessages = messages;

    setMessages((prev) => [...prev, { role: "user", content: question }]);

    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage({
        message: question,
        conversation: previousMessages,
      });

      const reply = extractReply(response);

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      toast.error("Unable to contact EduPath AI.");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.response?.data?.message ||
            "Sorry, I could not process your question right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleInputKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="ai-icon">🤖</div>

        <div className="chat-header-info">
          <h1>EduPath AI</h1>
          <p>Your Personalized Learning Assistant</p>
        </div>

        <div className="chat-status">
          <span className="chat-status-dot" />
          AI Assistant
        </div>
      </header>

      <main className="chat-container">
        <div
          className="messages-container"
          aria-label="Chat messages"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-row ${
                message.role === "user" ? "user-row" : "assistant-row"
              }`}
            >
              {message.role === "assistant" && (
                <div className="message-avatar" aria-hidden="true">
                  🤖
                </div>
              )}

              <div
                className={`message-bubble ${
                  message.role === "user" ? "user-message" : "assistant-message"
                }`}
              >
                <div className="message-author">
                  {message.role === "user" ? "You" : "EduPath AI"}
                </div>

                {renderFormattedMessage(message.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant-row">
              <div className="message-avatar" aria-hidden="true">
                🤖
              </div>

              <div className="message-bubble assistant-message">
                <div className="message-author">EduPath AI</div>

                <div className="chat-loading" aria-label="AI is thinking">
                  <span />
                  <span />
                  <span />
                  <span className="chat-loading-text">Thinking</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          className="chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
            handleSendMessage();
          }}
        >
          <textarea
            ref={inputRef}
            className="chat-textarea"
            placeholder="Message EduPath AI..."
            aria-label="Message EduPath AI"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={loading}
            rows={1}
          />

          <button
            type="submit"
            className="chat-send-button"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            {loading ? (
              <span className="chat-send-spinner" />
            ) : (
              <span aria-hidden="true">↑</span>
            )}
          </button>
        </form>

        <p className="chat-hint">
          Enter to send · Shift + Enter for a new line
        </p>

        <button
          type="button"
          className="chat-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </main>
    </div>
  );
}

export default Chat;

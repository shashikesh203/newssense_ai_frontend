import React, { useState, useRef, useEffect } from "react";
import { NewsIngestionPopup } from "./IngestNews";
import axiosClient from "../lib/axiosClient";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

// Component to render message content with code highlighting
const MessageContent = ({ content }: { content: string }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Function to parse and render content with code blocks
  const parseContent = (text: string) => {
    // Split by code blocks (```language\ncode\n```)
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Check if this part is a code block
      if (part.startsWith("```") && part.endsWith("```")) {
        // Extract language and code
        const lines = part.slice(3, -3).split("\n");
        const language = lines[0] || "";
        const code = lines.slice(1).join("\n");

        return (
          <div key={index} className="my-4">
            <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center justify-between">
              <span className="text-gray-300 text-sm font-medium">
                {language || "code"}
              </span>
              <button
                onClick={() => copyToClipboard(code)}
                className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-sm"
              >
                {copiedCode === code ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-800 rounded-b-lg p-4 overflow-x-auto">
              <pre className="text-gray-100 text-sm">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        );
      }

      // Check for inline code (`code`)
      const inlineCodeParts = part.split(/(`[^`]+`)/g);

      return (
        <div key={index} className="whitespace-pre-wrap">
          {inlineCodeParts.map((inlinePart, inlineIndex) => {
            if (inlinePart.startsWith("`") && inlinePart.endsWith("`")) {
              return (
                <code
                  key={inlineIndex}
                  className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                >
                  {inlinePart.slice(1, -1)}
                </code>
              );
            }
            return inlinePart;
          })}
        </div>
      );
    });
  };

  return <div className="text-slate-800 text-sm">{parseContent(content)}</div>;
};

const ChatBox = () => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! 👋 I'm your AI News RAG Assistant. Upload your JSON news file and ask anything related to it.",
      sender: "ai",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);

    // Create placeholder AI message that will be updated
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      text: "",
      sender: "ai",
    };
    setMessages((prev) => [...prev, aiMessage]);
    const sessionId = localStorage.getItem("sessionId") || crypto.randomUUID();

    localStorage.setItem("sessionId", sessionId);

    try {
      const res = await axiosClient.post("/chat", {
        userQuery: inputText,
        sessionId: sessionId,
      });

      const data = res.data;
      console.log(data, "yyyyyyyyyyyyyyyyyyyyyyyyy");
      if (Object.keys(data).length === 0) {
        data.response =
          "Apologies! We are currently experiencing some technical issues. Please try again later.";
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, text: data.response } // ✅ only response text
            : msg,
        ),
      );
    } catch (err) {
      console.error(err);
      // Handle error by updating the AI message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                text: "Oops! Something went wrong while fetching the answer. Please try again.",
              }
            : msg,
        ),
      );
    }

    setIsLoading(false);
    setInputText("");
  };
  const handleNewsIngestion = async () => {
    setShowPopup(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="bg-gradient-to-r from-teal-600 via-teal-400 to-teal-200 font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">AI News RAG Assistant</h1>
            <p className="text-sm text-teal-100">
              Ask questions directly from your uploaded JSON news data
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="
             w-[200px] mt-6 mb-4
             bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 
             text-white font-semibold py-3 rounded-lg 
             transition-all duration-300 ease-in-out
             hover:from-purple-700 hover:via-purple-600 hover:to-pink-600
             hover:scale-[1.02]
             hover:shadow-lg
             cursor-pointer"
            onClick={handleNewsIngestion}
          >
            Upload News JSON
          </button>
        </div>
      </div>
      {showPopup && <NewsIngestionPopup onClose={() => setShowPopup(false)} />}
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto px-4">
          {messages.length === 1 && (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                What would you like to know from your news file?
              </h2>
              <p className="text-gray-500 text-center max-w-md">
                Upload your JSON news dataset using the button above, then ask
                questions like: "Summarize the latest update", "What is
                trending?", or "Tell me details about a specific topic."
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={message.id} className="py-4">
              {message.sender === "ai" ? (
                // AI Message - Left aligned
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    AI
                  </div>
                  <div className="max-w-3xl bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-slate-200">
                    {message.text ? (
                      <MessageContent content={message.text} />
                    ) : (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // User Message - Right aligned
                <div className="flex gap-3 items-start justify-end">
                  <div className="max-w-2xl bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl rounded-tr-none px-4 py-3 shadow-md">
                    <p className="text-white text-sm whitespace-pre-wrap">
                      {message.text}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex-shrink-0 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-slate-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask something from your uploaded news..."
              disabled={isLoading}
              rows={1}
              className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-slate-900 placeholder-slate-500 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20 disabled:opacity-50 max-h-10"
              style={{
                minHeight: "48px",
                height: "auto",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputText.trim()}
              className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 disabled:opacity-50 text-white rounded-lg transition-all transform hover:scale-105 disabled:hover:scale-100"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-500 text-center">
            Responses are generated from your uploaded news JSON. Please verify
            critical information when needed.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;

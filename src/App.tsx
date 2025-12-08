import React, { useState, useRef, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today? 🚀',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me think about that... 🤔",
        "I understand what you're asking. Here's my perspective... ✨",
        "Interesting point! I'd love to help you with that... 💡",
        "Thanks for sharing that with me! Here's what I think... 🎯"
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `${randomResponse} You said: "${userMessage.text}". This is a simulated response with some personality!`,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Router>
      <div className="flex flex-col h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
        {/* Header with gradient and glow effect */}
        <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"></div>
          <div className="relative flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                AI Chat Assistant
              </h1>
              <p className="text-blue-100 text-sm opacity-90">Your intelligent companion</p>
            </div>
          </div>
        </header>

        {/* Messages Container with custom scrollbar */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'bg-gradient-to-br from-green-400 to-blue-500 text-white shadow-lg'
                }`}>
                  {message.sender === 'user' ? '👤' : '🤖'}
                </div>
                
                {/* Message bubble */}
                <div
                  className={`px-6 py-3 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border-2 border-gray-100 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <span className={`text-xs mt-2 block ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Enhanced loading indicator */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-end space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  🤖
                </div>
                <div className="bg-white text-gray-800 border-2 border-gray-100 px-6 py-3 rounded-2xl rounded-bl-md shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-6 shadow-2xl">
          <div className="flex space-x-4 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... ✨"
                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white shadow-lg"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <span className="text-sm">Press Enter</span>
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              <span className="flex items-center space-x-2">
                <span>Send</span>
                <span className="text-lg">🚀</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-blue-300::-webkit-scrollbar-thumb {
          background-color: #93c5fd;
          border-radius: 3px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </Router>
  )
}

export default App
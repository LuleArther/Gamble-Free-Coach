import { useState, useEffect, useRef } from 'react'
import { sendToCoach, QUICK_REPLY_OPTIONS } from '../services/gemini'
import { logEvent } from '../services/supabase'
import './Coach.css'

function Coach({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your Gamble-Free Coach. I'm here to support you without judgment. What's on your mind today?",
      quickReplies: QUICK_REPLY_OPTIONS.slice(0, 3)
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    logEvent({
      user_id: user?.id || 'anonymous',
      type: 'coach_opened',
      metadata: { timestamp: new Date().toISOString() }
    })
  }, [])

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return

    const userMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await sendToCoach(message, messages)
      
      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        quickReplies: response.quickReplies,
        isUrgent: response.isUrgent
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      logEvent({
        user_id: user?.id || 'anonymous',
        type: 'coach_message',
        metadata: { 
          user_message: message,
          is_urgent: response.isUrgent || false
        }
      })
      
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Try the Quick Help feature for immediate support, or come back in a moment.",
        quickReplies: ["Quick Help", "Try again"]
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickReply = (reply) => {
    handleSendMessage(reply)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="page coach">
      <div className="coach-header">
        <h1>Coach Chat</h1>
        <p>Your judgment-free support, 24/7</p>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              {message.role === 'assistant' && (
                <div className="avatar">🤝</div>
              )}
              <div className="message-content">
                <div className={`message-bubble ${message.isUrgent ? 'urgent' : ''}`}>
                  {message.content}
                </div>
                {message.quickReplies && message.quickReplies.length > 0 && (
                  <div className="quick-replies">
                    {message.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        className="chip"
                        onClick={() => handleQuickReply(reply)}
                        disabled={isLoading}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="avatar">🤝</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <textarea
            className="chat-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            rows="1"
          />
          <button
            className="send-button"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Coach

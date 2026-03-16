// src/ChatHistory.tsx
import React, { useEffect, useRef } from 'react';
import type { Message } from './ChatRoom';
import Logo from  '../assets/images/logo.png'; // Adjust the path as necessary
interface ChatHistoryProps {
  messages: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat-history">
        <div className="empty-state">
          <header className="header">
            <div className="logo">
              <div className="">
                <img className='logo-icon' src={Logo} alt='BabyMind' />
              </div>
            </div>
            <h1>CultureMind Chatbot</h1>
            <p>Start a conversation to get started</p>

          </header>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-history">
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className={`message-wrapper ${message.type}`}>
            <div className={`message-bubble ${message.type}`}>
              {message.type === 'bot' && message.question && message.answer ? (
                <>
                  <p className="bot-question-context"><em>(Understanding: {message.question})</em></p>
                  <p>{message.answer}</p>
                </>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatHistory;
import { useState } from 'react';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>([]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, sender: 'user' as const };
    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        text: "Thank you for your message! I'll get back to you soon. In the meantime, feel free to fill out the contact form or reach out directly.",
        sender: 'bot' as const
      };
      setMessages([...messages, userMessage, botMessage]);
    }, 1000);
  };

  return (
    <>
      <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
        <div className="chat-header" onClick={() => setIsOpen(!isOpen)}>
          <div className="chat-header-content">
            <span className="chat-title">Chat with us</span>
            <span className="chat-status">Online</span>
          </div>
          <button className="chat-toggle" aria-label="Toggle chat">
            {isOpen ? '−' : '+'}
          </button>
        </div>
        {isOpen && (
          <div className="chat-body">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-welcome">
                  <p>Hello! How can I help you today?</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.sender}`}>
                    <div className="message-bubble">
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form className="chat-input-form" onSubmit={handleSend}>
              <input
                type="text"
                className="chat-input"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit" className="chat-send-button" aria-label="Send message">
                →
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatWidget;


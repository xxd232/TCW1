import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { io, Socket } from 'socket.io-client';
import { api } from '../services/api';
import { Currency } from '../types';
import './Chat.css';

interface Message {
  from: string;
  to: string;
  message: string;
  timestamp: string;
}

interface ChatProps {
  currentUserId: string;
  recipientId: string;
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ currentUserId, recipientId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [canAddMe, setCanAddMe] = useState(true);
  const [canMessageMe, setCanMessageMe] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('join', currentUserId);

    newSocket.on('receive-message', (data: Message) => {
      if (data.from === recipientId) {
        setMessages(prev => [...prev, data]);
      }
    });

    newSocket.on('message-sent', (data: Message) => {
      if (data.to === recipientId) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [currentUserId, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const trimmed = newMessage.trim();
    const payMatch = trimmed.match(/^\/pay\s+(\d+(?:\.\d+)?)\s+([a-zA-Z]+)$/);

    if (payMatch) {
      const amount = Number(payMatch[1]);
      const currencyRaw = payMatch[2].toUpperCase();
      const allowedCurrencies: Currency[] = ['BTC', 'USDT', 'ETH', 'PAYPAL'];
      const normalized = currencyRaw === 'PAYPAL' ? 'PAYPAL' : currencyRaw;
      const currency = allowedCurrencies.includes(normalized as Currency)
        ? (normalized as Currency)
        : null;

      if (!amount || amount <= 0 || !currency) {
        setMessages(prev => [
          ...prev,
          {
            from: currentUserId,
            to: recipientId,
            message: '⚠️ Invalid payment format. Use /pay 10 USDT',
            timestamp: new Date().toISOString()
          }
        ]);
        setNewMessage('');
        return;
      }

      (async () => {
        try {
          await api.sendPayment(currentUserId, currency, amount, recipientId);
          const paymentMessage: Message = {
            from: currentUserId,
            to: recipientId,
            message: `💸 Payment sent: ${amount} ${currency}`,
            timestamp: new Date().toISOString()
          };
          socket.emit('send-message', paymentMessage);
        } catch (error: any) {
          const message = error?.response?.data?.message || 'Payment failed.';
          setMessages(prev => [
            ...prev,
            {
              from: currentUserId,
              to: recipientId,
              message: `⚠️ ${message}`,
              timestamp: new Date().toISOString()
            }
          ]);
        }
      })();

      setNewMessage('');
      return;
    }

    const messageData: Message = {
      from: currentUserId,
      to: recipientId,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    socket.emit('send-message', messageData);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>💬 Chat with {recipientId}</h3>
        <div className="chat-header-actions">
          <button onClick={() => setShowPrivacy(true)} className="privacy-btn" title="Privacy Settings">🔒</button>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
      </div>

      <Modal isOpen={showPrivacy} title="Privacy Settings" onClose={() => setShowPrivacy(false)}>
        <div className="privacy-modal-content">
          <label>
            <input type="checkbox" checked={onlineStatus} onChange={e => setOnlineStatus(e.target.checked)} />
            Show online status
          </label>
          <label>
            <input type="checkbox" checked={canAddMe} onChange={e => setCanAddMe(e.target.checked)} />
            Allow users to add me as friend
          </label>
          <label>
            <input type="checkbox" checked={canMessageMe} onChange={e => setCanMessageMe(e.target.checked)} />
            Allow users to message me
          </label>
        </div>
      </Modal>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start a conversation!</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.from === currentUserId ? 'sent' : 'received'}`}
            >
              <div className="message-row">
                {msg.from !== currentUserId && (
                  <img src="/default-avatar.png" alt="avatar" className="msg-avatar" />
                )}
                <div className="message-bubble">
                  <div className="message-content">{msg.message}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                {msg.from === currentUserId && (
                  <img src="/default-avatar.png" alt="avatar" className="msg-avatar" />
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input-container">
        <button className="input-action-btn" title="Send Photo/Video">
          <span role="img" aria-label="media">📎</span>
        </button>
        <button className="input-action-btn" title="Start Call">
          <span role="img" aria-label="call">📞</span>
        </button>
        <button className="input-action-btn" title="Send Payment">
          <span role="img" aria-label="pay">💸</span>
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="message-input"
        />
        <button onClick={sendMessage} className="send-btn">
          Send
        </button>
      </div>
      <div className="chat-hint">Tip: send payment with /pay 10 USDT</div>
    </div>
  );
};

export default Chat;

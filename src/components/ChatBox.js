import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './ChatBox.css';

const socket = io('http://localhost:5000');

const ChatBox = ({ currentUserId, targetUserId, targetUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/messages/${currentUserId}/${targetUserId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('Error fetching messages:', err));
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    socket.emit('joinRoom', { senderId: currentUserId, receiverId: targetUserId });

    socket.on('receiveMessage', (message) => {
      if (
        (message.senderId === currentUserId && message.receiverId === targetUserId) ||
        (message.senderId === targetUserId && message.receiverId === currentUserId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  

  const handleSend = () => {
    if (!input.trim()) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: targetUserId,
      message: input,
      timestamp: new Date(),
    };

    socket.emit('sendMessage', messageData);
    setMessages([...messages, messageData]);
    setInput('');
  };

  // Helper to group messages by date
  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h4>{targetUser?.name} ({targetUser?.role})</h4>
      </div>

      <div className="chat-messages">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="date-separator">{date}</div>
            {msgs.map((msg, idx) => (
                <div
                    key={idx}
                    style={{ display: 'flex', justifyContent: msg.senderId === currentUserId ? 'flex-end' : 'flex-start' }}
                >
                    <div className={`message-bubble ${msg.senderId === currentUserId ? 'sent' : 'received'}`}>
                    <div className="message-text">{msg.message}</div>
                    <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    </div>
                </div>
                ))}

          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;

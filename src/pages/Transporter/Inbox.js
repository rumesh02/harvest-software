import React from 'react';
import './Inbox.css';

const Inbox = ({ messages, onSelectUser, selectedUser }) => {
  return (
    <div className="inbox-list">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`inbox-item ${selectedUser.id === message.id ? 'active' : ''}`}
          onClick={() => onSelectUser(message)}
        >
          <img src={message.avatar || "/placeholder.svg"} alt={message.name} className="inbox-avatar" />
          <div className="inbox-message-content">
            <div className="inbox-message-header">
              <h3>{message.name}</h3>
              {message.lastSeen && <span className="inbox-time">{message.lastSeen}</span>}
            </div>
            {message.message && <p className="inbox-message-preview">{message.message}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Inbox;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChatBox from './ChatBox';
import './ChatContainer.css'; // We'll style it after structure

const ChatContainer = ({ currentUserId }) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch past chat users
  useEffect(() => {
    if (!currentUserId) return;

    axios.get(`http://localhost:5000/api/messages/contacts/${currentUserId}`)
      .then(res => setChatUsers(res.data))
      .catch(err => console.error('Failed to load chat contacts:', err));
  }, [currentUserId]);

  // Fetch all users for dropdown
  useEffect(() => {
    axios.get('http://localhost:5000/api/users')
      .then(res => setAllUsers(res.data))
      .catch(err => console.error('Failed to load users:', err));
  }, []);

  const startNewChat = (e) => {
    const selectedId = e.target.value;
    const user = allUsers.find((u) => u.auth0Id === selectedId);
    if (user) setSelectedUser(user);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h3>Chats</h3>
        <div className="chat-list">
          {chatUsers.map((user) => (
            <div
              key={user.auth0Id}
              className={`chat-user ${selectedUser?.auth0Id === user.auth0Id ? 'active' : ''}`}
              onClick={() => handleSelectUser(user)}
            >
              <span className="user-name">{user.name}</span>
              <span className="user-role">({user.role})</span>
            </div>
          ))}
        </div>

        <div className="new-chat">
          <h4>Start New Chat</h4>
          <select onChange={startNewChat} defaultValue="">
            <option value="">Select user</option>
            {allUsers
              .filter(u => u.auth0Id !== currentUserId && !chatUsers.some(c => c.auth0Id === u.auth0Id))
              .map((u) => (
                <option key={u.auth0Id} value={u.auth0Id}>
                  {u.name} ({u.role})
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <ChatBox currentUserId={currentUserId} targetUserId={selectedUser.auth0Id} targetUser={selectedUser} />
        ) : (
          <div className="no-chat-selected">Select a conversation</div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;

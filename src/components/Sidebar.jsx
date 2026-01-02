import React from 'react';

const Sidebar = ({ currentUser, users, selectedUser, onSelectUser }) => {
  if (!currentUser) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="avatar mine">
          {currentUser.username?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <h3>{currentUser.username}</h3>
          <span className="status-badge">Online</span>
        </div>
      </div>

      <div className="users-list">
        <h4>General</h4>
        <div
          className={`user-item ${selectedUser?.id === 'everyone' ? 'active' : ''}`}
          onClick={() => onSelectUser({ id: 'everyone', username: 'Everyone', isGroup: true })}
        >
          <div className="avatar group" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
            #
          </div>
          <div className="user-details">
            <span className="name">Public Room</span>
            <span className="last-message">Broadcast to all</span>
          </div>
        </div>

        <h4>Active Users</h4>
        {(!users || users.filter(u => u.id !== currentUser.id).length === 0) ? (
          <div className="empty-state">No other users online</div>
        ) : (
          users.filter(u => u.id !== currentUser.id).map(user => (
            <div
              key={user.id}
              className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
              onClick={() => onSelectUser(user)}
            >
              <div className="avatar">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="name">{user.username}</span>
                <span className="last-message">Click to chat</span>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .sidebar {
          width: 300px;
          background: rgba(0, 0, 0, 0.2);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .users-list {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .users-list h4 {
          color: var(--text-secondary);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        .user-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: 8px;
        }

        .user-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .user-item.active {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #d946ef);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 1.1rem;
        }
        
        .avatar.mine {
            width: 48px;
            height: 48px;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .last-message {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .empty-state {
            color: var(--text-secondary);
            font-size: 0.9rem;
            text-align: center;
            padding: 20px 0;
            font-style: italic;
        }
        
        .status-badge {
            font-size: 0.7rem;
            color: #4ade80;
            background: rgba(74, 222, 128, 0.1);
            padding: 2px 8px;
            border-radius: 10px;
            border: 1px solid rgba(74, 222, 128, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;

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
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .users-list {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }

        .users-list h4 {
          color: var(--text-tertiary);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin: 24px 12px 12px;
        }

        .user-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: 4px;
          border: 1px solid transparent;
        }

        .user-item:hover {
          background: var(--surface-hover);
        }

        .user-item.active {
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 1.2rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          transition: transform 0.2s;
        }
        
        .user-item:hover .avatar {
            transform: scale(1.05);
        }
        
        .avatar.mine {
            width: 52px;
            height: 52px;
            border-radius: 18px;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .last-message {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .empty-state {
            color: var(--text-tertiary);
            font-size: 0.9rem;
            text-align: center;
            padding: 40px 0;
            opacity: 0.7;
        }
        
        .status-badge {
            font-size: 0.7rem;
            color: #4ade80;
            background: rgba(74, 222, 128, 0.08);
            padding: 4px 10px;
            border-radius: 20px;
            border: 1px solid rgba(74, 222, 128, 0.15);
            font-weight: 500;
            letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;

import React, { useState } from 'react';

const EmptyState = ({ currentRoom, onCreateRoom, onCopyLink }) => {
  const [joinId, setJoinId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinId.trim()) {
      window.location.search = `?room=${joinId.trim()}`;
    }
  };

  return (
    <div className="empty-state">
      <div className="lock-icon-container">
        <div className="lock-icon">🔒</div>
        <div className="lock-pulse"></div>
      </div>

      <h2 className="title">Secure End-to-End Encryption</h2>
      <p className="subtitle">Your messages live only on your devices.</p>

      <div className="actions">
        {currentRoom && currentRoom !== 'global' ? (
          <button onClick={onCopyLink} className="cta-primary">
            🔗 Share Invite Link
          </button>
        ) : (
          <button onClick={onCreateRoom} className="cta-primary">
            ➕ Create Secure Room
          </button>
        )}

        <div className="join-section">
          {!isJoining ? (
            <button onClick={() => setIsJoining(true)} className="cta-text">
              Join existing room
            </button>
          ) : (
            <form onSubmit={handleJoin} className="join-form">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                className="join-input"
                autoFocus
              />
              <button type="submit" className="join-btn">→</button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .empty-state {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--text-primary);
          animation: fadeIn 0.5s ease;
          padding: 2rem;
        }


        .lock-icon-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .lock-icon {
          font-size: 3rem;
          z-index: 2;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
        }

        .lock-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 50%;
          z-index: 1;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }

        .title {
          font-size: 1.5rem;
          margin-bottom: 8px;
          font-weight: 600;
          font-style: italic; /* Match user screenshot style */
          width: 100%;
        }

        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 40px;
          font-size: 0.95rem;
          max-width: 400px; /* Increased slightly */
          margin-left: auto;
          margin-right: auto;
          line-height: 1.5;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 280px;
        }

        .cta-primary {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }

        .cta-text {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cta-text:hover {
          border-color: rgba(255, 255, 255, 0.3);
          color: white;
        }

        .join-form {
          display: flex;
          gap: 8px;
        }

        .join-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px;
          border-radius: 8px;
          color: white;
          outline: none;
        }

        .join-input:focus {
          border-color: var(--primary-color);
        }

        .join-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 40px;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .join-btn:hover {
            background: var(--primary-color);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default EmptyState;

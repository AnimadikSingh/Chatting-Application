import React, { useState } from 'react';

const ChatControls = ({ onSettingsChange }) => {
    const [selfDestruct, setSelfDestruct] = useState(0); // 0 = off, seconds
    const [timeLock, setTimeLock] = useState(0); // 0 = off, seconds delay

    const handleDestructChange = (val) => {
        setSelfDestruct(val);
        onSettingsChange({ selfDestruct: val, timeLock });
    };

    const handleLockChange = (val) => {
        setTimeLock(val);
        onSettingsChange({ selfDestruct, timeLock: val });
    };

    return (
        <div className="chat-controls">
            <div className="control-group">
                <label>🔥 Self-Destruct:</label>
                <select value={selfDestruct} onChange={(e) => handleDestructChange(Number(e.target.value))}>
                    <option value={0}>Off</option>
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                </select>
            </div>

            <div className="control-group">
                <label>⏳ Time-Lock (Reveal in):</label>
                <select value={timeLock} onChange={(e) => handleLockChange(Number(e.target.value))}>
                    <option value={0}>Off</option>
                    <option value={60}>1m</option>
                    <option value={300}>5m</option>
                    <option value={3600}>1h</option>
                </select>
            </div>

            <style>{`
        .chat-controls {
          display: flex;
          gap: 20px;
          padding: 12px 24px;
          background: rgba(0, 0, 0, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 0.85rem;
          color: var(--text-tertiary);
          backdrop-filter: blur(10px);
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        label {
            font-weight: 500;
            letter-spacing: 0.3px;
        }

        select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          padding: 6px 12px;
          border-radius: 99px; /* Pill shape */
          cursor: pointer;
          outline: none;
          transition: var(--transition);
          font-weight: 500;
        }
        
        select:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.1);
        }

        select:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        option {
            background: #18181b;
            color: white;
            padding: 8px;
        }
      `}</style>
        </div>
    );
};

export default ChatControls;

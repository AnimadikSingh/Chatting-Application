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
          gap: 16px;
          padding: 10px 20px;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          outline: none;
        }

        select:focus {
            border-color: var(--primary-color);
        }

        option {
            background: #1a1a1a;
        }
      `}</style>
        </div>
    );
};

export default ChatControls;

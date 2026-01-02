import React, { useState } from 'react';

const ChatHeader = ({
    user,
    fingerprint,
    onVerify,
    onClearChat,
    onLeaveRoom,
    onOpenSettings
}) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="chat-header">
            <div className="header-info">
                <div className="user-details">
                    <h3>{user.username}</h3>
                    {user.room !== 'global' && <span className="room-tag">{user.room}</span>}
                </div>

                <div className="header-actions">
                    <div
                        className="secure-badge interactive"
                        onClick={onVerify}
                        title="Click to verify encryption"
                    >
                        <span className="dot"></span>
                        {fingerprint ? 'End-to-End Encrypted' : ' securing...'}
                    </div>

                    <div className="menu-container">
                        <button
                            className="menu-btn"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            ⋮
                        </button>

                        {showMenu && (
                            <div className="dropdown-menu">
                                <div className="menu-item" onClick={() => { onVerify(); setShowMenu(false); }}>
                                    🔐 Verify Keys
                                </div>
                                <div className="menu-item" onClick={() => { onOpenSettings(); setShowMenu(false); }}>
                                    ⚙️ Settings
                                </div>
                                <div className="menu-item" onClick={() => { onClearChat(); setShowMenu(false); }}>
                                    🧹 Clear Chat
                                </div>
                                <div className="menu-item danger" onClick={() => { onLeaveRoom(); setShowMenu(false); }}>
                                    🚪 Leave Room
                                </div>
                            </div>
                        )}
                    </div>

                    {showMenu && (
                        <div className="menu-backdrop" onClick={() => setShowMenu(false)}></div>
                    )}
                </div>
            </div>

            <style>{`
        .chat-header {
            padding: 16px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            z-index: 10;
        }

        .header-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .user-details {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .user-details h3 {
            margin: 0;
            font-weight: 600;
            color: #f3f4f6;
        }
        
        .room-tag {
            background: rgba(255,255,255,0.1);
            font-size: 0.7rem;
            padding: 2px 6px;
            border-radius: 4px;
            color: var(--text-secondary);
        }
        
        .header-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .secure-badge {
            font-size: 0.75rem;
            color: #4ade80;
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(74, 222, 128, 0.1);
            padding: 4px 8px;
            border-radius: 4px;
            transition: var(--transition);
        }
        
        .secure-badge.interactive {
            cursor: pointer;
        }
        
        .secure-badge.interactive:hover {
            background: rgba(74, 222, 128, 0.2);
        }

        .secure-badge .dot {
            width: 6px;
            height: 6px;
            background: #4ade80;
            border-radius: 50%;
            box-shadow: 0 0 5px #4ade80;
        }
        
        .menu-container {
            position: relative;
        }
        
        .menu-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0 8px;
            border-radius: 4px;
        }
        
        .menu-btn:hover {
            background: rgba(255,255,255,0.1);
            color: white;
        }
        
        .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 8px;
            background: #1f2937;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            width: 160px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            z-index: 100;
            overflow: hidden;
            animation: slideDown 0.1s ease;
        }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .menu-item {
            padding: 12px 16px;
            font-size: 0.9rem;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .menu-item:hover {
            background: rgba(255,255,255,0.05);
        }
        
        .menu-item.danger {
            color: #f87171;
            border-top: 1px solid rgba(255,255,255,0.05);
        }
        
        .menu-item.danger:hover {
            background: rgba(248, 113, 113, 0.1);
        }
        
        .menu-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 99;
        }
      `}</style>
        </div>
    );
};

export default ChatHeader;

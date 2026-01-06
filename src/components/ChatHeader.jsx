import React, { useState } from 'react';

const ChatHeader = ({ user, fingerprint, onVerify, onClearChat, onLeaveRoom, onOpenSettings, onCall }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="chat-header">
            <div className="header-info">
                <div className="user-details">
                    <h3>{user.username}</h3>
                    {user.room !== 'global' && <span className="room-tag">{user.room}</span>}
                </div>

                <div className="header-actions">
                    {onCall && (
                        <button className="icon-btn call" onClick={onCall} title="Start Video Call">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        </button>
                    )}

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
            padding: 20px 32px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(12px);
            z-index: 20;
        }

        .header-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .user-details {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .user-details h3 {
            margin: 0;
            font-weight: 700;
            font-size: 1.2rem;
            color: var(--text-primary);
            letter-spacing: -0.5px;
        }
        
        .room-tag {
            background: rgba(255,255,255,0.05);
            font-size: 0.7rem;
            padding: 4px 10px;
            border-radius: 20px;
            color: var(--text-secondary);
            border: 1px solid rgba(255,255,255,0.05);
        }
        
        .header-actions {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .secure-badge {
            font-size: 0.75rem;
            color: #4ade80;
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(74, 222, 128, 0.08);
            padding: 6px 12px;
            border-radius: 20px;
            border: 1px solid rgba(74, 222, 128, 0.15);
            transition: var(--transition);
        }
        
        .secure-badge.interactive {
            cursor: pointer;
        }
        
        .secure-badge.interactive:hover {
            background: rgba(74, 222, 128, 0.15);
            transform: translateY(-1px);
        }

        .secure-badge .dot {
            width: 6px;
            height: 6px;
            background: #4ade80;
            border-radius: 50%;
            box-shadow: 0 0 8px #4ade80;
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
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            transition: var(--transition);
        }
        
        .menu-btn:hover {
            background: var(--surface-hover);
            color: white;
        }
        
        .dropdown-menu {
            position: absolute;
            top: 120%;
            right: 0;
            background: rgba(30, 30, 35, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            width: 180px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            z-index: 100;
            backdrop-filter: blur(20px);
            overflow: hidden;
            animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            padding: 6px;
        }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .menu-item {
            padding: 10px 12px;
            font-size: 0.9rem;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            border-radius: 8px;
            transition: var(--transition);
        }
        
        .menu-item:hover {
            background: var(--surface-hover);
        }
        
        .menu-item.danger {
            color: #f87171;
            margin-top: 4px;
            border-top: 1px solid rgba(255,255,255,0.05);
            border-radius: 0 0 8px 8px;
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

import { useState, useEffect } from 'react';

const MessageBubble = ({ text, isOwn, timestamp, status, metadata, devMode, senderName }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(null);

  useEffect(() => {
    // Self Destruct Logic
    if (metadata?.expiresIn) {
      const expiryTime = timestamp + (metadata.expiresIn * 1000);
      const remaining = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));

      if (remaining <= 0) {
        setIsVisible(false);
        return;
      }

      setTimeLeft(remaining);

      const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.ceil((expiryTime - now) / 1000);
        if (diff <= 0) {
          setIsVisible(false);
          clearInterval(interval);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [metadata, timestamp]);

  useEffect(() => {
    // Time Lock Logic
    if (metadata?.unlocksAt) {
      if (Date.now() < metadata.unlocksAt) {
        setIsLocked(true);

        const updateLock = () => {
          const diff = Math.ceil((metadata.unlocksAt - Date.now()) / 1000);
          if (diff <= 0) {
            setIsLocked(false);
            setLockTimeLeft(null);
          } else {
            setLockTimeLeft(diff);
            setTimeout(updateLock, 1000);
          }
        }
        updateLock();
      }
    }
  }, [metadata]);

  if (!isVisible) return null;

  return (
    <div className={`message-wrapper ${isOwn ? 'own' : 'other'} ${isLocked ? 'locked' : ''} ${timeLeft ? 'destructing' : ''}`}>
      {/* Sender Name for Group Chats */}
      {senderName && !isOwn && (
        <span className="sender-name">{senderName}</span>
      )}

      <div className="message-content">
        {isLocked ? (
          <div className="locked-content">
            <span>🔒 Locked</span>
            <small>Reveals in {lockTimeLeft}s</small>
          </div>
        ) : devMode ? (
          <div className="dev-content" style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#4ade80', overflowWrap: 'break-word' }}>
            <div style={{ opacity: 0.6, fontSize: '0.7rem' }}>ENCRYPTED PAYLOAD:</div>
            {btoa(text).substring(0, 50)}...
            <div style={{ marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 4, color: 'white' }}>
              DEC: {text}
            </div>
          </div>
        ) : (
          <p>{text}</p>
        )}

        <div className="message-footer">
          <span className="timestamp">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          <div className="metadata-icons">
            {isLocked && <span title="Time Locked">⏳</span>}
            {timeLeft !== null && <span className="timer" title="Self Destructing">🔥 {timeLeft}s</span>}
            <span className="secure-lock" title="Encrypted">🔒</span>
            {isOwn && (
              <span className="status-tick" title="Delivered">
                {/* Double tick SVG */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .message-wrapper {
          display: flex;
          flex-direction: column;
          margin-bottom: 24px;
          max-width: 80%;
          align-self: flex-start;
          animation: fadeIn 0.4s var(--transition-spring);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .message-wrapper.own {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message-content {
          padding: 14px 20px;
          border-radius: 20px;
          border-top-left-radius: 4px;
          line-height: 1.6;
          position: relative;
          min-width: 140px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          font-size: 0.95rem;
          transition: transform 0.2s;
        }
        
        .message-content:hover {
            transform: translateY(-1px);
        }

        /* SENDER STYLES (Glass + Gradient) */
        .message-wrapper.own .message-content {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
            border: 1px solid rgba(168, 85, 247, 0.2);
            border-top-left-radius: 20px;
            border-top-right-radius: 4px;
            color: white;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15), inset 0 0 20px rgba(255,255,255,0.02);
        }
        
        /* RECEIVER STYLES (Matte Deep) */
        .message-wrapper.other .message-content {
          background: rgba(30, 30, 35, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Destructing Effect */
        .message-wrapper.destructing .message-content {
            border: 1px solid rgba(239, 68, 68, 0.5);
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent);
            animation: pulseRed 2s infinite;
        }
        
        @keyframes pulseRed {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2); }
            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        
        .message-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end; /* Align bottom */
            margin-top: 8px;
            gap: 16px;
            font-size: 0.7rem;
            color: rgba(255, 255, 255, 0.4);
            user-select: none;
            padding: 0 4px;
        }
        
        .metadata-icons {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .secure-lock {
            font-size: 0.75rem;
            opacity: 0.6;
        }
        
        .timer {
            color: #fca5a5;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .status-tick {
            color: #4ade80; /* Success green */
            display: flex;
            align-items: center;
            filter: drop-shadow(0 0 2px rgba(74, 222, 128, 0.5));
        }

        .sender-name {
            font-size: 0.75rem;
            color: var(--primary-light);
            margin-bottom: 6px;
            margin-left: 12px;
            font-weight: 600;
            letter-spacing: 0.3px;
        }
      `}</style>
    </div>
  );
};

export default MessageBubble;

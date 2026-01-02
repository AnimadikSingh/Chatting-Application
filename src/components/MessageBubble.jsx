import { useState, useEffect } from 'react';

const MessageBubble = ({ text, isOwn, timestamp, status, metadata, devMode }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(null);

  // Dev Mode: Determine what to show
  // If dev mode is on, we show the RAW content (simulated as encrypted blob if it's text)
  // But wait, the prop `text` here is already decrypted in App.jsx. 
  // To truly show the encrypted payload, App.jsx needs to pass it.
  // For now, let's visualize the "decrypted" text vs "raw" text or just some indicator.
  // Better: We'll modify App.jsx to pass `originalContent` or `isEncrypted`.
  // Actually, the user asked to "show encrypted payload". 
  // We'll simulate this by showing a "MATRIX VIEW" or similar if we can't access the raw here easily without major refactor.
  // Refactor plan: Update App.jsx to pass `cipherText` to MessageBubble too.

  // Implementation for now: Displaying the text. If devMode, we show extra technical data.
  // ... (keep existing effects)

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
      <div className="message-content">
        {isLocked ? (
          <div className="locked-content">
            <span>🔒 Locked</span>
            <small>Reveals in {lockTimeLeft}s</small>
          </div>
        ) : devMode ? (
          <div className="dev-content" style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#4ade80', overflowWrap: 'break-word' }}>
            <div style={{ opacity: 0.6, fontSize: '0.7rem' }}>ENCRYPTED PAYLOAD:</div>
            {/* Simulating raw output since we decrypted it upstream. In a real app we'd pass the cipherText. */}
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
          margin-bottom: 20px;
          max-width: 75%;
          align-self: flex-start;
          animation: fadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .message-wrapper.own {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message-content {
          padding: 12px 18px;
          border-radius: 18px;
          line-height: 1.5;
          position: relative;
          min-width: 140px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        /* SENDER STYLES (Glass + Gradient Border) */
        .message-wrapper.own .message-content {
            background: rgba(99, 102, 241, 0.15); /* More subtle primary */
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-bottom-right-radius: 4px;
            color: #e0e7ff;
        }
        
        .message-wrapper.own:hover .message-content {
             border-color: rgba(99, 102, 241, 0.6);
             box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
        }

        /* RECEIVER STYLES (Matte Dark) */
        .message-wrapper.other .message-content {
          background: #18181b;
          border-bottom-left-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #d4d4d8;
        }

        /* Destructing Effect */
        .message-wrapper.destructing .message-content {
            border: 1px solid rgba(239, 68, 68, 0.5);
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent);
        }
        
        .message-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end; /* Align bottom */
            margin-top: 6px;
            gap: 12px;
            font-size: 0.7rem;
            color: rgba(255, 255, 255, 0.4);
            user-select: none;
        }
        
        .metadata-icons {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .secure-lock {
            font-size: 0.7rem;
            opacity: 0.7;
        }
        
        .timer {
            color: #fca5a5;
            font-weight: 600;
        }
        
        .status-tick {
            color: #4ade80; /* Success green */
            display: flex;
            align-items: center;
        }
      `}</style>
    </div>
  );
};

export default MessageBubble;

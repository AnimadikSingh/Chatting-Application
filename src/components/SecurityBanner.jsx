import React from 'react';

const SecurityBanner = ({ message, onDismiss }) => {
    return (
        <div className="security-banner">
            <div className="icon">⚠️</div>
            <div className="content">{message}</div>
            {onDismiss && <button onClick={onDismiss} className="dismiss">×</button>}

            <style>{`
        .security-banner {
          background: rgba(234, 179, 8, 0.15);
          border-bottom: 1px solid rgba(234, 179, 8, 0.3);
          color: #fca5a5; /* Red/Yellow mix for warning */
          color: #fcd34d;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
          animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
        }

        .icon {
          font-size: 1.2rem;
        }
        
        .content {
          flex: 1;
          font-weight: 500;
        }
        
        .dismiss {
            background: none;
            border: none;
            color: currentColor;
            font-size: 1.2rem;
            opacity: 0.7;
            cursor: pointer;
        }
        
        .dismiss:hover {
            opacity: 1;
        }
      `}</style>
        </div>
    );
};

export default SecurityBanner;

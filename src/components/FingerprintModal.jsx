import React from 'react';

const FingerprintModal = ({ isOpen, onClose, fingerprint, username }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🔐 Security Verification</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <p className="instruction">
                        Compare this security code with <strong>{username}</strong>'s screen to verify your connection is secure.
                    </p>

                    <div className="fingerprint-display">
                        {fingerprint}
                    </div>

                    <div className="verification-status">
                        <p>If the codes match, your chat is end-to-end encrypted and no one is intercepting your messages.</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="verify-btn" onClick={onClose}>I Verified It Matches</button>
                </div>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: #18181b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          width: 90%;
          max-width: 400px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          animation: scaleIn 0.2s ease;
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-header h3 {
          margin: 0;
          font-weight: 600;
          color: white;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .modal-body {
          padding: 24px;
          text-align: center;
        }

        .instruction {
          color: var(--text-secondary);
          margin-bottom: 24px;
          font-size: 0.9rem;
        }

        .fingerprint-display {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #818cf8;
          font-family: monospace;
          font-size: 1.5rem;
          font-weight: 700;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          word-spacing: 4px;
          user-select: all;
        }

        .verification-status p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: center;
        }

        .verify-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 24px;
          font-weight: 600;
          transition: transform 0.2s;
        }
        
        .verify-btn:hover {
          transform: translateY(-1px);
        }
      `}</style>
        </div>
    );
};

export default FingerprintModal;

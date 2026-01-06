import React from 'react';

const CallModal = ({ caller, onAccept, onDecline }) => {
    return (
        <div className="call-modal-overlay">
            <div className="call-modal glass-panel">
                <div className="caller-info">
                    <div className="avatar large pulse">
                        {caller?.charAt(0).toUpperCase()}
                    </div>
                    <h3>Incoming Call</h3>
                    <p>{caller} is calling you...</p>
                </div>
                <div className="call-actions">
                    <button className="call-btn decline" onClick={onDecline}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" /><line x1="23" y1="1" x2="1" y2="23" /></svg>
                    </button>
                    <button className="call-btn accept" onClick={onAccept}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </button>
                </div>
            </div>
            <style>{`
        .call-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .call-modal {
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            min-width: 320px;
            text-align: center;
            background: rgba(15, 15, 20, 0.8);
        }
        .caller-info h3 {
            margin: 16px 0 8px;
            font-size: 1.5rem;
        }
        .caller-info p {
            color: var(--text-secondary);
        }
        .avatar.large {
            width: 96px;
            height: 96px;
            font-size: 2.5rem;
            margin: 0 auto;
        }
        .avatar.pulse {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
            animation: pulse-ring 2s infinite;
        }
        .call-btn {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .call-btn:hover {
            transform: scale(1.1);
        }
        .call-btn.accept {
            background: #4ade80;
            box-shadow: 0 4px 15px rgba(74, 222, 128, 0.4);
        }
        .call-btn.decline {
            background: #ef4444;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        }
        .call-actions {
            display: flex;
            gap: 32px;
            margin-top: 16px;
        }
        @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
            70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
            100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
      `}</style>
        </div>
    );
};

export default CallModal;

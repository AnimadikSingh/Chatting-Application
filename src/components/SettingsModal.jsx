import React from 'react';

const SettingsModal = ({
    isOpen,
    onClose,
    devMode,
    setDevMode,
    onRegenerateKeys,
    onClearData
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>⚙️ Application Settings</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">

                    <div className="setting-section">
                        <h4>🔒 Security & Privacy</h4>

                        <div className="setting-row">
                            <div className="setting-info">
                                <label>Regenerate Identity Keys</label>
                                <p>Forces a new key exchange. Useful if you suspect compromise.</p>
                            </div>
                            <button className="btn-secondary" onClick={() => {
                                if (confirm('This will disconnect you and generate new keys. Continue?')) {
                                    onRegenerateKeys();
                                    onClose();
                                }
                            }}>Regenerate Keys</button>
                        </div>

                        <div className="setting-row">
                            <div className="setting-info">
                                <label>Nuke Local Data</label>
                                <p>Clears all settings and message history from this device.</p>
                            </div>
                            <button className="btn-danger" onClick={() => {
                                if (confirm('Delete all local data and messages? This cannot be undone.')) {
                                    onClearData();
                                    onClose();
                                }
                            }}>Clear Data</button>
                        </div>
                    </div>

                    <div className="setting-section">
                        <h4>🧪 Developer Tools</h4>
                        <div className="setting-row">
                            <div className="setting-info">
                                <label>Developer Mode</label>
                                <p>Show raw encrypted payloads in chat bubbles.</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={devMode}
                                    onChange={(e) => setDevMode(e.target.checked)}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                </div>

                <div className="modal-footer">
                    <button className="btn-primary" onClick={onClose}>Done</button>
                </div>
            </div>

            <style>{`
        /* Reusing Modal Styles basically */
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
          max-width: 500px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
           max-height: 85vh; 
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
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
        }
        
        .setting-section {
            margin-bottom: 30px;
        }
        
        .setting-section h4 {
            color: var(--primary-color);
            margin-bottom: 16px;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 1px;
        }
        
        .setting-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            gap: 20px;
        }
        
        .setting-info label {
            display: block;
            font-weight: 500;
            margin-bottom: 4px;
        }
        
        .setting-info p {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin: 0;
        }
        
        .btn-secondary {
            padding: 8px 16px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            border-radius: 6px;
            cursor: pointer;
            white-space: nowrap;
        }
        
        .btn-secondary:hover {
            background: rgba(255,255,255,0.1);
        }
        
        .btn-danger {
            padding: 8px 16px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
            border-radius: 6px;
            cursor: pointer;
            white-space: nowrap;
        }
        
        .btn-danger:hover {
            background: rgba(239, 68, 68, 0.2);
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: flex-end;
        }
        
        .btn-primary {
            background: var(--primary-color);
            color: white;
            padding: 10px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        /* Toggle Switch */
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255,255,255,0.1);
            transition: .4s;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
        }

        input:checked + .slider {
            background-color: var(--primary-color);
        }

        input:checked + .slider:before {
            transform: translateX(26px);
        }

        .slider.round {
            border-radius: 34px;
        }

        .slider.round:before {
            border-radius: 50%;
        }
      `}</style>
        </div>
    );
};

export default SettingsModal;

import React from 'react';

const ChatLayout = ({ children }) => {
    return (
        <div className="layout-container">
            <div className="glass-panel">
                {children}
            </div>
            <style>{`
        .layout-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .glass-panel {
          width: 100%;
          max-width: 1200px;
          height: 90vh;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: var(--glass-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          display: flex;
          overflow: hidden;
          position: relative;
        }

        /* Ambient colored glow spots */
        .layout-container::before {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: var(--primary-glow);
          filter: blur(100px);
          border-radius: 50%;
          top: -100px;
          left: -100px;
          z-index: -1;
          opacity: 0.5;
        }
      `}</style>
        </div>
    );
};

export default ChatLayout;

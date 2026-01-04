import React from 'react';

const ChatLayout = ({ children }) => {
  return (
    <div className="layout-container">
      <div className="glass-panel">
        {children}
      </div>
      <style>{`
        .layout-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 0;
        }
        
        .glass-panel {
          width: 100%;
          max-width: 1280px;
          height: 75vh; /* Reduced to 75vh for absolute safety against taskbars */
          max-height: 800px;
          background: var(--glass-bg);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: var(--glass-border);
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.05),
            var(--shadow-lg);
          border-radius: var(--radius-xl);
          display: flex;
          overflow: hidden;
          position: relative;
          z-index: 10;
        }

        /* Ambient colored glow spots */
        .layout-container::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          top: -10%;
          left: -10%;
          z-index: 0;
          opacity: 0.4;
          animation: float 20s infinite ease-in-out;
        }

        .layout-container::after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
          bottom: -10%;
          right: -10%;
          z-index: 0;
          opacity: 0.3;
          animation: float 25s infinite ease-in-out reverse;
        }

        @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(30px, 30px); }
        }
      `}</style>
    </div>
  );
};

export default ChatLayout;

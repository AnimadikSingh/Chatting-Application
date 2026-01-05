import React from 'react';

const ChatLayout = ({ children }) => {
  return (
    <div className="layout-container">
      {children}
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

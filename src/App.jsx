import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { io } from 'socket.io-client';
import * as crypto from './services/crypto';
import ChatLayout from './components/ChatLayout';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import ChatControls from './components/ChatControls';
import ChatHeader from './components/ChatHeader';
import SettingsModal from './components/SettingsModal';
import FingerprintModal from './components/FingerprintModal';
import SecurityBanner from './components/SecurityBanner';
import EmptyState from './components/EmptyState';
import './index.css';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Get room from URL or default
const getRoomFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
};

const generateRoomId = () => Math.random().toString(36).substring(2, 9);

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputMessage, setInputMessage] = useState('');

  // Advanced features state
  const [currentRoom, setCurrentRoom] = useState(getRoomFromUrl());
  const [msgSettings, setMsgSettings] = useState({ selfDestruct: 0, timeLock: 0 });

  // Security Visibility
  const [fingerprint, setFingerprint] = useState(null);
  const [showFingerprint, setShowFingerprint] = useState(false);
  const [securityWarning, setSecurityWarning] = useState(null);
  const [knownKeys, setKnownKeys] = useState({}); // userId -> publicKey (to detect changes)

  // Messages map: userId -> array of messages
  const [messages, setMessages] = useState({});

  // Crypto state
  const [myKeys, setMyKeys] = useState(null);
  const [sharedKeys, setSharedKeys] = useState({});

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Security Visibility State
  // Note: fingerprint, showFingerprint, knownKeys are already defined above unless I accidentally deleted them?
  // Checking the file content from step 311:
  // Lines 36-39 defined: fingerprint, showFingerprint, securityWarning, knownKeys.
  // Lines 32-33 defined: msgSettings.
  // Missing: showSettings, devMode.

  const [showSettings, setShowSettings] = useState(false);
  const [devMode, setDevMode] = useState(false);

  const handleRegenerateKeys = async () => {
    // 1. Disconnect
    if (socketRef.current) socketRef.current.disconnect();

    // 2. Generate New Keys
    const keys = await crypto.generateKeyPair();
    setMyKeys(keys);
    const publicKeyJwk = await crypto.exportPublicKey(keys.publicKey);

    // 3. Reconnect
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', {
        username,
        publicKey: publicKeyJwk,
        room: currentRoom || 'global'
      });
      setCurrentUser(prev => ({ ...prev, id: socketRef.current.id }));
    });

    // Re-attach users list listener to track keys
    socketRef.current.on('users:list', (userList) => {
      setUsers(userList);
      setKnownKeys(prev => {
        const next = { ...prev };
        userList.forEach(u => { next[u.username] = u.publicKey; });
        return next;
      });
    });

    // Re-attach message listener
    // Note: The main useEffect [users, myKeys] will actually handle re-binding the message listener
    // because myKeys changes. So we might not need to manually do it here if we trust the effect.
    // However, to be safe and ensure immediate responsiveness:
    socketRef.current.on('message:private', async (payload) => {
      setMessages(prev => ({ ...prev }));
    });
  };

  const handleClearData = () => {
    setMessages({});
    setSharedKeys({});
    setKnownKeys({});
    window.location.reload();
  };

  const handleLeaveRoom = () => {
    window.location.href = '/';
  };


  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    // Use existing room or create new Global room if none
    const roomToJoin = currentRoom || 'global';
    setCurrentRoom(roomToJoin);

    const keys = await crypto.generateKeyPair();
    setMyKeys(keys);
    const publicKeyJwk = await crypto.exportPublicKey(keys.publicKey);

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      socketRef.current.emit('join', {
        username,
        publicKey: publicKeyJwk,
        room: roomToJoin
      });

      setCurrentUser({ username, id: socketRef.current.id, room: roomToJoin });
      setIsLoggedIn(true);
      // Default to Public Room
      setSelectedUser({ id: 'everyone', username: 'Everyone', isGroup: true });
    });

    socketRef.current.on('users:list', (userList) => {
      setUsers(userList);

      // key change detection logic
      setKnownKeys(prev => {
        const next = { ...prev };
        let warningMsg = null;

        userList.forEach(u => {
          // Check by username, not socket ID, to catch re-logins
          if (prev[u.username] && prev[u.username] !== u.publicKey) {
            warningMsg = `Security Alert: Identity key for ${u.username} has changed. Verify their new fingerprint.`;

            // Invalidate shared keys? 
            // We need to find the OLD socket ID that matched this username to remove it, 
            // but actually we just need to know that for THIS user instance we should re-verify.
            // Simpler: Just show the warning. The sharedKey is per-socket-id anyway, so it will be regenerated.
          }
          next[u.username] = u.publicKey;
        });

        if (warningMsg) setSecurityWarning(warningMsg);
        return next;
      });
    });

    socketRef.current.on('message:private', async (payload) => {
      // We'll decode in the effect
      setMessages(prev => { /* trigger re-render */ return { ...prev }; });
    });
  };

  // Listener for incoming encryption processing
  useEffect(() => {
    if (!socketRef.current) return;

    const handleMessage = async (payload) => {
      const { from, content, iv, timestamp, metadata } = payload;
      let decryptedText = "[Decryption Error]";

      try {
        const sender = users.find(u => u.id === from);

        if (sender && myKeys) {
          let sharedKey = sharedKeys[from];
          if (!sharedKey) {
            const remoteKey = await crypto.importPublicKey(sender.publicKey);
            sharedKey = await crypto.deriveSecretKey(myKeys.privateKey, remoteKey);
            setSharedKeys(prev => ({ ...prev, [from]: sharedKey }));
          }
          decryptedText = await crypto.decryptMessage(content, iv, sharedKey);
        }
      } catch (err) {
        console.error("Error processing message", err);
      }

      const newMessage = {
        id: Date.now() + Math.random(),
        text: decryptedText,
        isOwn: false,
        timestamp,
        metadata // Pass metadata through
      };

      const bucketId = metadata?.isGroup ? 'everyone' : from;

      setMessages(prev => ({
        ...prev,
        [bucketId]: [...(prev[bucketId] || []), newMessage]
      }));
    };

    socketRef.current.off('message:private');
    socketRef.current.on('message:private', handleMessage);

  }, [users, myKeys, sharedKeys]);

  // Compute Fingerprint when selecting user
  useEffect(() => {
    if (selectedUser) {
      crypto.computeFingerprint(selectedUser.publicKey).then(setFingerprint);
    } else {
      setFingerprint(null);
    }
  }, [selectedUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedUser) return;

    const text = inputMessage;
    setInputMessage('');

    // Prepare metadata
    const metadata = {};
    if (msgSettings.selfDestruct > 0) {
      metadata.expiresIn = msgSettings.selfDestruct; // seconds
    }
    if (msgSettings.timeLock > 0) {
      metadata.unlocksAt = Date.now() + (msgSettings.timeLock * 1000);
    }

    // --- GROUP CHAT LOGIC ---
    if (selectedUser.id === 'everyone') {
      metadata.isGroup = true;

      // Broadcast to ALL users (except self)
      // We need to loop and encrypt for each one individually
      const recipients = users.filter(u => u.id !== currentUser.id);

      const sendPromises = recipients.map(async (recipient) => {
        let sharedKey = sharedKeys[recipient.id];
        if (!sharedKey) {
          try {
            const remoteKey = await crypto.importPublicKey(recipient.publicKey);
            sharedKey = await crypto.deriveSecretKey(myKeys.privateKey, remoteKey);
            // Update shared keys state silently? OR just use it here.
            // Updating state in loop might be race-condition prone.
            // Let's just use it.
          } catch (err) {
            console.error(`Failed to derive key for ${recipient.username}`, err);
            return;
          }
        }

        const { cipherText, iv } = await crypto.encryptMessage(text, sharedKey);

        socketRef.current.emit('message:private', {
          to: recipient.id,
          content: cipherText,
          iv,
          metadata
        });
      });

      await Promise.all(sendPromises);

    } else {
      // --- DM LOGIC ---
      let sharedKey = sharedKeys[selectedUser.id];
      if (!sharedKey) {
        try {
          const remoteKey = await crypto.importPublicKey(selectedUser.publicKey);
          sharedKey = await crypto.deriveSecretKey(myKeys.privateKey, remoteKey);
          setSharedKeys(prev => ({ ...prev, [selectedUser.id]: sharedKey }));
        } catch (err) {
          console.error("Key derivation failed", err);
          return;
        }
      }

      const { cipherText, iv } = await crypto.encryptMessage(text, sharedKey);

      socketRef.current.emit('message:private', {
        to: selectedUser.id,
        content: cipherText,
        iv,
        metadata
      });
    }

    const newMessage = {
      id: Date.now(),
      text: text,
      isOwn: true,
      timestamp: Date.now(),
      metadata
    };

    setMessages(prev => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage]
    }));
  };

  const createPrivateRoom = () => {
    const newRoom = generateRoomId();
    window.location.search = `?room=${newRoom}`;
  }

  const copyInviteLink = () => {
    const url = `${window.location.origin}/?room=${currentRoom}`;
    navigator.clipboard.writeText(url);
    alert('Invite link copied to clipboard!');
  }

  if (!isLoggedIn) {
    return (
      <ChatLayout>
        <div className="login-container">
          <h1 className="title">SECURE CHAT</h1>
          <p className="subtitle">
            {currentRoom ? `Joining Room: ${currentRoom}` : 'End-to-End Encrypted'}
          </p>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="text"
              placeholder="Enter your alias..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              maxLength={15}
              autoFocus
            />
            <button type="submit" className="login-btn">
              Enter Secure Space
            </button>
          </form>
          {!currentRoom && (
            <button onClick={createPrivateRoom} className="text-btn">
              Or create a private room link
            </button>
          )}
        </div>
        <style>{`
            .login-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
            }
            .title {
                font-size: 3rem;
                font-weight: 800;
                letter-spacing: -2px;
                background: linear-gradient(to right, #fff, #a5b4fc);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 8px;
            }
            .subtitle {
                color: var(--text-secondary);
                margin-bottom: 40px;
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
                font-size: 0.8rem;
            }
            .login-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
                width: 100%;
                max-width: 320px;
            }
            .login-input {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 16px 20px;
                border-radius: var(--radius-md);
                color: white;
                font-size: 1.1rem;
                text-align: center;
                outline: none;
                transition: var(--transition);
            }
            .login-input:focus {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            }
            .login-btn {
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 16px;
                border-radius: var(--radius-md);
                font-weight: 600;
                letter-spacing: 0.5px;
                transition: var(--transition);
            }
            .login-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
            }
            .text-btn {
                background: transparent;
                border: none;
                color: var(--text-secondary);
                margin-top: 20px;
                text-decoration: underline;
                font-size: 0.9rem;
            }
        `}</style>
      </ChatLayout>
    );
  }

  return (
    <ChatLayout>
      <Sidebar
        currentUser={currentUser}
        users={users}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
      />

      <div className="chat-area">
        {securityWarning && (
          <SecurityBanner
            message={securityWarning}
            onDismiss={() => setSecurityWarning(null)}
          />
        )}





        {!selectedUser ? (
          // ... EmptyState
          <EmptyState
            currentRoom={currentRoom}
            onCreateRoom={createPrivateRoom}
            onCopyLink={copyInviteLink}
          />
        ) : (
          <>
            <ChatHeader
              user={selectedUser}
              fingerprint={fingerprint}
              onVerify={() => setShowFingerprint(true)}
              onClearChat={() => setMessages(prev => ({ ...prev, [selectedUser.id]: [] }))}
              onLeaveRoom={handleLeaveRoom}
              onOpenSettings={() => setShowSettings(true)}
            />

            <div className="messages-list">
              {(messages[selectedUser.id] || []).map(msg => (
                <MessageBubble
                  key={msg.id}
                  text={msg.text}
                  isOwn={msg.isOwn}
                  timestamp={msg.timestamp}
                  status={msg.isOwn ? "Sent" : null}
                  metadata={msg.metadata}
                  devMode={devMode}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <ChatControls onSettingsChange={setMsgSettings} />

            <form onSubmit={sendMessage} className="chat-input-area">
              <input
                type="text"
                placeholder={
                  msgSettings.selfDestruct > 0
                    ? `Type self-destructing message (${msgSettings.selfDestruct}s)...`
                    : "Type a secured message..."
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="message-input"
              />
              <button type="submit" className="send-btn">
                Send
              </button>
            </form>
            <style>{`
        .chat-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: rgba(0, 0, 0, 0.2);
            position: relative;
        }

        .no-chat-selected {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            text-align: center;
        }

        .no-chat-selected .icon {
            font-size: 4rem;
            margin-bottom: 20px;
            opacity: 0.2;
        }

        .invite-box {
            margin-top: 20px;
            padding: 20px;
            background: rgba(255,255,255,0.05);
            border-radius: var(--radius-md);
        }

        .invite-btn {
            margin-top: 10px;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
        }

        .chat-header {
            padding: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            background: rgba(0, 0, 0, 0.2);
        }

        .header-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .secure-badge {
            font-size: 0.75rem;
            color: #4ade80;
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(74, 222, 128, 0.1);
            padding: 4px 8px;
            border-radius: 4px;
            transition: var(--transition);
        }

        .secure-badge.interactive {
            cursor: pointer;
        }

        .secure-badge.interactive:hover {
            background: rgba(74, 222, 128, 0.2);
        }

        .secure-badge .dot {
            width: 6px;
            height: 6px;
            background: #4ade80;
            border-radius: 50%;
            box-shadow: 0 0 5px #4ade80;
        }

        .messages-list {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }

        .chat-input-area {
            padding: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            gap: 12px;
            background: rgba(0, 0, 0, 0.2);
        }

        .message-input {
            flex: 1;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 12px 16px;
            border-radius: 24px;
            color: white;
            outline: none;
            transition: var(--transition);
        }

        .message-input:focus {
            background: rgba(255, 255, 255, 0.1);
        }

        .send-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0 24px;
            border-radius: 24px;
            font-weight: 600;
            transition: var(--transition);
        }

        .send-btn:hover {
            opacity: 0.9;
            transform: scale(1.02);
        }
      `}</style>
          </>
        )}
      </div>

      <FingerprintModal
        isOpen={showFingerprint}
        onClose={() => setShowFingerprint(false)}
        fingerprint={fingerprint || "Generating..."}
        username={selectedUser?.username}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        devMode={devMode}
        setDevMode={setDevMode}
        onRegenerateKeys={handleRegenerateKeys}
        onClearData={handleClearData}
      />

    </ChatLayout>
  );
}

export default App;

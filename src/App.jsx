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
import CallModal from './components/CallModal';
import VideoCall from './components/VideoCall';

// ... existing imports

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

  const [showSettings, setShowSettings] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [typingStatus, setTypingStatus] = useState(null);
  const lastTypingEmitted = useRef(0);
  const typingTimeoutRef = useRef(null);

  // WebRTC State
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const connectionRef = useRef();
  const [remoteStream, setRemoteStream] = useState(null);

  // --- WebRTC Logic ---
  const callUser = (id) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        const peer = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        });

        setCallEnded(false);
        setCallAccepted(false); // Reset this

        currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit("ice-candidate", {
              to: id,
              candidate: event.candidate
            });
          }
        };

        peer.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
        };

        peer.onnegotiationneeded = async () => {
          try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            socketRef.current.emit("callUser", {
              userToCall: id,
              signalData: offer,
              from: currentUser.id,
              name: currentUser.username
            });
          } catch (err) {
            console.error("Negotiation error:", err);
          }
        };

        connectionRef.current = peer;
      })
      .catch((err) => {
        console.error("Failed to get media", err);
        alert("Could not access camera/microphone");
      });
  };

  const answerCall = () => {
    setCallAccepted(true);
    setReceivingCall(false); // Hide modal

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        const peer = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        });

        currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit("ice-candidate", {
              to: caller,
              candidate: event.candidate
            });
          }
        };

        peer.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
        };

        // Handle the offer we already received in callerSignal
        peer.setRemoteDescription(new RTCSessionDescription(callerSignal));

        peer.createAnswer().then(answer => {
          peer.setLocalDescription(answer);
          socketRef.current.emit("answerCall", { signal: answer, to: caller });
        });

        connectionRef.current = peer;
      });
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.close();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setRemoteStream(null);
    setCallAccepted(false);
    setReceivingCall(false);

    // Notify other user
    // Determine who 'other' is (caller or person we called)
    const otherId = caller || (selectedUser ? selectedUser.id : null);
    if (otherId) {
      socketRef.current.emit("endCall", { to: otherId });
    }
    setCaller("");
  };

  // Add calling listeners to attachSocketListeners
  const attachSocketListeners = (socket) => {
    socket.off('users:list');
    socket.on('users:list', (userList) => {
      // ... existing user list logic
      setUsers(userList);
      setKnownKeys(prev => {
        const next = { ...prev };
        let warningMsg = null;
        userList.forEach(u => {
          if (prev[u.username] && prev[u.username] !== u.publicKey) {
            warningMsg = `Security Alert: Identity key for ${u.username} has changed. Verify their new fingerprint.`;
          }
          next[u.username] = u.publicKey;
        });
        if (warningMsg) setSecurityWarning(warningMsg);
        return next;
      });
    });

    socket.off('typing');
    socket.on('typing', ({ from, username }) => {
      // ... existing typing logic
      setTypingStatus({ from, username });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(null);
      }, 3000);
    });

    // --- NEW CALL LISTENERS ---
    socket.off("callUser");
    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setReceivingCall(true);
      setCaller(from);
      setName(callerName);
      setCallerSignal(signal);
    });

    socket.off("callAccepted");
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
    });

    socket.off("ice-candidate");
    socket.on("ice-candidate", (candidate) => {
      if (connectionRef.current) {
        connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.off("endCall");
    socket.on("endCall", () => {
      setCallEnded(true);
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (connectionRef.current) connectionRef.current.close();
      setStream(null);
      setRemoteStream(null);
      setCallAccepted(false);
      setReceivingCall(false);
      setCaller("");
      alert("Call ended");
    });
  };

  // Move handleMessage up
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
      timestamp: timestamp || Date.now(),
      metadata,
      senderName: users.find(u => u.id === from)?.username
    };

    const bucketId = metadata?.isGroup ? 'everyone' : from;

    setMessages(prev => {
      const newBucket = [...(prev[bucketId] || []), newMessage];
      return {
        ...prev,
        [bucketId]: newBucket
      };
    });
  };

  // Effect to attach handleMessage whenever dependencies change
  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.off('message:private');
    socketRef.current.on('message:private', handleMessage);
  }, [users, myKeys, sharedKeys]);


  const handleRegenerateKeys = async () => {
    if (socketRef.current) socketRef.current.disconnect();

    const keys = await crypto.generateKeyPair();
    setMyKeys(keys);
    const publicKeyJwk = await crypto.exportPublicKey(keys.publicKey);

    console.log("Connecting (Regen) to:", SOCKET_URL);
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'], secure: true });
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', {
        username,
        publicKey: publicKeyJwk,
        room: currentRoom || 'global'
      });
      setCurrentUser(prev => ({ ...prev, id: socketRef.current.id }));
    });

    attachSocketListeners(socketRef.current);
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

    console.log("Connecting (Login) to:", SOCKET_URL);
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'], secure: true });

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

    attachSocketListeners(socketRef.current);
  };


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

    try {
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

        const recipients = users.filter(u => u.id !== currentUser.id);

        const sendPromises = recipients.map(async (recipient) => {
          let sharedKey = sharedKeys[recipient.id];
          if (!sharedKey) {
            try {
              const remoteKey = await crypto.importPublicKey(recipient.publicKey);
              sharedKey = await crypto.deriveSecretKey(myKeys.privateKey, remoteKey);
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
          const remoteKey = await crypto.importPublicKey(selectedUser.publicKey);
          sharedKey = await crypto.deriveSecretKey(myKeys.privateKey, remoteKey);
          setSharedKeys(prev => ({ ...prev, [selectedUser.id]: sharedKey }));
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
        metadata,
        senderName: currentUser?.username
      };

      setMessages(prev => ({
        ...prev,
        [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage]
      }));
    } catch (error) {
      console.error("SendMessage Error:", error);
      alert("Failed to send message: " + error.message);
    }
  };

  const handleTyping = () => {
    const now = Date.now();
    // Throttle: emit max once every 2 seconds
    if (now - lastTypingEmitted.current > 2000) {
      if (selectedUser) {
        if (selectedUser.id === 'everyone') {
          // Fix: Use actual room ID (usually 'global') instead of 'everyone'
          // because users joined 'global', not 'everyone'
          socketRef.current?.emit('typing', { room: currentRoom || 'global' });
        } else {
          socketRef.current?.emit('typing', { to: selectedUser.id });
        }
        lastTypingEmitted.current = now;
      }
    }
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
      <div className="app-container">
        {/* Sidebar Panel */}
        <div className="glass-panel sidebar-panel">
          <Sidebar
            currentUser={currentUser}
            users={users}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
          />
        </div>

        {/* Chat Panel */}
        <div className="glass-panel chat-panel">
          <div className="chat-area">
            {securityWarning && (
              <SecurityBanner
                message={securityWarning}
                onDismiss={() => setSecurityWarning(null)}
              />
            )}

            {!selectedUser ? (
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
                  onCall={() => callUser(selectedUser.id)}
                />

                {/* Call Components */}
                {receivingCall && !callAccepted && (
                  <CallModal
                    caller={name}
                    onAccept={answerCall}
                    onDecline={leaveCall}
                  />
                )}

                {callAccepted && !callEnded && (
                  <VideoCall
                    localStream={stream}
                    remoteStream={remoteStream}
                    onEndCall={leaveCall}
                    peerName={selectedUser?.username}
                  />
                )}

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
                      senderName={msg.senderName}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <ChatControls onSettingsChange={setMsgSettings} />

                {/* Typing Indicator */}
                {typingStatus && (selectedUser?.id === 'everyone' || typingStatus.from === selectedUser?.id) && (
                  <div className="typing-indicator">
                    {typingStatus.username} is typing...
                  </div>
                )}

                <form onSubmit={sendMessage} className="chat-input-area">
                  <input
                    type="text"
                    placeholder={
                      msgSettings.selfDestruct > 0
                        ? `Type self-destructing message (${msgSettings.selfDestruct}s)...`
                        : "Type a secured message..."
                    }
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      handleTyping();
                    }}
                    className="message-input"
                  />
                  <button type="submit" className="send-btn">
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
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

      <style>{`
        .app-container {
            display: flex;
            gap: 24px; /* The gap requested by user */
            width: 100%;
            height: 75vh;
            max-width: 1400px;
            padding: 0 20px;
        }

        .glass-panel {
            background: rgba(0, 0, 0, 0.2); /* Common background for glass panels */
            border-radius: var(--radius-lg);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            overflow: hidden; /* Ensure content respects border-radius */
        }

        .sidebar-panel {
            width: 320px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
        }

        .chat-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
        }

        .chat-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            /* background removed, handled by glass-panel */
            position: relative;
            height: 100%; /* Force height to match parent */
            overflow: hidden; /* Prevent spillover */
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
            flex-shrink: 0; /* Header shouldn't shrink */
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
            min-height: 0; /* Crucial for scrolling inside flex */
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

        .typing-indicator {
            padding: 0 24px;
            font-size: 0.8rem;
            color: rgba(255,255,255,0.5);
            font-style: italic;
            margin-bottom: 4px;
            animation: fadeInOut 2s infinite;
        }

        .login-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
            
        /* ... existing login styles ... */
        
        @keyframes fadeInOut {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
        }
      `}</style>

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

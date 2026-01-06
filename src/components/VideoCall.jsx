import React, { useEffect, useRef } from 'react';

const VideoCall = ({ localStream, remoteStream, onEndCall, peerName }) => {
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <div className="video-call-container">
            <div className="remote-video-wrapper">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="remote-video"
                />
                <div className="peer-name">{peerName || "Unknown Caller"}</div>
            </div>

            <div className="local-video-wrapper">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="local-video"
                />
            </div>

            <div className="call-controls">
                {/* Placeholder for Mute/Video Toggle */}
                <button className="control-btn end-call" onClick={onEndCall}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" /><line x1="23" y1="1" x2="1" y2="23" /></svg>
                </button>
            </div>

            <style>{`
        .video-call-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10000;
            display: flex;
            flex-direction: column;
        }

        .remote-video-wrapper {
            flex: 1;
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .remote-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .peer-name {
            position: absolute;
            top: 40px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.5);
            padding: 8px 16px;
            border-radius: 20px;
            color: white;
            font-weight: 500;
            backdrop-filter: blur(4px);
        }

        .local-video-wrapper {
            position: absolute;
            bottom: 120px;
            right: 24px;
            width: 160px;
            height: 240px; /* Portrait aspect ratio */
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            border: 2px solid rgba(255,255,255,0.1);
        }

        .local-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .call-controls {
            position: absolute;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 24px;
            background: rgba(255,255,255,0.1);
            padding: 16px 32px;
            border-radius: 40px;
            backdrop-filter: blur(12px);
        }

        .control-btn {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .control-btn:hover {
            transform: scale(1.1);
        }

        .control-btn.end-call {
            background: #ef4444;
            color: white;
        }
      `}</style>
        </div>
    );
};

export default VideoCall;

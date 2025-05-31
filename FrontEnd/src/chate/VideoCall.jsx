import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const VideoCall = ({ receiverId, callerId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isInCall, setIsInCall] = useState(false);

  const ringtone = new Audio("/sounds/ringtone.mp3");
  const callRejectedSound = new Audio("/sounds/rejected.mp3");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
      });

    socket.on("incoming-call", async ({ callerId, offer }) => {
      ringtone.play();
      setIncomingCall({ callerId, offer });
    });

    socket.on("call-answered", async ({ answer }) => {
      ringtone.pause();
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        setIsInCall(true);
      }
    });

    socket.on("call-rejected", async () => {
      ringtone.pause();
      callRejectedSound.play();
      setIsCalling(false);
      setIncomingCall(null);
      alert("Call was rejected.");
    });

    socket.on("end-call", () => {
      endCall();
    });
  }, []);

  // Auto-start call if both IDs are present and not already calling or in call
  useEffect(() => {
    if (receiverId && callerId && !isCalling && !isInCall && !incomingCall) {
      startCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverId, callerId]);

  const startCall = async () => {
    peerConnection.current = new RTCPeerConnection();
    const stream = localVideoRef.current.srcObject;
    stream
      .getTracks()
      .forEach((track) => peerConnection.current.addTrack(track, stream));

    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("call-user", { receiverId, offer });
    setIsCalling(true);
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    peerConnection.current = new RTCPeerConnection();
    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(incomingCall.offer)
    );

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answer-call", { callerId: incomingCall.callerId, answer });
    setIsInCall(true);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    socket.emit("reject-call", { callerId: incomingCall.callerId });
    saveCallHistory("missed");
    setIncomingCall(null);
  };

  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    socket.emit("end-call", { receiverId });
    saveCallHistory("completed");
    setIsCalling(false);
    setIsInCall(false);
  };

  const saveCallHistory = async (status) => {
    const callData = {
      callerId,
      receiverId,
      status,
      timestamp: new Date(),
    };
    await fetch("http://localhost:4000/api/call-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(callData),
    });
  };

  return (
    <div className="flex flex-col items-center">
      <video
        ref={localVideoRef}
        autoPlay
        muted
        className="w-screen h-96 border border-gray-500"
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        className="w-screen h-96 border border-gray-500"
      />

      {!isInCall && !incomingCall && (
        <button
          onClick={startCall}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isCalling ? "Calling..." : "Start Call"}
        </button>
      )}

      {isInCall && (
        <button
          onClick={endCall}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          End Call
        </button>
      )}

      {incomingCall && (
        <div className="mt-4 flex gap-4">
          <button
            onClick={acceptCall}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Accept Call
          </button>
          <button
            onClick={rejectCall}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Reject Call
          </button>
        </div>
      )}
    </div>
  );
};

VideoCall.propTypes = {
  receiverId: PropTypes.string.isRequired,
  callerId: PropTypes.string.isRequired,
};

export default VideoCall;

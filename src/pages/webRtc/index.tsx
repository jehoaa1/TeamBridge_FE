import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000"; // 시그널링 서버 주소

export default function WebRTCChat() {
  const socketRef = useRef<any>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const roomId = "my-room"; // 고정 방 예시

  useEffect(() => {
    socketRef.current = io(SERVER_URL);

    socketRef.current.emit("join", { roomId });

    socketRef.current.on("offer", async ({ offer, senderId }: any) => {
      if (!peerConnectionRef.current) createPeerConnection();

      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current?.createAnswer();
      await peerConnectionRef.current?.setLocalDescription(answer);
      socketRef.current.emit("answer", { roomId, answer });
    });

    socketRef.current.on("answer", async ({ answer }: any) => {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socketRef.current.on("ice-candidate", async ({ candidate }: any) => {
      if (candidate) {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    createPeerConnection(true);

    return () => {
      socketRef.current.disconnect();
      peerConnectionRef.current?.close();
    };
  }, []);

  const createPeerConnection = (isInitiator = false) => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // 무료 STUN 서버
      ],
    });

    // ICE 후보 수집
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    // DataChannel 오픈 시
    peerConnectionRef.current.ondatachannel = (event) => {
      dataChannelRef.current = event.channel;
      setupDataChannel();
    };

    if (isInitiator) {
      // 내가 주도자라면 DataChannel 생성
      const dataChannel = peerConnectionRef.current.createDataChannel("chat");
      dataChannelRef.current = dataChannel;
      setupDataChannel();

      peerConnectionRef.current.createOffer().then((offer) => {
        peerConnectionRef.current?.setLocalDescription(offer);
        socketRef.current.emit("offer", { roomId, offer });
      });
    }
  };

  const setupDataChannel = () => {
    if (!dataChannelRef.current) return;

    dataChannelRef.current.onmessage = (event) => {
      setMessages((prev) => [...prev, `상대방: ${event.data}`]);
    };

    dataChannelRef.current.onopen = () => {
      console.log("DataChannel Opened");
    };

    dataChannelRef.current.onclose = () => {
      console.log("DataChannel Closed");
    };
  };

  const sendMessage = () => {
    if (!input.trim() || !dataChannelRef.current || dataChannelRef.current.readyState !== "open") return;
    dataChannelRef.current.send(input);
    setMessages((prev) => [...prev, `나: ${input}`]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="p-1">
            {msg}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2"
          placeholder="메시지 입력"
        />
        <button type="submit" className="bg-blue-500 text-white px-4">
          전송
        </button>
      </form>
    </div>
  );
}

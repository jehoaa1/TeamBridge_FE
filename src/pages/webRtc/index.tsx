import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

interface Message {
  senderId: string;
  message?: string;
  timestamp: number;
  file?: {
    name: string;
    type: string;
    url: string;
  };
}

const SERVER_URL = process.env.NEXT_PUBLIC_API_ENDPOINT; // 시그널링 서버 주소

export default function WebRTCChat() {
  const router = useRouter();
  const { roomId } = router.query;
  const [clientId] = useState(() => uuidv4());
  const [clients, setClients] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [systemMsg, setSystemMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const socketRef = useRef<any>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    socketRef.current = io(SERVER_URL);

    socketRef.current.emit("join", { roomId });

    socketRef.current.on("joined", ({ clients }: any) => {
      console.log("joined", clients);
      setClients(clients);
    });

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
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // peerConnection 생성
  const createPeerConnection = (isInitiator = false) => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    peerConnectionRef.current.ondatachannel = (event) => {
      dataChannelRef.current = event.channel;
      setupDataChannel();
    };

    if (isInitiator) {
      const dataChannel = peerConnectionRef.current.createDataChannel("chat");
      dataChannelRef.current = dataChannel;
      setupDataChannel();

      peerConnectionRef.current.createOffer().then((offer) => {
        peerConnectionRef.current?.setLocalDescription(offer);
        socketRef.current.emit("offer", { roomId, offer });
      });
    }
  };

  // DataChannel 이벤트
  const setupDataChannel = () => {
    if (!dataChannelRef.current) return;
    dataChannelRef.current.onmessage = (event) => {
      setMessages((prev) => [
        ...prev,
        {
          senderId: "상대방",
          message: event.data,
          timestamp: Date.now(),
        },
      ]);
    };
    dataChannelRef.current.onopen = () => {
      console.log("연결 성공");
      // 연결 성공
    };
    dataChannelRef.current.onclose = () => {};
  };

  // 파일 전송
  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const msg: Message = {
        senderId: clientId,
        timestamp: Date.now(),
        file: {
          name: file.name,
          type: file.type,
          url,
        },
      };
      socketRef.current?.emit("message", { ...msg, roomId });
      setMessages((prev) => [...prev, msg]);
    };
    reader.readAsDataURL(file);
  };

  // 드래그&드롭 핸들러
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(handleFile);
    }
  };

  // 메시지 전송
  const sendMessage = () => {
    if (!input.trim() || !dataChannelRef.current || dataChannelRef.current.readyState !== "open") return;
    dataChannelRef.current.send(input);
    setMessages((prev) => [
      ...prev,
      {
        senderId: clientId,
        message: input,
        timestamp: Date.now(),
      },
    ]);
    setInput("");
  };

  // 파일 선택 핸들러
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(handleFile);
    }
  };

  // 파일 미리보기/다운로드 렌더링
  const renderFile = (file: Message["file"]) => {
    if (!file) return null;
    if (file.type.startsWith("image/")) {
      return (
        <div className="mt-2">
          <img src={file.url} alt={file.name} className="max-w-xs max-h-48 rounded shadow" />
          <a href={file.url} download={file.name} className="block text-xs text-blue-500 mt-1 underline">
            이미지 다운로드
          </a>
        </div>
      );
    }
    if (file.type.startsWith("video/")) {
      return (
        <div className="mt-2">
          <video src={file.url} controls className="max-w-xs max-h-48 rounded shadow" />
          <a href={file.url} download={file.name} className="block text-xs text-blue-500 mt-1 underline">
            동영상 다운로드
          </a>
        </div>
      );
    }
    // 기타 파일
    return (
      <div className="mt-2">
        <a href={file.url} download={file.name} className="text-xs text-blue-500 underline">
          {file.name} 다운로드
        </a>
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col h-screen bg-gray-100 ${dragActive ? "ring-2 ring-indigo-400" : ""}`}
      onDragOver={(e) => {}}
      onDragLeave={() => setDragActive(false)}
      onDrop={onDrop}
    >
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow">
        <div className="font-bold text-lg">채팅방: {roomId}</div>
        <div className="text-sm text-gray-500">접속 인원: {clients.length}</div>
        <label className="ml-4 cursor-pointer text-indigo-600 hover:underline">
          파일첨부
          <input type="file" multiple className="hidden" onChange={onFileChange} />
        </label>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((msg, idx) => (
            <div key={idx} className={`flex ${msg.senderId === clientId ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-lg px-4 py-2 max-w-xs break-words ${
                  msg.senderId === clientId ? "bg-indigo-500 text-white" : "bg-white text-gray-900 border"
                }`}
              >
                {msg.message && <div className="text-sm">{msg.message}</div>}
                {msg.file && renderFile(msg.file)}
                <div className="text-xs text-right text-gray-300 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <form
        className="flex p-4 bg-white border-t"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          className="flex-1 border rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700">
          전송
        </button>
      </form>
    </div>
  );
}

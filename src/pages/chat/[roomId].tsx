import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

interface Message {
  senderId: string;
  message: string;
  timestamp: number;
}

export default function ChatRoomPage() {
  const router = useRouter();
  const { roomId } = router.query; // 여기!

  const [clientId] = useState(() => uuidv4());
  const [clients, setClients] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [systemMsg, setSystemMsg] = useState("");
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 스크롤 하단 이동
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!roomId || typeof roomId !== "string") {
      return;
    }

    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.emit("join", { roomId });

    const updateClients = (data: any) => {
      if (data && Array.isArray(data.clients)) {
        setClients(data.clients);
      }
    };

    socket.on("join", (data) => {
      if (data && Array.isArray(data.clients)) {
        setClients(data.clients);
        if (data.clients.length <= 1) {
          setSystemMsg("상대방을 기다리는 중입니다...");
        } else {
          setSystemMsg("");
        }
      }
    });

    socket.on("userJoined", (data) => {
      if (data && Array.isArray(data.clients)) {
        setClients(data.clients);
      }
      setSystemMsg("상대방이 입장했습니다.");
    });

    socket.on("ready", (data) => {
      if (data && Array.isArray(data.clients)) {
        setClients(data.clients);
      }
      setSystemMsg("");
    });

    // 메시지 수신
    socket.on("message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    // 클린업
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // 메시지 전송
  const sendMessage = () => {
    if (!input.trim() || typeof roomId !== "string") return;
    socketRef.current?.emit("message", {
      roomId,
      senderId: clientId,
      message: input,
      timestamp: Date.now(),
    });
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow">
        <div className="font-bold text-lg">채팅방: {roomId}</div>
        <div className="text-sm text-gray-500">접속 인원: {clients.length}</div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {systemMsg && <div className="text-center text-gray-400 text-sm my-2">{systemMsg}</div>}
        {messages
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((msg, idx) => (
            <div key={idx} className={`flex ${msg.senderId === clientId ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-lg px-4 py-2 max-w-xs break-words ${
                  msg.senderId === clientId ? "bg-indigo-500 text-white" : "bg-white text-gray-900 border"
                }`}
              >
                <div className="text-sm">{msg.message}</div>
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

// /app/chat/page.tsx
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ChatEntryPage() {
  const router = useRouter();
  const { roomId } = router.query;

  useEffect(() => {
    // router.query는 CSR에서만 값이 들어오므로, undefined 체크 필요
    if (roomId === undefined) return;

    if (!roomId) {
      alert("roomId가 필요합니다.");
      router.replace("/");
    } else {
      router.replace(`/chat/${roomId}`);
    }
  }, [roomId, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <span className="text-lg text-gray-500">채팅방으로 이동 중...</span>
    </div>
  );
}

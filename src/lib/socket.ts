// /lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io("ws://YOUR_SIGNALING_SERVER_URL", {
      transports: ["websocket"],
    });
  }
  return socket;
}

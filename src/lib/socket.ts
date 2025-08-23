import { io, Socket } from "socket.io-client";
import { useMemo } from "react";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL!;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (typeof window === "undefined") {
    throw new Error("getSocket can only be used in the browser");
  }
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
      withCredentials: true,
    });
    socket.on("connect", () => {
      console.log("Socket Connected with ID:", socket!.id);
    });
  }
  return socket;
}

export function useSocket(): Socket {
  return useMemo(() => getSocket(), []);
}




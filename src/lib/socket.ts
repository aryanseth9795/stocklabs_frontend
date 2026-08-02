import { io, Socket } from "socket.io-client";
import { useMemo } from "react";
import { serverUrl } from "@/constant/config";

// Uses the shared config rather than a non-null-asserted env read. The `!`
// silenced TypeScript without making the value present: with the variable
// unset, io(undefined) quietly connected to the page's own origin, which is
// not a socket server (review F-12).
const SOCKET_URL = serverUrl;

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




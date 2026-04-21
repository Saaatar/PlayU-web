// src/services/socket.ts
import { io } from "socket.io-client";

export const socket = io("https://playu.orchfr.duckdns.org", {
  transports: ["websocket", "polling"],
});

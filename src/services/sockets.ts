// src/services/socket.ts
import { io } from "socket.io-client";
import { Environment } from "../enviroments";

export const socket = io(`${Environment.BASE_URL}`, {
  transports: ["websocket", "polling"],
});

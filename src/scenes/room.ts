import type { KAPLAYCtx, Vec2 } from "kaplay";
import { createCard } from "../components/card";
import { Player } from "../types/Player";
import { socket } from "../services/sockets";

export function room(k: KAPLAYCtx) {
  k.scene("create-room", ({ roomCode, username }) => {
    k.setBackground(2, 6, 23);

    //conexion
    socket.emit("room:join", { code: roomCode, username: username });

    k.add([
      k.text("Room", { size: 70, font: "Jersey" }),
      k.pos(k.width() * 0.5, k.height() * 0.1),
      k.color(139, 92, 246),
      k.anchor("center"),
    ]);

    createCard({
      k: k,
      title: "Codigo de sala",
      description: roomCode,
      position: k.vec2(k.width() * 0.5, k.height() * 0.4),
      width: 250,
      height: 150,
    });

    const listaJugadores = k.add([k.pos(k.width() * 0.5, k.height() * 0.6)]);

    socket.on("room:update", (data: { code: string; players: Player[] }) => {
      listaJugadores.removeAll();

      listaJugadores.add([
        k.text(`Jugadores conectados (${data.players.length}/4):`, { size: 24 }),
        k.pos(0, 0),
        k.anchor("center"),
        k.color(148, 163, 184),
      ]);

      data.players.forEach((player, index) => {
        const isMe = player.username === username;

        listaJugadores.add([
          k.text(`${player.username} ${isMe ? "(Tú)" : ""}`, { size: 28, font: "sans-serif" }),
          k.pos(0, 40 + index * 35),
          k.anchor("center"),
          k.color(isMe ? 52 : 255, isMe ? 211 : 255, isMe ? 153 : 255),
        ]);
      });
    });

    socket.on("error", (msg) => {
      console.error("Error desde el servidor:", msg);
      k.go("create-lobby");
    });

    k.onSceneLeave(() => {
      socket.off("room:update");
      socket.off("error");
    });
  });
}

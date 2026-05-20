import type { KAPLAYCtx } from "kaplay";
import { Player } from "../types/Player";

export function scoreBoard(k: KAPLAYCtx) {
  k.scene(
    "scoreboard",
    // 1. Corregimos los tipos: scores ahora es un Record (Objeto)
    ({ scores, roomPlayers }: { scores: Record<string, number>; roomPlayers: Player[] }) => {
      k.setBackground(2, 6, 23);

      k.add([
        k.text("¡Juego Terminado! 🎉", { size: Math.min(k.width() * 0.1, 48), font: "Jersey" }),
        k.pos(k.center().x, k.height() * 0.2),
        k.anchor("center"),
        k.color(255, 220, 50),
      ]);

      // 2. Mapeamos los jugadores usando el ID para buscar su puntaje en el objeto
      const mappedScores = roomPlayers.map((player) => ({
        id: player.id,
        username: player.username,
        score: scores[player.id] || 0, // Si no tiene puntos aún, le ponemos 0
      }));

      // 3. Ahora SÍ ordenamos el arreglo resultante de mayor a menor
      const sortedPlayers = mappedScores.sort((a, b) => b.score - a.score);

      let yPos = k.height() * 0.35;

      sortedPlayers.forEach((p, i) => {
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1;
        k.add([
          k.text(`${medal} ${p.username}: ${p.score} puntos`, {
            size: Math.min(k.width() * 0.06, 24),
          }),
          k.pos(k.center().x, yPos),
          k.anchor("center"),
          k.color(200, 200, 255),
        ]);
        yPos += 50;
      });

      k.add([
        k.text("Preparando el siguiente minijuego...", { size: 20 }),
        k.pos(k.center().x, k.height() * 0.85),
        k.anchor("center"),
        k.color(148, 163, 184),
      ]);
    }
  );
}

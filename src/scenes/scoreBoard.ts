import type { KAPLAYCtx } from "kaplay";
import { Player } from "../types/Player";

export function scoreBoard(k: KAPLAYCtx) {
  k.scene(
    "scoreboard",
    ({
      scores,
      roomPlayers,
      timeoutSeconds,
      isFinal,
    }: {
      scores: Record<string, number>;
      roomPlayers: Player[];
      timeoutSeconds?: number;
      isFinal?: boolean;
    }) => {
      k.setBackground(2, 6, 23);

      // --- TÍTULO ---
      const mainTitle = isFinal ? "🏆 ¡PODIO FINAL! 🏆" : "¡Juego Terminado! 🎉";
      k.add([
        k.text(mainTitle, { size: Math.min(k.width() * 0.08, 48), font: "Jersey" }),
        k.pos(k.center().x, k.height() * 0.15),
        k.anchor("center"),
        k.color(255, 220, 50),
      ]);

      // --- TABLA DE POSICIONES ---
      const mappedScores = roomPlayers.map((player) => ({
        id: player.id,
        username: player.username,
        score: scores[player.id] || 0,
      }));

      const sortedPlayers = mappedScores.sort((a, b) => b.score - a.score);
      let yPos = k.height() * 0.35;

      sortedPlayers.forEach((p, i) => {
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1;
        const isAbsoluteWinner = i === 0 && isFinal;

        k.add([
          k.text(`${medal} ${p.username}: ${p.score} puntos`, {
            size: isAbsoluteWinner
              ? Math.min(k.width() * 0.06, 28)
              : Math.min(k.width() * 0.05, 22),
          }),
          k.pos(k.center().x, yPos),
          k.anchor("center"),
          k.color(isAbsoluteWinner ? k.rgb(250, 204, 21) : k.rgb(200, 200, 255)),
        ]);
        yPos += 52;
      });

      if (isFinal) {
        // Efecto de Confeti procedural
        const palette = [
          k.rgb(239, 68, 68),
          k.rgb(34, 197, 94),
          k.rgb(59, 130, 246),
          k.rgb(234, 179, 8),
        ];

        k.loop(0.15, () => {
          k.add([
            k.rect(k.rand(6, 14), k.rand(6, 14)),
            k.pos(k.rand(0, k.width()), -20),
            k.color(k.choose(palette)),
            k.move(k.rand(70, 110), k.rand(180, 280)),
            k.rotate(k.rand(0, 360)),
            k.offscreen({ destroy: true }),
          ]);
        });

        // ÚNICO BOTÓN PARA SALIR (Solo en la final)
        const btnMainMenuBig = k.add([
          k.rect(280, 52, { radius: 8 }),
          k.pos(k.center().x, k.height() * 0.85),
          k.anchor("center"),
          k.color(139, 92, 246), // Violeta
          k.area(),
        ]);

        btnMainMenuBig.add([
          k.text("Ir al Menú Principal", { size: 20 }),
          k.anchor("center"),
          k.color(255, 255, 255),
        ]);

        // Efectos Hover del botón
        btnMainMenuBig.onHoverUpdate(() => {
          btnMainMenuBig.color = k.rgb(124, 58, 237);
        });
        btnMainMenuBig.onHoverEnd(() => {
          btnMainMenuBig.color = k.rgb(139, 92, 246);
        });

        btnMainMenuBig.onClick(() => {
          k.go("menu");
        });
      } else {
        let timeLeft = timeoutSeconds ?? 10;

        const timerText = k.add([
          k.text(`Siguiente juego en: ${timeLeft}s`, { size: 20 }),
          k.pos(k.center().x, k.height() * 0.85),
          k.anchor("center"),
          k.color(148, 163, 184),
        ]);

        const visualTimer = k.loop(1, () => {
          timeLeft--;
          if (timeLeft >= 0) {
            timerText.text = `Siguiente juego en: ${timeLeft}s`;
          } else {
            visualTimer.cancel();
          }
        });
      }
    }
  );
}

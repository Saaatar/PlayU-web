import type { KAPLAYCtx } from "kaplay";

interface TurnPlayer {
  id: string;
  username: string;
}

export function createTurnBanner(k: KAPLAYCtx, players: TurnPlayer[], socketId: string) {
  // Creamos el objeto de texto de Kaplay
  // Lo posicionamos en y: 35 para que quede exactamente debajo de los nombres (que están en y: 10)
  const banner = k.add([
    k.text("", { size: 25, font: "Jersey" }),
    k.pos(k.width() * 0.5, k.height() * 0.15),
    k.anchor("center"),
  ]);

  // Retornamos un objeto con las acciones necesarias para controlar el banner
  return {
    update: (currentTurnPlayerId: string) => {
      const isMyTurn = socketId === currentTurnPlayerId;
      const playerName = players.find((p) => p.id === currentTurnPlayerId)?.username || "Alguien";

      if (isMyTurn) {
        banner.text = "¡ES TU TURNO!";
        banner.color = k.rgb(50, 255, 50); // Verde
      } else {
        banner.text = `Turno de: ${playerName}`;
        banner.color = k.rgb(200, 200, 200); // Gris
      }
    },
    destroy: () => {
      if (banner.exists()) {
        banner.destroy();
      }
    },
  };
}

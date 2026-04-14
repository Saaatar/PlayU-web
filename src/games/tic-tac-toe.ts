import kaplay from "kaplay";
import { KAPLAYCtx } from "kaplay";

export function registerTicTacToe(k: KAPLAYCtx) {
  k.scene("tic-tac-toe", () => {
    // const socket: Socket = io("http://localhost:3000");

    let myRole: string = "Conectando..."; // Iniciamos con un mensaje de espera

    k.scene("Tic-tac-toe", () => {
      const status = k.add([k.text(myRole, { size: 24 }), k.pos(20, 20)]);

      const offset = 100;

      // socket.on("playerRole", (role: string) => {
      //     myRole = role;
      //     status.text = `Eres: ${myRole} | Esperando turno...`;
      // });

      // // Dibujar Tablero
      // k.add([k.rect(4, 300), k.pos(600, offset), k.color(255, 255, 255)]);
      // k.add([k.rect(4, 300), k.pos(700, offset), k.color(255, 255, 255)]);
      // k.add([k.rect(300, 4), k.pos(500, offset + 100), k.color(255, 255, 255)]);
      // k.add([k.rect(300, 4), k.pos(500, offset + 200), k.color(255, 255, 255)]);

      // function updateVisuals(boardData: (string | null)[], currentTurn: string) {
      //     k.destroyAll("pieza"); // Esto borra las X, O y el cartel de victoria
      //     status.text = `Eres: ${myRole} | Turno de: ${currentTurn}`;

      //     boardData.forEach((val, i) => {
      //         if (val) {
      //             const x = (i % 3) * 100 + 550;
      //             const y = Math.floor(i / 3) * 100 + 150;

      //             k.add([
      //                 k.text(val, { size: 64 }),
      //                 k.pos(x, y),
      //                 k.anchor("center"),
      //                 k.color(val === "X" ? k.rgb(255, 50, 50) : k.rgb(50, 50, 255)),
      //                 "pieza"
      //             ]);
      //         }
      //     });
      // }

      // // Áreas de clic
      // for (let i = 0; i < 9; i++) {
      //     const x = (i % 3) * 100 + 550;
      //     const y = Math.floor(i / 3) * 100 + 150;

      //     const celda = k.add([
      //         k.rect(90, 90),
      //         k.pos(x, y),
      //         k.anchor("center"),
      //         k.opacity(0),
      //         k.area(),
      //     ]);

      //     celda.onClick(() => {
      //         socket.emit("makeMove", i);
      //     });
      // }

      // socket.on("updateBoard", (data: { board: (string | null)[], turn: string }) => {
      //     updateVisuals(data.board, data.turn);
      // });

      // socket.on("gameOver", (data: { winner: string, board: (string | null)[] }) => {
      //     updateVisuals(data.board, "");

      //     let mensaje = data.winner === "Draw" ? "¡Empate!" : `¡Ganó ${data.winner}!`;

      //     // Fondo del cartel
      //     k.add([
      //         k.rect(400, 200),
      //         k.pos(k.width() / 2, k.height() / 2),
      //         k.anchor("center"),
      //         k.color(0, 0, 0),
      //         k.outline(4, k.rgb(255, 255, 255)),
      //         "pieza" // Importante: tag "pieza" para que se borre al reiniciar
      //     ]);

      //     k.add([
      //         k.text(mensaje, { size: 40 }),
      //         k.pos(k.width() / 2, k.height() / 2 - 30),
      //         k.anchor("center"),
      //         "pieza"
      //     ]);

      //     const btn = k.add([
      //         k.rect(200, 50, { radius: 8 }),
      //         k.pos(k.width() / 2, k.height() / 2 + 50),
      //         k.anchor("center"),
      //         k.color(50, 200, 50),
      //         k.area(),
      //         "pieza"
      //     ]);

      //     k.add([
      //         k.text("REINICIAR", { size: 20 }),
      //         k.pos(k.width() / 2, k.height() / 2 + 50),
      //         k.anchor("center"),
      //         k.color(0, 0, 0),
      //         "pieza"
      //     ]);

      //     btn.onClick(() => {
      //         socket.emit("resetGame");
      //     });
      // });

      // Estado inicial
      //updateVisuals(Array(9).fill(null), "X");
    });
  });
}

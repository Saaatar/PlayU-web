import type { KAPLAYCtx } from "kaplay";
import { Player } from "../types/Player";
import { socket } from "../services/sockets";
import { createTurnBanner } from "../components/turnBanner";
import { createTimerDisplay } from "../components/timerDisplay";
import { SocketEvents } from "../types/Socketevents";

export function registerTicTacToe(k: KAPLAYCtx) {
  k.scene(
    "tic-tac-toe",
    ({ roomPlayers, firstTurnId }: { roomPlayers: Player[]; firstTurnId: string }) => {
      // --- ESTADO DEL JUEGO ---
      const players = roomPlayers.map((p) => ({ id: p.id, username: p.username, score: 0 }));
      let currentTurnPlayerId = "";
      let localTimeLeft = 15;
      let isMyTurn = false;
      let locked = false;

      const board: (string | null)[] = Array(9).fill(null);

      // Símbolos y colores para hasta 4 jugadores
      const PLAYER_SYMBOLS = ["X", "O", "∆", "◻"];
      const PLAYER_COLORS = [
        k.rgb(255, 50, 50), // Rojo
        k.rgb(50, 150, 255), // Azul
        k.rgb(50, 255, 50), // Verde
        k.rgb(255, 255, 50), // Amarillo
      ];

      // --- COMPONENTES DE UI ---
      const playerInfoUI = k.add([k.pos(20, 10), "ui"]);
      const turnBannerComponent = createTurnBanner(k, players, socket.id);
      const timerComponent = createTimerDisplay(k, localTimeLeft);

      const updatePlayerInfoUI = () => {
        playerInfoUI.children.forEach((c) => c.destroy());
        let xPos = 20;

        players.forEach((p, index) => {
          const isActive = p.id === currentTurnPlayerId ? "→ " : "  ";
          const symbol = PLAYER_SYMBOLS[index % PLAYER_SYMBOLS.length];
          const color = PLAYER_COLORS[index % PLAYER_COLORS.length];

          const text = k.make([
            k.text(`${isActive}${p.username} (${symbol}): ${p.score}`, { size: 14 }),
            k.pos(xPos, 10),
            k.color(p.id === currentTurnPlayerId ? color : k.rgb(150, 150, 150)),
          ]);
          playerInfoUI.add(text);
          xPos += 180;
        });
      };

      const applyTurn = (playerId: string, timeout: number) => {
        currentTurnPlayerId = playerId;
        localTimeLeft = timeout;
        isMyTurn = socket.id === currentTurnPlayerId;

        turnBannerComponent.update(currentTurnPlayerId);
        timerComponent.updateTime(localTimeLeft);
        updatePlayerInfoUI();
      };

      // Reloj visual local
      k.onUpdate(() => {
        if (localTimeLeft > 0 && !locked) {
          localTimeLeft -= k.dt();
          timerComponent.updateTime(localTimeLeft);
        }
      });

      // --- DIBUJAR EL TABLERO ---
      const CELL_SIZE = k.width() * 0.12;
      const OFFSET_X = k.width() / 2 - CELL_SIZE * 1.5;
      const OFFSET_Y = k.height() / 2 - CELL_SIZE * 1.5 + 30;

      // Líneas de la cuadrícula
      k.add([
        k.rect(4, CELL_SIZE * 3),
        k.pos(OFFSET_X + CELL_SIZE, OFFSET_Y),
        k.color(255, 255, 255),
      ]);
      k.add([
        k.rect(4, CELL_SIZE * 3),
        k.pos(OFFSET_X + CELL_SIZE * 2, OFFSET_Y),
        k.color(255, 255, 255),
      ]);
      k.add([
        k.rect(CELL_SIZE * 3, 4),
        k.pos(OFFSET_X, OFFSET_Y + CELL_SIZE),
        k.color(255, 255, 255),
      ]);
      k.add([
        k.rect(CELL_SIZE * 3, 4),
        k.pos(OFFSET_X, OFFSET_Y + CELL_SIZE * 2),
        k.color(255, 255, 255),
      ]);

      const cellsEntities: any[] = [];

      // Áreas clickeables
      for (let i = 0; i < 9; i++) {
        const x = OFFSET_X + (i % 3) * CELL_SIZE + CELL_SIZE / 2;
        const y = OFFSET_Y + Math.floor(i / 3) * CELL_SIZE + CELL_SIZE / 2;

        const cell = k.add([
          k.rect(CELL_SIZE - 10, CELL_SIZE - 10),
          k.pos(x, y),
          k.anchor("center"),
          k.opacity(0), // Transparente pero clickeable
          k.area(),
          "cell",
          { index: i },
        ]);

        cellsEntities.push(cell);
      }

      // --- LÓGICA DE VICTORIA ---
      const checkWin = (boardState: (string | null)[], playerId: string) => {
        const winPatterns = [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8], // Filas
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8], // Columnas
          [0, 4, 8],
          [2, 4, 6], // Diagonales
        ];
        return winPatterns.some((pattern) =>
          pattern.every((index) => boardState[index] === playerId)
        );
      };

      const checkDraw = (boardState: (string | null)[]) => {
        return boardState.every((cell) => cell !== null);
      };

      // --- EVENTOS Y LÓGICA MULTIJUGADOR ---
      applyTurn(firstTurnId, 15);

      k.onClick("cell", (cell) => {
        if (!isMyTurn || locked) return;
        if (board[cell.index] !== null) return; // Celda ocupada

        // Emitimos la acción al servidor
        socket.emit("game:action", { action: "PLACE_MARK", cellIndex: cell.index });
      });

      socket.on("game:turn_sync", (data: { activePlayerId: string; timeoutSeconds: number }) => {
        applyTurn(data.activePlayerId, data.timeoutSeconds);
      });

      socket.on("game:action", (data: any) => {
        if (data.action === "PLACE_MARK") {
          const playerIndex = players.findIndex((p) => p.id === data.playerId);
          if (playerIndex === -1) return;

          const symbol = PLAYER_SYMBOLS[playerIndex % PLAYER_SYMBOLS.length];
          const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];

          board[data.cellIndex] = data.playerId;
          const targetCell = cellsEntities[data.cellIndex];

          // Dibujar la marca visual
          k.add([
            k.text(symbol, { size: CELL_SIZE * 0.6 }),
            k.pos(targetCell.pos),
            k.anchor("center"),
            k.color(color),
          ]);

          // Comprobar estado final
          if (checkWin(board, data.playerId)) {
            locked = true;
            players[playerIndex].score += 3; // Otorga 3 puntos por ganar
            updatePlayerInfoUI();

            k.add([
              k.text(`¡${players[playerIndex].username} GANA!`, { size: 50 }),
              k.pos(k.width() / 2, k.height() * 0.2),
              k.anchor("center"),
              k.color(color),
            ]);

            if (isMyTurn) {
              k.wait(2, () => {
                const finalScores: Record<string, number> = {};
                players.forEach((p) => {
                  finalScores[p.id] = p.score;
                });
                socket.emit(SocketEvents.GAME_END_MINI, { scores: finalScores });
              });
            }
          } else if (checkDraw(board)) {
            locked = true;

            k.add([
              k.text(`¡EMPATE!`, { size: 50 }),
              k.pos(k.width() / 2, k.height() * 0.2),
              k.anchor("center"),
              k.color(200, 200, 200),
            ]);

            if (isMyTurn) {
              k.wait(2, () => {
                const finalScores: Record<string, number> = {};
                players.forEach((p) => {
                  finalScores[p.id] = p.score;
                });
                socket.emit(SocketEvents.GAME_END_MINI, { scores: finalScores });
              });
            }
          } else {
            // Si nadie gana ni empata, el jugador activo pasa su turno
            if (isMyTurn) socket.emit("game:end_turn", { passTurn: true });
          }
        }
      });

      k.onSceneLeave(() => {
        socket.off("game:turn_sync");
        socket.off("game:action");

        turnBannerComponent.destroy();
        timerComponent.destroy();
      });
    }
  );
}

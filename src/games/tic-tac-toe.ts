import type { KAPLAYCtx } from "kaplay";
import { Player } from "../types/Player";
import { socket } from "../services/sockets";
import { createTurnBanner } from "../components/turnBanner";
import { createTimerDisplay } from "../components/timerDisplay";
import { SocketEvents } from "../types/Socketevents";

export function registerTicTacToe(k: KAPLAYCtx) {
  k.scene(
    "tic-tac-toe",
    ({
      roomPlayers,
      seed,
      firstTurnId,
    }: {
      roomPlayers: Player[];
      seed: number;
      firstTurnId: string;
    }) => {
      // --- CONFIGURACIÓN DEL TABLERO GRANDE (5x5) ---
      const GRID_SIZE = 5;
      const WIN_TARGET = 4; // Se necesitan 4 en línea para ganar
      const board: (string | null)[] = Array(GRID_SIZE * GRID_SIZE).fill(null);

      // --- ESTADO DEL JUEGO ---
      const players = roomPlayers.map((p) => ({ id: p.id, username: p.username, score: 0 }));
      let currentTurnPlayerId = "";
      let localTimeLeft = 15;
      let isMyTurn = false;
      let locked = false;

      // Solo 2 símbolos y 2 colores.
      // Jugador 1 y 3 tendrán "X" (Rojo). Jugador 2 y 4 tendrán "O" (Azul).
      const PLAYER_SYMBOLS = ["X", "O"];
      const PLAYER_COLORS = [
        k.rgb(255, 60, 60), // Equipo 1: Rojo
        k.rgb(50, 150, 255), // Equipo 2: Azul
      ];

      // --- COMPONENTES DE INTERFAZ (UI) ---
      const playerInfoUI = k.add([k.pos(20, 10), "ui"]);
      const turnBannerComponent = createTurnBanner(k, players, socket.id);
      const timerComponent = createTimerDisplay(k, localTimeLeft);

      const updatePlayerInfoUI = () => {
        playerInfoUI.children.forEach((c) => c.destroy());
        let xPos = 20;

        players.forEach((p, index) => {
          const isActive = p.id === currentTurnPlayerId ? "→ " : "  ";
          // Asignación de equipos intercalada (0 y 2 vs 1 y 3)
          const symbol = PLAYER_SYMBOLS[index % 2];
          const color = PLAYER_COLORS[index % 2];

          const text = k.make([
            k.text(`${isActive}${p.username} (${symbol}): ${p.score}`, { size: 14 }),
            k.pos(xPos, 10),
            k.color(p.id === currentTurnPlayerId ? color : k.rgb(160, 160, 160)),
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

      k.onUpdate(() => {
        if (localTimeLeft > 0 && !locked) {
          localTimeLeft -= k.dt();
          timerComponent.updateTime(localTimeLeft);
        }
      });

      // --- ESCALADO Y DIBUJO DINÁMICO DEL TABLERO ---
      const CELL_SIZE = Math.min(k.width() * 0.07, k.height() * 0.1);
      const OFFSET_X = k.width() / 2 - (CELL_SIZE * GRID_SIZE) / 2;
      const OFFSET_Y = k.height() / 2 - (CELL_SIZE * GRID_SIZE) / 2 + 40;

      for (let i = 1; i < GRID_SIZE; i++) {
        k.add([
          k.rect(4, CELL_SIZE * GRID_SIZE),
          k.pos(OFFSET_X + CELL_SIZE * i, OFFSET_Y),
          k.color(70, 80, 110),
        ]);
        k.add([
          k.rect(CELL_SIZE * GRID_SIZE, 4),
          k.pos(OFFSET_X, OFFSET_Y + CELL_SIZE * i),
          k.color(70, 80, 110),
        ]);
      }

      const cellsEntities: any[] = [];

      for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const col = i % GRID_SIZE;
        const row = Math.floor(i / GRID_SIZE);
        const x = OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2;
        const y = OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2;

        const cell = k.add([
          k.rect(CELL_SIZE - 8, CELL_SIZE - 8, { radius: 4 }),
          k.pos(x, y),
          k.anchor("center"),
          k.color(255, 255, 255),
          k.opacity(0.03),
          k.area(),
          "cell",
          { index: i },
        ]);

        cellsEntities.push(cell);
      }

      // --- ALGORITMO DINÁMICO DE VERIFICACIÓN DE VICTORIA POR SÍMBOLO ---
      // Ahora recibe el "símbolo" en lugar del "playerId"
      const checkWin = (boardState: (string | null)[], symbol: string) => {
        // Horizontal
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c <= GRID_SIZE - WIN_TARGET; c++) {
            let win = true;
            for (let i = 0; i < WIN_TARGET; i++) {
              if (boardState[r * GRID_SIZE + (c + i)] !== symbol) {
                win = false;
                break;
              }
            }
            if (win) return true;
          }
        }
        // Vertical
        for (let c = 0; c < GRID_SIZE; c++) {
          for (let r = 0; r <= GRID_SIZE - WIN_TARGET; r++) {
            let win = true;
            for (let i = 0; i < WIN_TARGET; i++) {
              if (boardState[(r + i) * GRID_SIZE + c] !== symbol) {
                win = false;
                break;
              }
            }
            if (win) return true;
          }
        }
        // Diagonal hacia abajo (\)
        for (let r = 0; r <= GRID_SIZE - WIN_TARGET; r++) {
          for (let c = 0; c <= GRID_SIZE - WIN_TARGET; c++) {
            let win = true;
            for (let i = 0; i < WIN_TARGET; i++) {
              if (boardState[(r + i) * GRID_SIZE + (c + i)] !== symbol) {
                win = false;
                break;
              }
            }
            if (win) return true;
          }
        }
        // Diagonal hacia arriba (/)
        for (let r = WIN_TARGET - 1; r < GRID_SIZE; r++) {
          for (let c = 0; c <= GRID_SIZE - WIN_TARGET; c++) {
            let win = true;
            for (let i = 0; i < WIN_TARGET; i++) {
              if (boardState[(r - i) * GRID_SIZE + (c + i)] !== symbol) {
                win = false;
                break;
              }
            }
            if (win) return true;
          }
        }
        return false;
      };

      const checkDraw = (boardState: (string | null)[]) => {
        return boardState.every((cell) => cell !== null);
      };

      // --- INTERACCIONES Y LOGICA DE RED ---
      applyTurn(firstTurnId, 15);

      k.onClick("cell", (cell) => {
        if (!isMyTurn || locked) return;
        if (board[cell.index] !== null) return;

        socket.emit("game:action", { action: "PLACE_MARK", cellIndex: cell.index });
      });

      socket.on("game:turn_sync", (data: { activePlayerId: string; timeoutSeconds: number }) => {
        applyTurn(data.activePlayerId, data.timeoutSeconds);
      });

      socket.on("game:action", (data: any) => {
        if (data.action === "PLACE_MARK") {
          const playerIndex = players.findIndex((p) => p.id === data.playerId);
          if (playerIndex === -1) return;

          // Se asigna el símbolo del "equipo"
          const symbol = PLAYER_SYMBOLS[playerIndex % 2];
          const color = PLAYER_COLORS[playerIndex % 2];

          // ¡CLAVE! Guardamos el símbolo en el tablero, NO el ID del jugador
          board[data.cellIndex] = symbol;
          const targetCell = cellsEntities[data.cellIndex];

          // Dibujar el símbolo en pantalla
          k.add([
            k.text(symbol, { size: CELL_SIZE * 0.55 }),
            k.pos(targetCell.pos),
            k.anchor("center"),
            k.color(color),
          ]);

          // Verificamos si ese SÍMBOLO acaba de ganar
          if (checkWin(board, symbol)) {
            locked = true;
            // Solo el jugador actual (que puso la última pieza) se lleva los puntos
            players[playerIndex].score += 5;
            updatePlayerInfoUI();

            k.add([
              k.text(`¡${players[playerIndex].username} COMPLETA LA LÍNEA!`, {
                size: 36,
                font: "sans-serif",
              }),
              k.pos(k.width() / 2, k.height() * 0.18),
              k.anchor("center"),
              k.color(color),
            ]);

            if (isMyTurn) {
              k.wait(2.5, () => {
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
              k.text("¡EMPATE EN EL TABLERO!", { size: 40, font: "sans-serif" }),
              k.pos(k.width() / 2, k.height() * 0.18),
              k.anchor("center"),
              k.color(180, 180, 180),
            ]);

            if (isMyTurn) {
              k.wait(2.5, () => {
                const finalScores: Record<string, number> = {};
                players.forEach((p) => {
                  finalScores[p.id] = p.score;
                });
                socket.emit(SocketEvents.GAME_END_MINI, { scores: finalScores });
              });
            }
          } else {
            if (isMyTurn) socket.emit("game:end_turn", { passTurn: true });
          }
        }

        if (data.action === "TIMEOUT") {
          locked = false;
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

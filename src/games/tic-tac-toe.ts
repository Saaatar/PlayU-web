import type { KAPLAYCtx } from "kaplay";

export function registerTicTacToe(k: KAPLAYCtx) {
  k.scene("Tic-tac-toe", () => {
    // --- VARIABLES DEL TORNEO ---
    let scores = [0, 0, 0, 0];
    let names = ["Jugador 1", "Jugador 2", "Jugador 3", "Jugador 4"];
    let matchNumber = 1;
    let idxX = 0; // Índice del jugador que usa las X (Jugador 1)
    let idxO = 1; // Índice del jugador que usa las O (Jugador 2)
    let finalists: number[] = []; // Aquí guardaremos a los que pasan a la final

    // --- VARIABLES DEL TABLERO ---
    let board: (string | null)[] = Array(9).fill(null);
    let currentPlayer: string = "X";
    let gameActive: boolean = true;

    // Centramos el tablero y lo bajamos un poco para que quepan los textos
    const tableroX = k.width() * 0.5 - 150;
    const offset = 180;

    // --- INTERFAZ DE TEXTO (UI) ---
    const title = k.add([
      k.text(`RONDA 1: ${names[idxX]} vs ${names[idxO]}`, { size: 36 }),
      k.pos(k.width() / 2, 40),
      k.anchor("center"),
      k.color(255, 200, 50),
    ]);

    const status = k.add([
      k.text(`Turno de: ${names[idxX]} (X)`, { size: 28 }),
      k.pos(k.width() / 2, 100),
      k.anchor("center"),
    ]);

    // --- DIBUJO DEL TABLERO ESTÁTICO ---
    k.add([k.rect(4, 300), k.pos(tableroX + 100, offset), k.color(255, 255, 255), "fondo_tablero"]);
    k.add([k.rect(4, 300), k.pos(tableroX + 200, offset), k.color(255, 255, 255), "fondo_tablero"]);
    k.add([k.rect(300, 4), k.pos(tableroX, offset + 100), k.color(255, 255, 255), "fondo_tablero"]);
    k.add([k.rect(300, 4), k.pos(tableroX, offset + 200), k.color(255, 255, 255), "fondo_tablero"]);

    // --- ACTUALIZAR FICHAS ---
    function updateVisuals() {
      k.destroyAll("pieza");

      let nombreTurno = currentPlayer === "X" ? names[idxX] : names[idxO];
      status.text = `Turno de: ${nombreTurno} (${currentPlayer})`;

      board.forEach((val, i) => {
        if (val) {
          const x = (i % 3) * 100 + (tableroX + 50);
          const y = Math.floor(i / 3) * 100 + (offset + 50);

          k.add([
            k.text(val, { size: 64 }),
            k.pos(x, y),
            k.anchor("center"),
            k.color(val === "X" ? k.rgb(255, 50, 50) : k.rgb(50, 50, 255)),
            "pieza",
          ]);
        }
      });
    }

    // --- VERIFICAR VICTORIA ---
    function checkWin(): string | null {
      const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];

      for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
      }
      if (!board.includes(null)) return "Draw"; // Empate
      return null;
    }

    // --- FIN DE LA PARTIDA ---
    function showMatchResult(winnerMark: string) {
      gameActive = false;
      let matchWinnerIdx = -1;
      let mensaje = "";

      if (winnerMark === "X") {
        matchWinnerIdx = idxX;
        scores[idxX] += 5;
        finalists.push(idxX);
        mensaje = `¡Ganó ${names[idxX]}! (+5 pts)`;
      } else if (winnerMark === "O") {
        matchWinnerIdx = idxO;
        scores[idxO] += 5;
        finalists.push(idxO);
        mensaje = `¡Ganó ${names[idxO]}! (+5 pts)`;
      } else {
        // Empate: 1 punto a cada uno
        scores[idxX] += 1;
        scores[idxO] += 1;
        // Si hay empate, pasamos al primer jugador de esa ronda a la final para que no se rompa el torneo
        finalists.push(idxX);
        mensaje = "¡Empate! (+1 pto a los dos)";
      }

      status.text = "Fin de la Ronda";

      // Cartel de resultados
      k.add([
        k.rect(500, 200),
        k.pos(k.center()),
        k.anchor("center"),
        k.color(0, 0, 0),
        k.outline(4, k.rgb(255, 255, 255)),
        "cartel",
      ]);
      k.add([
        k.text(mensaje, { size: 32 }),
        k.pos(k.width() / 2, k.height() / 2 - 30),
        k.anchor("center"),
        "cartel",
      ]);

      // Botón para la siguiente fase
      const textoBoton = matchNumber === 3 ? "VER PUNTUACIONES" : "SIGUIENTE RONDA";
      const btn = k.add([
        k.rect(300, 50, { radius: 8 }),
        k.pos(k.width() / 2, k.height() / 2 + 50),
        k.anchor("center"),
        k.color(50, 200, 50),
        k.area(),
        "cartel",
      ]);
      k.add([
        k.text(textoBoton, { size: 20 }),
        k.pos(k.width() / 2, k.height() / 2 + 50),
        k.anchor("center"),
        k.color(0, 0, 0),
        "cartel",
      ]);

      btn.onClick(() => {
        k.destroyAll("cartel");
        if (matchNumber < 3) {
          setupNextMatch();
        } else {
          showGrandFinale();
        }
      });
    }

    // --- PREPARAR SIGUIENTE RONDA ---
    function setupNextMatch() {
      if (matchNumber === 1) {
        matchNumber = 2;
        idxX = 2; // Jugador 3
        idxO = 3; // Jugador 4
        title.text = `RONDA 2: ${names[idxX]} vs ${names[idxO]}`;
      } else if (matchNumber === 2) {
        matchNumber = 3;
        idxX = finalists[0]; // Ganador R1
        idxO = finalists[1]; // Ganador R2
        title.text = `LA GRAN FINAL: ${names[idxX]} vs ${names[idxO]}`;
        title.color = k.rgb(255, 50, 50); // La final en rojo
      }

      // Reiniciar variables del tablero
      board = Array(9).fill(null);
      currentPlayer = "X";
      gameActive = true;
      updateVisuals();
    }

    // --- PUNTUACIONES FINALES ---
    function showGrandFinale() {
      k.destroyAll("pieza");
      k.destroyAll("fondo_tablero");
      k.destroyAll("area_clic");
      title.text = "🏆 PUNTUACIONES FINALES 🏆";
      status.text = "";

      const panel = k.add([
        k.rect(500, 350),
        k.pos(k.center()),
        k.anchor("center"),
        k.color(30, 30, 30),
        k.outline(4, k.rgb(255, 255, 255)),
      ]);

      // Imprimir los 4 jugadores y sus puntos
      for (let i = 0; i < 4; i++) {
        k.add([
          k.text(`${names[i]}: ${scores[i]} pts`, { size: 32 }),
          k.pos(k.width() / 2, k.height() / 2 - 100 + i * 45),
          k.anchor("center"),
        ]);
      }

      // Botón para reiniciar todo el torneo
      const btn = k.add([
        k.rect(300, 50, { radius: 8 }),
        k.pos(k.width() / 2, k.height() / 2 + 120),
        k.anchor("center"),
        k.color(50, 200, 50),
        k.area(),
      ]);
      k.add([
        k.text("NUEVO TORNEO", { size: 20 }),
        k.pos(k.width() / 2, k.height() / 2 + 120),
        k.anchor("center"),
        k.color(0, 0, 0),
      ]);

      btn.onClick(() => {
        // Reiniciamos toda la escena volviéndola a llamar
        k.go("Tic-tac-toe");
      });
    }

    // --- DETECCIÓN DE CLICS EN LAS CASILLAS ---
    for (let i = 0; i < 9; i++) {
      const x = (i % 3) * 100 + (tableroX + 50);
      const y = Math.floor(i / 3) * 100 + (offset + 50);

      const celda = k.add([
        k.rect(90, 90),
        k.pos(x, y),
        k.anchor("center"),
        k.opacity(0),
        k.area(),
        "area_clic",
      ]);

      celda.onClick(() => {
        if (!gameActive || board[i] !== null) return;

        board[i] = currentPlayer;
        updateVisuals();

        const winner = checkWin();
        if (winner) {
          showMatchResult(winner);
        } else {
          currentPlayer = currentPlayer === "X" ? "O" : "X";
          let nombreTurno = currentPlayer === "X" ? names[idxX] : names[idxO];
          status.text = `Turno de: ${nombreTurno} (${currentPlayer})`;
        }
      });
    }
  });
}

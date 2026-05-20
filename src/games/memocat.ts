import type { KAPLAYCtx } from "kaplay";
import { mulberry32 } from "../utils/mulberry32";
import { Player } from "../types/Player";
import { socket } from "../services/sockets";
import { createTurnBanner } from "../components/turnBanner";
import { createTimerDisplay } from "../components/timerDisplay"; // 1. IMPORTAMOS EL COMPONENTE
import { SocketEvents } from "../types/Socketevents";

const ANIMALS = ["cat-1", "cat-2", "cat-3", "cat-4", "cat-5", "cat-6", "cat-7", "cat-8"];
const COLS = 4;
const ROWS = 4;

function shuffle<T>(arr: T[], randomFunc: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(randomFunc() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function registerMemocatGame(k: KAPLAYCtx) {
  ANIMALS.forEach((animal) => {
    k.loadSprite(animal, `/sprites/gatos/${animal}.webp`);
  });

  k.scene(
    "memorama",
    ({
      roomPlayers,
      seed,
      firstTurnId,
    }: {
      roomPlayers: Player[];
      seed: number;
      firstTurnId: string;
    }) => {
      // ESTADO DEL JUEGO
      const players = roomPlayers.map((p) => ({ id: p.id, username: p.username, score: 0 }));
      let currentTurnPlayerId = "";
      let localTimeLeft = 15;
      let isMyTurn = false;
      let turnTimerObj: any = null;

      let locked = false;
      let flippedCards: any[] = [];
      let matchedPairs = 0;
      const cardEntities: any[] = [];

      // GENERACIÓN DETERMINISTA
      const rng = mulberry32(seed);
      const deck = shuffle([...ANIMALS, ...ANIMALS], rng);

      // --- INTERFAZ DE USUARIO ---

      // Tabla de puntuaciones
      const playerInfoUI = k.add([k.pos(20, 10), "ui"]);

      // 2. INICIALIZAMOS LOS COMPONENTES
      const turnBannerComponent = createTurnBanner(k, players, socket.id);
      const timerComponent = createTimerDisplay(k, localTimeLeft);

      const updatePlayerInfoUI = () => {
        playerInfoUI.children.forEach((c) => c.destroy());
        let xPos = 20;

        players.forEach((p) => {
          const isActive = p.id === currentTurnPlayerId ? "→ " : "  ";
          const text = k.make([
            k.text(`${isActive}${p.username}: ${p.score}`, { size: 14 }),
            k.pos(xPos, 10),
            k.color(p.id === currentTurnPlayerId ? 255 : 200, 200, 200),
          ]);
          playerInfoUI.add(text);
          xPos += 150;
        });
      };

      // --- CONTROL DE TURNOS CENTRALIZADO ---
      const applyTurn = (playerId: string, timeout: number) => {
        currentTurnPlayerId = playerId;
        localTimeLeft = timeout;
        isMyTurn = socket.id === currentTurnPlayerId;

        turnBannerComponent.update(currentTurnPlayerId);

        // 3. ACTUALIZAMOS EL TIEMPO INICIAL DEL TURNO
        timerComponent.updateTime(localTimeLeft);

        updatePlayerInfoUI();
      };

      // --- CONTADOR VISUAL LOCAL ---
      // 4. Hacemos que el reloj baje visualmente cada frame
      k.onUpdate(() => {
        if (localTimeLeft > 0 && !locked) {
          localTimeLeft -= k.dt(); // Resta el tiempo transcurrido
          timerComponent.updateTime(localTimeLeft);
        }
      });

      // --- DIBUJAR EL TABLERO ---
      const GAP = k.width() * 0.015;
      const maxCardW = (k.width() * 0.85 - GAP * (COLS - 1)) / COLS;
      const maxCardH = (k.height() * 0.7 - GAP * (ROWS - 1)) / ROWS;
      const CARD_SIZE = Math.min(maxCardW, maxCardH);
      const gridW = COLS * CARD_SIZE + (COLS - 1) * GAP;
      const gridH = ROWS * CARD_SIZE + (ROWS - 1) * GAP;
      const OFFSET_X = (k.width() - gridW) / 2;
      const OFFSET_Y = (k.height() - gridH) / 2 + k.height() * 0.05;

      function flipVisual(card: any, show: boolean) {
        card.revealed = show;
        card.bg.color = show ? k.rgb(240, 200, 80) : k.rgb(60, 80, 160);
        card.sprite.opacity = show ? 1 : 0;
        card.question.opacity = show ? 0 : 1;
      }

      deck.forEach((animal, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = OFFSET_X + col * (CARD_SIZE + GAP) + CARD_SIZE / 2;
        const y = OFFSET_Y + row * (CARD_SIZE + GAP) + CARD_SIZE / 2;

        const card: any = { index: i, animal, revealed: false, matched: false };

        card.bg = k.add([
          k.rect(CARD_SIZE, CARD_SIZE, { radius: CARD_SIZE * 0.08 }),
          k.pos(x, y),
          k.anchor("center"),
          k.color(60, 80, 160),
          k.area(),
          "card",
          { cardRef: card },
        ]);

        card.sprite = k.add([
          k.sprite(animal, { width: CARD_SIZE * 0.9, height: CARD_SIZE * 0.9 }),
          k.pos(x, y),
          k.anchor("center"),
          { opacity: 0 },
        ]);

        card.question = k.add([
          k.text("?", { size: CARD_SIZE * 0.4 }),
          k.pos(x, y),
          k.anchor("center"),
          k.color(180, 200, 255),
        ]);

        cardEntities.push(card);
      });

      // --- EVENTOS Y LÓGICA ---

      applyTurn(firstTurnId, 15);

      k.onClick("card", (obj: any) => {
        const card = obj.cardRef;
        if (!isMyTurn) {
          return;
        }
        if (locked) {
          return;
        }
        if (card.revealed || card.matched || flippedCards.length >= 2) {
          return;
        }
        socket.emit("game:action", { action: "FLIP_CARD", cardIndex: card.index });
      });

      socket.on("game:turn_sync", (data: { activePlayerId: string; timeoutSeconds: number }) => {
        applyTurn(data.activePlayerId, data.timeoutSeconds);
      });

      socket.on("game:action", (data: any) => {
        if (data.action === "FLIP_CARD") {
          const targetCard = cardEntities[data.cardIndex];
          if (targetCard.revealed) return;

          flipVisual(targetCard, true);
          flippedCards.push(targetCard);

          if (flippedCards.length === 2) {
            locked = true;

            k.wait(0.8, () => {
              const [a, b] = flippedCards;

              if (a.animal === b.animal) {
                a.matched = b.matched = true;
                a.bg.color = k.rgb(60, 180, 100);
                b.bg.color = k.rgb(60, 180, 100);

                const playerIndex = players.findIndex((p) => p.id === data.playerId);
                if (playerIndex !== -1) {
                  players[playerIndex].score++;
                  updatePlayerInfoUI();
                }

                matchedPairs++;
                flippedCards = [];
                locked = false;

                if (matchedPairs === ANIMALS.length) {
                  if (isMyTurn) {
                    const finalScores: Record<string, number> = {};
                    players.forEach((p) => {
                      finalScores[p.id] = p.score;
                    });

                    socket.emit(SocketEvents.GAME_END_MINI, { scores: finalScores });
                  }
                } else {
                  if (isMyTurn) socket.emit("game:end_turn", { passTurn: false });
                }
              } else {
                flipVisual(a, false);
                flipVisual(b, false);
                flippedCards = [];
                locked = false;

                if (isMyTurn) socket.emit("game:end_turn", { passTurn: true });
              }
            });
          }
        }

        if (data.action === "TIMEOUT") {
          if (flippedCards.length === 1) {
            flipVisual(flippedCards[0], false);
            flippedCards = [];
          }
          locked = false;
        }
      });

      k.onSceneLeave(() => {
        socket.off("game:turn_sync");
        socket.off("game:action");

        // 5. DESTRUIMOS LOS COMPONENTES AL SALIR
        turnBannerComponent.destroy();
        timerComponent.destroy();

        if (turnTimerObj) turnTimerObj.cancel();
      });
    }
  );
}

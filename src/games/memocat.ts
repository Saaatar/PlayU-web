import type { KAPLAYCtx } from "kaplay";
import { Player } from "../types/Player";

const ANIMALS = ["cat-1", "cat-2", "cat-3", "cat-4", "cat-5", "cat-6", "cat-7", "cat-8"];
const COLS = 4;
const ROWS = 4;
const FLIP_TIMEOUT = 15;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function registerMemocatGame(k: KAPLAYCtx) {
  ANIMALS.forEach((animal) => {
    k.loadSprite(animal, `/sprites/gatos/${animal}.webp`);
  });

  k.scene("memorama", ({ roomPlayers }: { roomPlayers: Player[] }) => {
    const players = roomPlayers.map((p) => ({ id: p.id, name: p.username, score: 0 }));

    const GAP = k.width() * 0.015;
    const maxCardW = (k.width() * 0.85 - GAP * (COLS - 1)) / COLS;
    const maxCardH = (k.height() * 0.7 - GAP * (ROWS - 1)) / ROWS;
    const CARD_SIZE = Math.min(maxCardW, maxCardH);

    const gridW = COLS * CARD_SIZE + (COLS - 1) * GAP;
    const gridH = ROWS * CARD_SIZE + (ROWS - 1) * GAP;
    const OFFSET_X = (k.width() - gridW) / 2;
    const OFFSET_Y = (k.height() - gridH) / 2 + k.height() * 0.05;

    const deck = shuffle([...ANIMALS, ...ANIMALS]);

    let flipped: any[] = [];
    let matched = 0;
    let currentPlayer = 0;
    let locked = false;
    let elapsedTime = 0;

    const playerInfoUI = k.add([k.pos(20, 10), "ui"]);

    const updatePlayerInfo = () => {
      playerInfoUI.children.forEach((c) => c.destroy());
      let xPos = 20;

      players.forEach((p, i) => {
        const isActive = i === currentPlayer ? "→ " : "  ";

        const text = k.make([
          k.text(`${isActive}${p.name}: ${p.score}`, { size: 14 }),
          k.pos(xPos, 10),
          k.color(i === currentPlayer ? 255 : 200, 200, 200),
        ]);

        playerInfoUI.add(text);
        xPos += 150;
      });
    };
    updatePlayerInfo();
    const timerDisplay = k.add([
      k.text(`Tiempo: ${FLIP_TIMEOUT}s`, { size: 16 }),
      k.pos(k.width() - 150, 10),
      k.color(100, 200, 255),
    ]);

    const updateTimer = () => {
      const timeLeft = Math.max(0, FLIP_TIMEOUT - elapsedTime);
      timerDisplay.text = `Tiempo: ${Math.ceil(timeLeft)}s`;
    };

    function passTurn() {
      flipped.forEach((card) => flip(card, false));
      flipped = [];
      locked = false;
      elapsedTime = 0;
      currentPlayer = (currentPlayer + 1) % players.length;
      updatePlayerInfo();
      updateTimer();
    }

    deck.forEach((animal, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);

      const x = OFFSET_X + col * (CARD_SIZE + GAP) + CARD_SIZE / 2;
      const y = OFFSET_Y + row * (CARD_SIZE + GAP) + CARD_SIZE / 2;

      const card: any = { animal, revealed: false, matched: false };

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
        k.sprite(animal, {
          width: CARD_SIZE * 0.9,
          height: CARD_SIZE * 0.9,
        }),
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
    });

    function flip(card: any, show: boolean) {
      card.revealed = show;
      card.bg.color = show ? k.rgb(240, 200, 80) : k.rgb(60, 80, 160);
      card.sprite.opacity = show ? 1 : 0;
      card.question.opacity = show ? 0 : 1;
    }

    function checkMatch() {
      const [a, b] = flipped;
      if (a.animal === b.animal) {
        a.matched = b.matched = true;
        a.bg.color = k.rgb(60, 180, 100);
        b.bg.color = k.rgb(60, 180, 100);
        players[currentPlayer].score++;
        matched++;

        flipped = [];
        locked = false;
        elapsedTime = 0;
        updatePlayerInfo();

        if (matched === ANIMALS.length) {
          k.wait(0.5, () => k.go("memorama-win", { players, roomPlayers }));
        }
      } else {
        k.wait(0.5, () => {
          // Falló, pasamos el turno
          passTurn();
        });
      }
    }

    k.onClick("card", (obj: any) => {
      if (locked) return;
      const card = obj.cardRef;
      if (card.revealed || card.matched || flipped.length >= 2) return;

      flip(card, true);
      flipped.push(card);

      if (flipped.length === 2) {
        locked = true;
        k.wait(0.8, checkMatch);
      }
    });

    k.onUpdate(() => {
      if (!locked) {
        elapsedTime += k.dt();
        updateTimer();

        if (elapsedTime >= FLIP_TIMEOUT) {
          passTurn();
        }
      }
    });
  });

  k.scene("memorama-win", ({ players, roomPlayers }: { players: any[]; roomPlayers: Player[] }) => {
    k.add([
      k.text("¡Juego Terminado! 🎉", { size: Math.min(k.width() * 0.1, 48) }),
      k.pos(k.center().x, k.height() * 0.2),
      k.anchor("center"),
      k.color(255, 220, 50),
    ]);

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    let yPos = k.height() * 0.35;

    sortedPlayers.forEach((p, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1;
      k.add([
        k.text(`${medal} ${p.name}: ${p.score} puntos`, { size: Math.min(k.width() * 0.06, 24) }),
        k.pos(k.center().x, yPos),
        k.anchor("center"),
        k.color(200, 200, 255),
      ]);
      yPos += 50;
    });

    k.add([
      k.text("[ jugar de nuevo ]", { size: Math.min(k.width() * 0.06, 20) }),
      k.pos(k.center().x, k.height() * 0.85),
      k.anchor("center"),
      k.color(100, 180, 255),
      k.area(),
      "btnRetry",
    ]);

    k.onClick("btnRetry", () => {
      k.go("memorama", { roomPlayers });
    });
  });
}

import type { KAPLAYCtx } from "kaplay";

const ANIMALS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
const COLS = 4;
const CARD_W = 110;
const CARD_H = 110;
const GAP = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function registerMemocatGame(k: KAPLAYCtx) {
  k.scene("memorama", () => {
    const OFFSET_X = (k.width() - (COLS * CARD_W + (COLS - 1) * GAP)) / 2;
    const OFFSET_Y = (k.height() - (4 * CARD_H + 3 * GAP)) / 2;
    const deck = shuffle([...ANIMALS, ...ANIMALS]);

    let flipped: any[] = [];
    let matched = 0;
    let moves = 0;
    let locked = false;

    /*const labelMoves = k.add([
      k.text("Movimientos: 0", { size: 20 }),
      k.pos(400, 30),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);*/

    deck.forEach((animal, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = OFFSET_X + col * (CARD_W + GAP) + CARD_W / 2;
      const y = OFFSET_Y + row * (CARD_H + GAP) + CARD_H / 2;

      const card: any = { animal, revealed: false, matched: false };

      card.bg = k.add([
        k.rect(CARD_W, CARD_H, { radius: 8 }),
        k.pos(x, y),
        k.anchor("center"),
        k.color(60, 80, 160),
        k.area(),
        "card",
        { cardRef: card },
      ]);

      card.emoji = k.add([k.text("", { size: 48 }), k.pos(x, y), k.anchor("center")]);

      card.question = k.add([
        k.text("?", { size: 40 }),
        k.pos(x, y),
        k.anchor("center"),
        k.color(180, 200, 255),
      ]);
    });

    function flip(card: any, show: boolean) {
      card.revealed = show;
      card.bg.color = show ? k.rgb(240, 200, 80) : k.rgb(60, 80, 160);
      card.emoji.text = show ? card.animal : "";
      card.question.opacity = show ? 0 : 1;
    }

    function checkMatch() {
      const [a, b] = flipped;
      if (a.animal === b.animal) {
        a.matched = b.matched = true;
        a.bg.color = k.rgb(60, 180, 100);
        b.bg.color = k.rgb(60, 180, 100);
        matched++;
        flipped = [];
        locked = false;
        if (matched === ANIMALS.length) {
          k.wait(0.5, () => k.go("memorama-win", { moves }));
        }
      } else {
        k.wait(0.5, () => {
          flip(a, false);
          flip(b, false);
          flipped = [];
          locked = false;
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
        moves++;
        //labelMoves.text = `Movimientos: ${moves}`;
        locked = true;
        k.wait(0.8, checkMatch);
      }
    });
  });

  k.scene("memorama-win", ({ moves }: { moves: number }) => {
    k.add([
      k.text("¡Ganaste! 🎉", { size: 48 }),
      k.pos(400, 240),
      k.anchor("center"),
      k.color(255, 220, 50),
    ]);

    k.add([
      k.text(`${moves} movimientos`, { size: 24 }),
      k.pos(400, 300),
      k.anchor("center"),
      k.color(200, 200, 255),
    ]);

    k.add([
      k.text("[ jugar de nuevo ]", { size: 20 }),
      k.pos(400, 360),
      k.anchor("center"),
      k.color(100, 180, 255),
      k.area(),
      "btnRetry",
    ]);

    k.onClick("btnRetry", () => k.go("memorama"));
  });
}

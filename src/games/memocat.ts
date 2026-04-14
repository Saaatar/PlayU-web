import type { KAPLAYCtx } from "kaplay";

const ANIMALS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
const COLS = 4;
const ROWS = 4; // 8 animales x 2 = 16 cartas, que equivalen a 4 filas

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
    // 1. CÁLCULOS DINÁMICOS DE TAMAÑO
    // El espacio entre cartas será el 2% del ancho de la pantalla
    const GAP = k.width() * 0.02;

    // Calculamos el tamaño máximo que podría tener la carta a lo ancho (dejando 10% de margen)
    const maxCardW = (k.width() * 0.9 - GAP * (COLS - 1)) / COLS;
    // Calculamos el tamaño máximo a lo alto (dejando 20% de margen para que no toque el techo/piso)
    const maxCardH = (k.height() * 0.8 - GAP * (ROWS - 1)) / ROWS;

    // Tomamos el menor de los dos para asegurar que la carta sea un cuadrado perfecto que quepa en ambos sentidos
    const CARD_SIZE = Math.min(maxCardW, maxCardH);

    // 2. CÁLCULO PARA CENTRAR LA CUADRÍCULA
    const gridW = COLS * CARD_SIZE + (COLS - 1) * GAP;
    const gridH = ROWS * CARD_SIZE + (ROWS - 1) * GAP;

    const OFFSET_X = (k.width() - gridW) / 2;
    const OFFSET_Y = (k.height() - gridH) / 2;

    const deck = shuffle([...ANIMALS, ...ANIMALS]);

    let flipped: any[] = [];
    let matched = 0;
    let moves = 0;
    let locked = false;

    deck.forEach((animal, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);

      // Sumamos la mitad del CARD_SIZE al final porque el ancla es "center"
      const x = OFFSET_X + col * (CARD_SIZE + GAP) + CARD_SIZE / 2;
      const y = OFFSET_Y + row * (CARD_SIZE + GAP) + CARD_SIZE / 2;

      const card: any = { animal, revealed: false, matched: false };

      card.bg = k.add([
        // Usamos el tamaño dinámico para la carta y adaptamos el radio del borde
        k.rect(CARD_SIZE, CARD_SIZE, { radius: CARD_SIZE * 0.08 }),
        k.pos(x, y),
        k.anchor("center"),
        k.color(60, 80, 160),
        k.area(),
        "card",
        { cardRef: card },
      ]);

      // Hacemos que el tamaño del emoji sea la mitad del tamaño de la carta
      card.emoji = k.add([k.text("", { size: CARD_SIZE * 0.5 }), k.pos(x, y), k.anchor("center")]);

      // Hacemos lo mismo para el signo de interrogación
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
        locked = true;
        k.wait(0.8, checkMatch);
      }
    });
  });

  // 3. PANTALLA DE VICTORIA DINÁMICA
  k.scene("memorama-win", ({ moves }: { moves: number }) => {
    k.add([
      k.text("¡Ganaste! 🎉", { size: Math.min(k.width() * 0.1, 48) }), // Escala el texto en móviles
      k.pos(k.center().x, k.height() * 0.35), // Centrado en X, al 35% de la altura
      k.anchor("center"),
      k.color(255, 220, 50),
    ]);

    k.add([
      k.text(`${moves} movimientos`, { size: Math.min(k.width() * 0.05, 24) }),
      k.pos(k.center().x, k.height() * 0.5),
      k.anchor("center"),
      k.color(200, 200, 255),
    ]);

    k.add([
      k.text("[ jugar de nuevo ]", { size: Math.min(k.width() * 0.06, 20) }),
      k.pos(k.center().x, k.height() * 0.65),
      k.anchor("center"),
      k.color(100, 180, 255),
      k.area(),
      "btnRetry",
    ]);

    k.onClick("btnRetry", () => k.go("memorama"));
  });
}

import type { KAPLAYCtx } from "kaplay";

export function registerTuttiFruttiMix(k: KAPLAYCtx) {
  /*
    const k = kaplay({
    canvas: canvasElement,
    width: 800,
    height: 600,
    letterbox: true,
    background: [15, 23, 42],
    global: false,
    });
*/

  k.loadSprite("apple_red", "/sprites/Apple_Red.png");
  k.loadSprite("banana", "/sprites/Banana.png");
  k.loadSprite("cherry", "/sprites/Cherry.png");
  k.loadSprite("lemon", "/sprites/Lemon.png");
  k.loadSprite("orange", "/sprites/Orange.png");
  k.loadSprite("pear", "/sprites/Pear.png");
  k.loadSprite("plum", "/sprites/Plum.png");
  k.loadSprite("watermelon", "/sprites/Watermelon.png");
  k.loadSprite("berry", "/sprites/Berry.png");
  k.loadSprite("apple_green", "/sprites/Apple_Green.png");
  k.loadSprite("apple_yellow", "/sprites/Apple_Yellow.png");
  k.loadSprite("lime", "/sprites/Lime.png");

  const fruitsName = [
    "apple_red",
    "banana",
    "cherry",
    "lemon",
    "lime",
    "berry",
    "apple_yellow",
    "orange",
  ];

  k.scene("main", () => {
    const posicionesSlots = [
      k.vec2(200, 300),
      k.vec2(330, 300),
      k.vec2(460, 300),
      k.vec2(590, 300),
      k.vec2(200, 430),
      k.vec2(330, 430),
      k.vec2(460, 430),
      k.vec2(590, 430),
    ];

    const instruccion = k.add([
      k.text("¡MEMORIZA LAS POSICIONES!", { size: 32, font: "sans-serif" }),
      k.pos(400, 100),
      k.anchor("center"),
      k.color(255, 200, 50),
    ]);

    // Tablero
    const frutasAleatorias = k.shuffle([...fruitsName]);
    const frutasMemoria = frutasAleatorias.map((fruta, index) => {
      k.add([
        k.rect(100, 100, { radius: 12 }),
        k.pos(posicionesSlots[index]),
        k.anchor("center"),
        k.color(30, 40, 60),
        k.outline(4, k.rgb(70, 80, 110)),
        k.area(),
        "slot",
        { frutaCorrecta: fruta },
      ]);

      return k.add([
        k.sprite(fruta),
        k.pos(posicionesSlots[index]),
        k.anchor("center"),
        k.scale(1),
        "fruta_memoria",
      ]);
    });

    k.wait(4, () => {
      instruccion.text = "¡ACOMODA LAS FRUTAS!";
      instruccion.color = k.rgb(50, 255, 50);

      k.destroyAll("fruta_memoria");

      fruitsName.forEach((fruta, index) => {
        k.add([
          k.sprite(fruta),
          k.pos(100, 150 + index * 50),
          k.anchor("center"),
          k.scale(0.8),
          k.area(),
          "fruta_jugable",
          { nombre: fruta },
        ]);
      });

      // Lógica de clics
      let selectFruit: any = null;

      k.onClick("fruta_jugable", (fruitClick) => {
        if (selectFruit) selectFruit.scale = k.vec2(0.8);

        selectFruit = fruitClick;
        selectFruit.scale = k.vec2(1.1);
      });

      k.onClick("slot", (slotClick) => {
        if (!selectFruit) return;

        if (slotClick.frutaCorrecta === selectFruit.nombre) {
          selectFruit.pos = slotClick.pos;
          selectFruit.scale = k.vec2(0.8);
          selectFruit.unuse("area");
          selectFruit = null;

          k.add([
            k.text("BIEN", { size: 40 }),
            k.pos(slotClick.pos.x + 30, slotClick.pos.y - 30),
            k.opacity(1),
            k.lifespan(1, { fade: 0.5 }),
          ]);
        } else {
          // ¡ERROR!
          k.shake(5);

          k.add([
            k.text("MAL", { size: 60 }),
            k.pos(slotClick.pos),
            k.anchor("center"),
            k.opacity(1),
            k.lifespan(0.5, { fade: 0.2 }),
          ]);

          selectFruit.scale = k.vec2(0.8);
          selectFruit = null;
        }
      });
    });
  });

  /*
  k.go("main");

  return k;*/
}

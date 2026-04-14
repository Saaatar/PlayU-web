import type { KAPLAYCtx } from "kaplay";

export function registerTuttiFruttiMix(k: KAPLAYCtx) {
  k.loadSprite("apple_red", "/sprites/tutifruti/Apple_Red.png");
  k.loadSprite("banana", "/sprites/tutifruti/Banana.png");
  k.loadSprite("cherry", "/sprites/tutifruti/Cherry.png");
  k.loadSprite("lemon", "/sprites/tutifruti/Lemon.png");
  k.loadSprite("orange", "/sprites/tutifruti/Orange.png");
  k.loadSprite("pear", "/sprites/tutifruti/Pear.png");
  k.loadSprite("plum", "/sprites/tutifruti/Plum.png");
  k.loadSprite("watermelon", "/sprites/tutifruti/Watermelon.png");
  k.loadSprite("berry", "/sprites/tutifruti/Berry.png");
  k.loadSprite("apple_green", "/sprites/tutifruti/Apple_Green.png");
  k.loadSprite("apple_yellow", "/sprites/tutifruti/Apple_Yellow.png");
  k.loadSprite("lime", "/sprites/tutifruti/Lime.png");

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

  k.scene("start-tutifruti", () => {
    /*const posicionesSlots = [
      k.vec2(200, 300),
      k.vec2(330, 300),
      k.vec2(460, 300),
      k.vec2(590, 300),
      k.vec2(200, 430),
      k.vec2(330, 430),
      k.vec2(460, 430),
      k.vec2(590, 430),
    ];*/
    const instruccion = k.add([
      k.text("¡MEMORIZA LAS POSICIONES!", { size: 32, font: "sans-serif" }),
      k.pos(k.width() * 0.5, k.height() * 0.2),
      k.anchor("center"),
      k.color(255, 200, 50),
    ]);

    //posiciones de tablero
    const totalSlots = 8;
    const columnas = 4;

    // Espaciado del tablero
    const espaciadoX = k.width() * 0.12;
    const espaciadoY = k.height() * 0.25;

    // EL SECRETO: El cuadro ahora escala según la pantalla (nunca será más grande que su espacio)
    const tamanoSlot = espaciadoX * 0.8;

    // Movemos el centro del tablero al 65% de la pantalla para dejar libre el lado izquierdo
    const centroDerecho = k.width() * 0.5;
    const startX = centroDerecho - (espaciadoX * (columnas - 1)) / 2;
    const startY = k.height() * 0.35;

    const posicionesSlots: any[] = [];

    for (let i = 0; i < totalSlots; i++) {
      const col = i % columnas;
      const fila = Math.floor(i / columnas);
      const posX = startX + col * espaciadoX;
      const posY = startY + fila * espaciadoY;
      posicionesSlots.push(k.vec2(posX, posY));
    }
    // Tablero
    const frutasAleatorias = k.shuffle([...fruitsName]);

    frutasAleatorias.forEach((fruta, index) => {
      k.add([
        // Usamos el tamaño dinámico. El radio del borde también escala.
        k.rect(tamanoSlot, tamanoSlot, { radius: Math.max(4, tamanoSlot * 0.1) }),
        k.pos(posicionesSlots[index]),
        k.anchor("center"),
        k.color(30, 40, 60),
        k.outline(3, k.rgb(70, 80, 110)),
        k.area(),
        "slot",
        { frutaCorrecta: fruta },
      ]);

      k.add([
        k.sprite(fruta),
        k.pos(posicionesSlots[index]),
        k.anchor("center"),
        // Escala la fruta basada en el tamaño del recuadro (asumiendo que tu sprite mide ~100px)
        k.scale(tamanoSlot / 100),
        "fruta_memoria",
      ]);
    });

    k.wait(4, () => {
      instruccion.text = "¡ACOMODA LAS FRUTAS!";
      instruccion.color = k.rgb(50, 255, 50);

      k.destroyAll("fruta_memoria");
      const frutasOpciones = k.shuffle([...fruitsName]);

      const columnasIzquierda = 2;
      const espacioOpcX = k.width() * 0.1; // Espacio entre las 2 columnas
      const espacioOpcY = k.height() * 0.15; // Espacio vertical (4 filas)

      // El centro de las opciones estará en el 20% del ancho de la pantalla (Lado Izquierdo)
      const centroIzquierdo = k.width() * 0.1;
      const startOpcionesX = centroIzquierdo - (espacioOpcX * (columnasIzquierda - 1)) / 2;
      const startOpcionesY = startY; // Empiezan a la misma altura que el tablero

      frutasOpciones.forEach((fruta, index) => {
        const col = index % columnasIzquierda;
        const fila = Math.floor(index / columnasIzquierda);

        const posX = startOpcionesX + col * espacioOpcX;
        const posY = startOpcionesY + fila * espacioOpcY;

        k.add([
          k.sprite(fruta),
          k.pos(posX, posY), // ERROR CORREGIDO: Ya no usa posicionesSlots[index]
          k.anchor("center"),
          k.scale(tamanoSlot / 100), // Mantiene la misma escala que el tablero
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
}

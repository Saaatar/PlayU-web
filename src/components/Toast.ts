import type { KAPLAYCtx } from "kaplay";

export function showToast(k: KAPLAYCtx, message: string) {
  // Evitar que se acumulen muchos toasts si el usuario hace mucho spam al botón
  k.destroyAll("toast");

  // 1. Creamos el texto primero en memoria (sin dibujarlo) para saber sus medidas
  const textObj = k.make([
    k.text(message, { size: 30, font: "Jersey" }), // Cambiamos a fuente Jersey
  ]);

  // 2. Definimos los márgenes para que el cuadro no quede pegado a las letras
  const paddingX = 40;
  const paddingY = 20;

  // 3. Dibujamos el fondo adaptativo usando el ancho del texto
  const toast = k.add([
    k.rect(textObj.width + paddingX, textObj.height + paddingY, { radius: 8 }),
    k.pos(k.center().x, k.height() * 0.15), // Arriba en el centro
    k.anchor("center"),
    k.color(239, 68, 68),
    k.z(100),
    "toast",
  ]);

  // 4. Agregamos el texto visualmente adentro del cuadro
  toast.add([
    k.text(message, { size: 30, font: "Jersey" }),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);

  k.wait(3, () => {
    if (toast.exists()) {
      toast.destroy();
    }
  });
}

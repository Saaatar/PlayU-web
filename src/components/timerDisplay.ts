import type { KAPLAYCtx } from "kaplay";

export function createTimerDisplay(k: KAPLAYCtx, initialTime: number) {
  // Creamos el texto del reloj con las propiedades exactas que pediste
  const timerDisplay = k.add([
    k.text(`Tiempo: ${initialTime}s`, { size: 24 }),
    k.pos(k.width() - 20, 20),
    k.anchor("topright"),
    k.color(255, 255, 255),
    "timer-display",
  ]);

  return {
    // Método para actualizar el texto
    updateTime: (timeLeft: number) => {
      // Usamos Math.ceil para no mostrar decimales y Math.max para no bajar de 0
      timerDisplay.text = `Tiempo: ${Math.max(0, Math.ceil(timeLeft))}s`;
    },
    // Método para limpiarlo al salir de la escena
    destroy: () => {
      if (timerDisplay.exists()) {
        timerDisplay.destroy();
      }
    },
  };
}

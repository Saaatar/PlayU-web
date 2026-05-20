import type { KAPLAYCtx } from "kaplay";
import { createButton } from "../components/buttonGame";
import { lobby } from "./lobby";

export function mainPage(k: KAPLAYCtx) {
  k.loadFont("Jersey", "/fonts/Jersey.ttf");

  k.scene("menu", () => {
    k.setBackground(2, 6, 23);

    // Título Principal
    k.add([
      k.text("PLAYU", { size: 100, font: "Jersey" }),
      k.pos(k.width() * 0.5, k.height() * 0.3),
      k.color(139, 92, 246),
      k.anchor("center"),
    ]);

    lobby(k);

    // Botón de Crear Sala (Centrado)
    createButton({
      k: k,
      text: "Create Room ",
      position: k.vec2(k.width() * 0.5, k.height() * 0.6),
      onClick: () => {
        k.go("create-lobby");
      },
    });

    // Créditos - Título
    k.add([
      k.text("Desarrollado por:", { size: 24, font: "Jersey" }),
      k.pos(k.width() * 0.5, k.height() * 0.85),
      k.color(148, 163, 184),
      k.anchor("center"),
    ]);

    // Créditos - Nombres
    k.add([
      k.text("Carlos Coronado, Elias Rodriguez, Jhonatan Solis, Jazmin Ake", {
        size: 20,
        font: "Jersey",
      }),
      k.pos(k.width() * 0.5, k.height() * 0.9),
      k.color(148, 163, 184),
      k.anchor("center"),
    ]);
  });
}

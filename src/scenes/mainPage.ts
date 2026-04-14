import type { KAPLAYCtx, Vec2 } from "kaplay";
import { createButton } from "../components/buttonGame";
import { lobby } from "./lobby";
export function mainPage(k: KAPLAYCtx) {
  k.loadFont("Jersey", "/fonts/Jersey.ttf");

  k.scene("menu", () => {
    k.setBackground(2, 6, 23);
    k.add([
      k.text("PLAYU", { size: 100, font: "Jersey" }),
      k.pos(k.width() * 0.5, k.height() * 0.3),
      k.color(139, 92, 246),
      k.anchor("center"),
    ]);

    lobby(k);
    createButton({
      k: k,
      text: "Create Room ",
      position: k.vec2(k.width() * 0.2, k.height() * 0.6),
      onClick: () => {
        k.go("create-lobby");
      },
    });

    createButton({
      k: k,
      text: "TutiFruti ",
      position: k.vec2(k.width() * 0.8, k.height() * 0.2),
      onClick: () => {
        k.go("start-tutifruti");
      },
    });

    createButton({
      k: k,
      text: "Memocat",
      position: k.vec2(k.width() * 0.8, k.height() * 0.4),
      onClick: () => {
        k.go("memorama");
      },
    });

    createButton({
      k: k,
      text: "TicTacToe",
      position: k.vec2(k.width() * 0.8, k.height() * 0.6),
      onClick: () => {
        k.go("Tic-tac-toe");
      },
    });

    createButton({
      k: k,
      text: "Croco",
      position: k.vec2(k.width() * 0.8, k.height() * 0.8),
      onClick: () => {
        k.go("catch-face");
      },
    });
  });
}

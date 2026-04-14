import type { KAPLAYCtx, Vec2 } from "kaplay";
import { createButton } from "../components/buttonGame";
import { createCard } from "../components/card";

export function room(k: KAPLAYCtx) {
  k.scene("create-room", () => {
    k.setBackground(2, 6, 23);
    k.add([
      k.text("Room", { size: 70, font: "Jersey" }),
      k.pos(k.width() * 0.5, k.height() * 0.2),
      k.color(139, 92, 246),
      k.anchor("center"),
    ]);
  });
}

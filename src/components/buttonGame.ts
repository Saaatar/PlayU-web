import type { KAPLAYCtx, Vec2, GameObj } from "kaplay";

interface ButtonProps {
  k: KAPLAYCtx;
  text: string;
  position: Vec2;
  onClick: () => void;
  parent?: GameObj;
  width?: number;
  height?: number;
}

export function createButton({
  k,
  text,
  position,
  onClick,
  parent,
  width = 180,
  height = 60,
}: ButtonProps) {
  const target = parent || k;

  const button = target.add([
    k.rect(width, height, { radius: 12 }),
    k.pos(position),
    k.anchor("center"),
    k.color(139, 92, 246),
    k.area(),
    k.scale(1),
    "ui-button",
  ]);

  button.add([k.text(text, { size: 35, font: "Jersey" }), k.anchor("center"), k.color()]);

  button.onClick(onClick);

  button.onHoverUpdate(() => {
    button.scale = k.vec2(1.05); // Crece un poquito
    button.color = k.rgb(79, 70, 229);
    k.setCursor("pointer");
  });

  button.onHoverEnd(() => {
    button.scale = k.vec2(1); // Regresa a la normalidad
    button.color = k.rgb(124, 58, 237);
    k.setCursor("default");
  });

  return button;
}

import type { KAPLAYCtx, Vec2 } from "kaplay";
import { createButton } from "./buttonGame";

interface CardProps {
  k: KAPLAYCtx;
  title: string;
  description: string;
  position: Vec2;
}

export function createCard({ k, title, description, position }: CardProps) {
  const cardWidth = k.width() * 0.35;
  const cardHeight = k.height() * 0.65;

  const card = k.add([
    k.rect(cardWidth, cardHeight, { radius: 12 }),
    k.pos(position),
    k.anchor("center"),
    k.color(15, 23, 42),
    k.area(),
    k.scale(1),
    "ui-button",
  ]);

  card.add([
    k.text(title, { size: 35, font: "Jersey" }),
    k.pos(0, -cardHeight * 0.35),
    k.anchor("center"),
    k.color(255, 255, 255),
  ]);

  card.add([
    k.text(description, { size: 15, font: "san-serif" }),
    k.pos(0, -cardHeight * 0.15),
    k.anchor("center"),
    k.color(130, 134, 145),
  ]);

  return card;
}

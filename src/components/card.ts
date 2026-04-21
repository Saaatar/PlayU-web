import type { KAPLAYCtx, Vec2 } from "kaplay";
import { createButton } from "./buttonGame";

interface CardProps {
  k: KAPLAYCtx;
  title: string;
  description: string;
  position: Vec2;
  width?: number;
  height?: number;
}

export function createCard({
  k,
  title,
  description,
  position,
  width = k.width() * 0.35,
  height = k.height() * 0.65,
}: CardProps) {
  const cardWidth = width;
  const cardHeight = height;
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
    k.text(description, { size: 20, font: "Jersey" }),
    k.pos(0, -cardHeight * 0.15),
    k.anchor("center"),
    k.color(130, 134, 145),
  ]);

  return card;
}

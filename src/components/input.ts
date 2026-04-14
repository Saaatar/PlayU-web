import type { KAPLAYCtx, Vec2, GameObj } from "kaplay";

interface InputProps {
  k: KAPLAYCtx;
  position: Vec2;
  placeholder?: string;
  maxLength?: number;
  parent?: GameObj;
}

export function createInput({
  k,
  position,
  placeholder = "Escribe...",
  maxLength = 12,
  parent,
}: InputProps) {
  const target = parent || k;
  let isFocused = false;
  let textContent = "";

  // 1. Contenedor (Fondo interactivo)
  const input = target.add([
    k.rect(150, 40, { radius: 8 }),
    k.pos(position),
    k.anchor("center"),
    k.color(30, 41, 59),
    k.outline(4, k.rgb(71, 85, 105)), // Borde normal
    k.area(),
    "ui-input",
    { getText: () => textContent }, // Función para sacar el texto
  ]);

  // 2. Texto visible (Centrado)
  const textObj = input.add([
    k.text(placeholder, { size: 15, font: "sans-serif" }),
    k.anchor("center"),
    k.color(148, 163, 184), // Color gris placeholder
  ]);

  // --- LÓGICA DE EVENTOS ---

  // Detectar Focus (Clic adentro o afuera)
  k.onClick(() => {
    if (input.isHovering()) {
      isFocused = true;
      input.outline.color = k.rgb(139, 92, 246); // Borde morado al enfocar
      if (textContent === "") textObj.text = ""; // Limpia placeholder
    } else {
      isFocused = false;
      input.outline.color = k.rgb(71, 85, 105); // Borde normal
      if (textContent === "") {
        textObj.text = placeholder; // Regresa placeholder
        textObj.color = k.rgb(148, 163, 184);
      }
    }
  });

  // Escribir texto
  k.onCharInput((ch) => {
    if (!isFocused) return;
    if (textContent.length < maxLength) {
      textContent += ch;
      textObj.text = textContent;
      textObj.color = k.rgb(255, 255, 255); // Texto blanco al escribir
    }
  });

  // Borrar texto
  k.onKeyPressRepeat("backspace", () => {
    if (!isFocused || textContent.length === 0) return;

    textContent = textContent.slice(0, -1);
    textObj.text = textContent;
  });

  return input;
}

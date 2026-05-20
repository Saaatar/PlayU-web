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

  const input = target.add([
    k.rect(150, 40, { radius: 8 }),
    k.pos(position),
    k.anchor("center"),
    k.color(30, 41, 59),
    k.outline(4, k.rgb(71, 85, 105)),
    k.area(),
    "ui-input",
    { getText: () => textContent },
  ]);

  const textObj = input.add([
    k.text(placeholder, { size: 15, font: "sans-serif" }),
    k.anchor("center"),
    k.color(148, 163, 184),
  ]);
  //configuracion de teclado para mobile
  const htmlInput = document.createElement("input");
  htmlInput.type = "text";

  htmlInput.style.position = "absolute";
  htmlInput.style.top = "0px";
  htmlInput.style.left = "0px";

  htmlInput.style.width = "0px";
  htmlInput.style.height = "0px";
  htmlInput.style.padding = "0px";
  htmlInput.style.border = "none";
  htmlInput.style.outline = "none";

  htmlInput.style.opacity = "0";
  htmlInput.style.color = "transparent";
  htmlInput.style.background = "transparent";
  htmlInput.style.pointerEvents = "none";
  htmlInput.style.zIndex = "-1";

  document.body.appendChild(htmlInput);

  input.onClick(() => {
    htmlInput.focus();

    input.use(k.outline(2, k.rgb(99, 102, 241)));
  });

  htmlInput.addEventListener("input", (e) => {
    const currentext = (e.target as HTMLInputElement).value;

    if (currentext === "") {
      textObj.text = placeholder;
      textObj.color = k.rgb(148, 163, 184);
    } else {
      textObj.text = currentext;
      textObj.color = k.rgb(255, 255, 255);
    }
  });

  k.onClick(() => {
    if (input.isHovering()) {
      isFocused = true;
      input.outline.color = k.rgb(139, 92, 246);
      if (textContent === "") textObj.text = "";
    } else {
      isFocused = false;
      input.outline.color = k.rgb(71, 85, 105);
      if (textContent === "") {
        textObj.text = placeholder;
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
      textObj.color = k.rgb(255, 255, 255);
    }
  });

  // Borrar texto
  k.onKeyPressRepeat("backspace", () => {
    if (!isFocused || textContent.length === 0) return;

    textContent = textContent.slice(0, -1);
    textObj.text = textContent;
  });

  htmlInput.addEventListener("blur", () => {
    input.use(k.outline(2, k.rgb(51, 65, 85)));
  });

  k.onSceneLeave(() => {
    htmlInput.remove();
  });
  return {
    getText: () => htmlInput.value,
  };
}

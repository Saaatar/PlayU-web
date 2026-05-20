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

  const htmlInput = document.createElement("input");
  htmlInput.type = "text";
  htmlInput.maxLength = maxLength;

  // CONFIGURACIÓN CLAVE PARA MÓVILES
  // El input debe tener un tamaño real para que el teclado no pierda el cursor
  htmlInput.style.position = "absolute";
  htmlInput.style.top = "-9999px"; // Lo enviamos muy lejos de la pantalla visible
  htmlInput.style.left = "-9999px";
  htmlInput.style.width = "10px"; // Tamaño mayor a 0
  htmlInput.style.height = "10px"; // Tamaño mayor a 0
  htmlInput.style.padding = "0px";
  htmlInput.style.border = "none";
  htmlInput.style.outline = "none";
  htmlInput.style.opacity = "0";
  htmlInput.style.color = "transparent";
  htmlInput.style.background = "transparent";
  htmlInput.style.pointerEvents = "none";
  htmlInput.style.zIndex = "-1";

  // Desactivamos todo el texto predictivo y autocorrección que rompen el cursor
  htmlInput.setAttribute("autocomplete", "off");
  htmlInput.setAttribute("autocorrect", "off");
  htmlInput.setAttribute("autocapitalize", "off");
  htmlInput.setAttribute("spellcheck", "false");

  document.body.appendChild(htmlInput);

  input.onClick(() => {
    htmlInput.focus();
    input.use(k.outline(2, k.rgb(99, 102, 241)));
  });

  htmlInput.addEventListener("input", (e) => {
    textContent = (e.target as HTMLInputElement).value;

    if (textContent === "") {
      textObj.text = placeholder;
      textObj.color = k.rgb(148, 163, 184);
    } else {
      textObj.text = textContent;
      textObj.color = k.rgb(255, 255, 255);
    }
  });

  k.onClick(() => {
    if (input.isHovering()) {
      input.outline.color = k.rgb(139, 92, 246);
      if (textContent === "") textObj.text = "";
    } else {
      htmlInput.blur();
      input.outline.color = k.rgb(71, 85, 105);
      if (textContent === "") {
        textObj.text = placeholder;
        textObj.color = k.rgb(148, 163, 184);
      }
    }
  });

  htmlInput.addEventListener("blur", () => {
    input.use(k.outline(2, k.rgb(51, 65, 85)));
  });

  k.onSceneLeave(() => {
    htmlInput.remove();
  });

  return {
    getText: () => textContent,
  };
}

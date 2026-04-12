import { KAPLAYCtx } from "kaplay";
import { GamepadConfig } from "../types/GamepadConfig";

const UI_CONFIG = {
  MARGIN_X: 130,
  MARGIN_Y: 130,
  DPAD_SPACING: 75,
  ACTION_BTN_SIZE: 35,
  OPACITY_IDLE: 0.5,
  OPACITY_ACTIVE: 0.8,
  DPAD_SPRITE_SCALE: 0.6,
  BUTTON_SPRITE_SCALE: 0.8,
};

function loadSpirtes(k: KAPLAYCtx) {
  k.loadSprite("up-arrow", "/iu-components/dpad/up-arrow.png");
  k.loadSprite("down-arrow", "/iu-components/dpad/down-arrow.png");
  k.loadSprite("left-arrow", "/iu-components/dpad/left-arrow.png");
  k.loadSprite("right-arrow", "/iu-components/dpad/rigth-arrow.png");
  k.loadSprite("primary-button", "/iu-components/buttons/primary-button.png");
  k.loadSprite("secondary-button", "/iu-components/buttons/secondary-button.png");
}

export function useVirtualGamepad(k: KAPLAYCtx, config: GamepadConfig) {
  loadSpirtes(k);

  const opacity = config.controlsOpacity ?? UI_CONFIG.OPACITY_IDLE;
  const target = config.targetTag ?? "player";
  const useKeyboard = config.enableKeyboard !== false;

  // --- D PAD ---
  if (config.showDPad) {
    const dpad = k.add([
      k.pos(UI_CONFIG.MARGIN_X, k.height() - UI_CONFIG.MARGIN_Y),
      k.fixed(),
      "dpad-controls",
    ]);

    const addArrow = (x: number, y: number, dir: string) => {
      const btn = dpad.add([
        k.sprite(`${dir}-arrow`),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.scale(UI_CONFIG.DPAD_SPRITE_SCALE),
        k.opacity(opacity),
        `${dir}-arrow`,
      ]);

      btn.onHoverUpdate(() => {
        if (k.isMouseDown()) {
          k.trigger(`move_${dir}`, target);
          btn.opacity = UI_CONFIG.OPACITY_ACTIVE;
        } else {
          btn.opacity = opacity;
        }
      });
    };

    const spacing = UI_CONFIG.DPAD_SPACING;
    addArrow(0, -spacing, "up");
    addArrow(0, spacing, "down");
    addArrow(-spacing, 0, "left");
    addArrow(spacing, 0, "right");

    if (useKeyboard) {
      k.onKeyDown("left", () => k.trigger("move_left", target));
      k.onKeyDown("right", () => k.trigger("move_right", target));
      k.onKeyDown("up", () => k.trigger("move_up", target));
      k.onKeyDown("down", () => k.trigger("move_down", target));
    }
  }

  // --- PRIMARY BUTTON (A) ---
  if (config.showPrimary) {
    const btnA = k.add([
      k.sprite("primary-button"),
      k.pos(k.width() - 80, k.height() - 150),
      k.anchor("center"),
      k.area(),
      k.scale(UI_CONFIG.BUTTON_SPRITE_SCALE),
      k.fixed(),
      k.opacity(opacity),
      "primary-button",
    ]);

    btnA.onHoverUpdate(() => {
      btnA.opacity = k.isMouseDown() ? UI_CONFIG.OPACITY_ACTIVE : opacity;
    });

    btnA.onClick(() => {
      k.trigger("primary_action", target);
    });

    if (useKeyboard) {
      k.onKeyPress("space", () => k.trigger("primary_action", target));
      k.onKeyPress("z", () => k.trigger("primary_action", target));
    }
  }

  // --- SECONDARY BUTTON (B) ---
  if (config.showSecondary) {
    const btnB = k.add([
      k.sprite("secondary-button"),
      k.pos(k.width() - 160, k.height() - 60),
      k.anchor("center"),
      k.area(),
      k.scale(UI_CONFIG.BUTTON_SPRITE_SCALE),
      k.fixed(),
      k.opacity(opacity),
      "secondary-button",
    ]);

    btnB.onHoverUpdate(() => {
      btnB.opacity = k.isMouseDown() ? UI_CONFIG.OPACITY_ACTIVE : opacity;
    });

    btnB.onClick(() => {
      k.trigger("secondary_action", target);
    });

    if (useKeyboard) {
      k.onKeyPress("x", () => k.trigger("secondary_action", target));
      k.onKeyPress("shift", () => k.trigger("secondary_action", target));
    }
  }
}

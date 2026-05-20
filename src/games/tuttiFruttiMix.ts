import type { KAPLAYCtx } from "kaplay";
import { mulberry32 } from "../utils/mulberry32";
import { Player } from "../types/Player";
import { socket } from "../services/sockets";
import { createTurnBanner } from "../components/turnBanner";
import { createTimerDisplay } from "../components/timerDisplay";
import { SocketEvents } from "../types/Socketevents";

// Función de barajado determinista
function shuffle<T>(arr: T[], randomFunc: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(randomFunc() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function registerTuttiFruttiMix(k: KAPLAYCtx) {
  k.loadSprite("apple_red", "/sprites/tutifruti/Apple_Red.png");
  k.loadSprite("banana", "/sprites/tutifruti/Banana.png");
  k.loadSprite("cherry", "/sprites/tutifruti/Cherry.png");
  k.loadSprite("lemon", "/sprites/tutifruti/Lemon.png");
  k.loadSprite("orange", "/sprites/tutifruti/Orange.png");
  k.loadSprite("pear", "/sprites/tutifruti/Pear.png");
  k.loadSprite("plum", "/sprites/tutifruti/Plum.png");
  k.loadSprite("watermelon", "/sprites/tutifruti/Watermelon.png");
  k.loadSprite("berry", "/sprites/tutifruti/Berry.png");
  k.loadSprite("apple_green", "/sprites/tutifruti/Apple_Green.png");
  k.loadSprite("apple_yellow", "/sprites/tutifruti/Apple_Yellow.png");
  k.loadSprite("lime", "/sprites/tutifruti/Lime.png");

  const fruitsName = [
    "apple_red",
    "banana",
    "cherry",
    "lemon",
    "lime",
    "berry",
    "apple_yellow",
    "orange",
  ];

  k.scene(
    "tutti-frutti",
    ({
      roomPlayers,
      seed,
      firstTurnId,
    }: {
      roomPlayers: Player[];
      seed: number;
      firstTurnId: string;
    }) => {
      // --- ESTADO DEL JUEGO ---
      const players = roomPlayers.map((p) => ({ id: p.id, username: p.username, score: 0 }));
      let currentTurnPlayerId = "";
      let localTimeLeft = 15;
      let isMyTurn = false;

      let locked = true; // Empieza bloqueado durante los 4s de memorización
      let matchedPairs = 0;

      const rng = mulberry32(seed);
      const frutasAleatorias = shuffle([...fruitsName], rng); // Posiciones del tablero
      const frutasOpcionesShuffle = shuffle([...fruitsName], rng); // Posiciones de los botones

      // --- COMPONENTES MULTIJUGADOR ---
      const playerInfoUI = k.add([k.pos(20, 10), "ui"]);
      const turnBannerComponent = createTurnBanner(k, players, socket.id);
      const timerComponent = createTimerDisplay(k, localTimeLeft);

      const updatePlayerInfoUI = () => {
        playerInfoUI.children.forEach((c) => c.destroy());
        let xPos = 20;

        players.forEach((p) => {
          const isActive = p.id === currentTurnPlayerId ? "→ " : "  ";
          const text = k.make([
            k.text(`${isActive}${p.username}: ${p.score}`, { size: 14 }),
            k.pos(xPos, 10),
            k.color(p.id === currentTurnPlayerId ? 255 : 200, 200, 200),
          ]);
          playerInfoUI.add(text);
          xPos += 150;
        });
      };

      const applyTurn = (playerId: string, timeout: number) => {
        currentTurnPlayerId = playerId;
        localTimeLeft = timeout;
        isMyTurn = socket.id === currentTurnPlayerId;

        turnBannerComponent.update(currentTurnPlayerId);
        timerComponent.updateTime(localTimeLeft);
        updatePlayerInfoUI();
      };

      // Reloj visual local
      k.onUpdate(() => {
        if (localTimeLeft > 0 && !locked) {
          localTimeLeft -= k.dt();
          timerComponent.updateTime(localTimeLeft);
        }
      });

      // --- DIBUJAR TABLERO ---
      const instruccion = k.add([
        k.text("¡MEMORIZA LAS POSICIONES!", { size: 32, font: "sans-serif" }),
        k.pos(k.width() * 0.5, k.height() * 0.2),
        k.anchor("center"),
        k.color(255, 200, 50),
      ]);

      const totalSlots = 8;
      const columnas = 4;
      const espaciadoX = k.width() * 0.12;
      const espaciadoY = k.height() * 0.25;
      const tamanoSlot = espaciadoX * 0.8;
      const centroDerecho = k.width() * 0.5;
      const startX = centroDerecho - (espaciadoX * (columnas - 1)) / 2;
      const startY = k.height() * 0.35;

      const slotEntities: any[] = [];
      const optionEntities: Record<string, any> = {};

      frutasAleatorias.forEach((fruta, index) => {
        const col = index % columnas;
        const fila = Math.floor(index / columnas);
        const posX = startX + col * espaciadoX;
        const posY = startY + fila * espaciadoY;

        const slot = k.add([
          k.rect(tamanoSlot, tamanoSlot, { radius: Math.max(4, tamanoSlot * 0.1) }),
          k.pos(posX, posY),
          k.anchor("center"),
          k.color(30, 40, 60),
          k.outline(3, k.rgb(70, 80, 110)),
          k.area(),
          "slot",
          { frutaCorrecta: fruta, index, ocupado: false },
        ]);

        slotEntities.push(slot);

        k.add([
          k.sprite(fruta),
          k.pos(posX, posY),
          k.anchor("center"),
          k.scale(tamanoSlot / 100),
          "fruta_memoria",
        ]);
      });

      // Inicializa el primer turno
      applyTurn(firstTurnId, 15);

      // --- FASE DE JUEGO (después de 4 segundos) ---
      k.wait(4, () => {
        instruccion.text = "¡ACOMODA LAS FRUTAS!";
        instruccion.color = k.rgb(50, 255, 50);
        k.destroyAll("fruta_memoria");

        locked = false; // Desbloqueamos interacciones

        const columnasIzquierda = 2;
        const espacioOpcX = k.width() * 0.1;
        const espacioOpcY = k.height() * 0.15;
        const centroIzquierdo = k.width() * 0.1;
        const startOpcionesX = centroIzquierdo - (espacioOpcX * (columnasIzquierda - 1)) / 2;
        const startOpcionesY = startY;

        frutasOpcionesShuffle.forEach((fruta, index) => {
          const col = index % columnasIzquierda;
          const fila = Math.floor(index / columnasIzquierda);
          const posX = startOpcionesX + col * espacioOpcX;
          const posY = startOpcionesY + fila * espacioOpcY;

          const option = k.add([
            k.sprite(fruta),
            k.pos(posX, posY),
            k.anchor("center"),
            k.scale(tamanoSlot / 100),
            k.area(),
            "fruta_jugable",
            { nombre: fruta },
          ]);

          optionEntities[fruta] = option;
        });
      });

      // --- EVENTOS LOCALES ---
      let selectFruit: any = null;

      k.onClick("fruta_jugable", (fruitClick) => {
        if (!isMyTurn || locked) return; // Solo puedes seleccionar si es tu turno

        if (selectFruit) selectFruit.scale = k.vec2(tamanoSlot / 100);
        selectFruit = fruitClick;
        selectFruit.scale = k.vec2((tamanoSlot / 100) * 1.3); // Hace zoom visual a la seleccionada
      });

      k.onClick("slot", (slotClick) => {
        if (!isMyTurn || locked || !selectFruit || slotClick.ocupado) return;

        // Emitimos la acción al backend en lugar de resolverlo localmente
        socket.emit("game:action", {
          action: "PLACE_FRUIT",
          fruitName: selectFruit.nombre,
          slotIndex: slotClick.index,
        });
      });

      // --- SINCRONIZACIÓN DE SOCKETS ---
      socket.on("game:turn_sync", (data: { activePlayerId: string; timeoutSeconds: number }) => {
        applyTurn(data.activePlayerId, data.timeoutSeconds);
      });

      socket.on("game:action", (data: any) => {
        if (data.action === "PLACE_FRUIT") {
          const targetSlot = slotEntities[data.slotIndex];
          const optionFruit = optionEntities[data.fruitName];

          if (targetSlot.frutaCorrecta === data.fruitName) {
            // ACIERTO
            targetSlot.ocupado = true;

            if (optionFruit) {
              optionFruit.pos = targetSlot.pos;
              optionFruit.scale = k.vec2(tamanoSlot / 100);
              optionFruit.unuse("area"); // Deshabilita clics
            }

            k.add([
              k.text("BIEN", { size: 40 }),
              k.pos(targetSlot.pos.x + 30, targetSlot.pos.y - 30),
              k.opacity(1),
              k.lifespan(1, { fade: 0.5 }),
            ]);

            // Suma de puntos
            const playerIndex = players.findIndex((p) => p.id === data.playerId);
            if (playerIndex !== -1) {
              players[playerIndex].score++;
              updatePlayerInfoUI();
            }

            matchedPairs++;

            if (selectFruit && selectFruit.nombre === data.fruitName) selectFruit = null;

            // Verificar condición de fin de juego
            if (matchedPairs === fruitsName.length) {
              if (isMyTurn) {
                const finalScores: Record<string, number> = {};
                players.forEach((p) => {
                  finalScores[p.id] = p.score;
                });
                socket.emit(SocketEvents.GAME_END_MINI, { scores: finalScores });
              }
            } else {
              // Gana el turno (no lo pasa)
              if (isMyTurn) socket.emit("game:end_turn", { passTurn: false });
            }
          } else {
            // ERROR
            k.shake(5);

            k.add([
              k.text("MAL", { size: 60 }),
              k.pos(targetSlot.pos),
              k.anchor("center"),
              k.opacity(1),
              k.lifespan(0.5, { fade: 0.2 }),
            ]);

            if (selectFruit) {
              selectFruit.scale = k.vec2(tamanoSlot / 100);
              selectFruit = null;
            }

            // Pierde el turno
            if (isMyTurn) socket.emit("game:end_turn", { passTurn: true });
          }
        }
      });

      k.onSceneLeave(() => {
        socket.off("game:turn_sync");
        socket.off("game:action");

        turnBannerComponent.destroy();
        timerComponent.destroy();
      });
    }
  );
}
